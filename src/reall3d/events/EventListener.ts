// ==============================================
// Copyright (c) 2025 reall3d.com, MIT license
// ==============================================
import { Matrix4, PerspectiveCamera, Vector3, Scene } from 'three';
import { Events } from './Events';
import {
    GetCanvas,
    EventListenerDispose,
    StopAutoRotate,
    GetOptions,
    StartAutoRotate,
    GetRenderer,
    GetCamera,
    KeyActionCheckAndExecute,
    SplatMeshSwitchDisplayMode,
    SplatUpdatePointMode,
    RotateAt,
    RotateLeft,
    RotateRight,
    RaycasterRayIntersectPoints,
    CameraSetLookAt,
    SelectPointAndLookAt,
    ControlPlaneSwitchVisible,
    GetCanvasSize,
    GetControls,
    ViewerNeedUpdate,
    ControlsUpdateRotateAxis,
    GetScene,
    SplatSetPointcloudMode,
    SplatSwitchDisplayMode,
    IsControlPlaneVisible,
    SplatUpdateLightFactor,
    SelectMarkPoint,
    SplatUpdateMarkPoint,
    ClearMarkPoint,
    GetCSS3DRenderer,
    RaycasterRayDistanceToPoint,
    MarkUpdateVisible,
    MetaSaveSmallSceneCameraInfo,
    MarkFinish,
    CancelCurrentMark,
    Flying,
    FlyDisable,
    AddFlyPosition,
    ClearFlyPosition,
    PrintInfo,
    GetSplatMesh,
    OnViewerUpdate,
    FocusAabbCenter,
    GetAabbCenter,
} from './EventConstants';
import { Reall3dViewerOptions } from '../viewer/Reall3dViewerOptions';
import { SplatMesh } from '../meshs/splatmesh/SplatMesh';
import { CameraControls } from '../controls/CameraControls';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { MarkDistanceLine } from '../meshs/mark/MarkDistanceLine';
import { MarkMultiLines } from '../meshs/mark/MarkMultiLines';
import { MarkSinglePoint } from '../meshs/mark/MarkSinglePoint';
import { MarkMultiPlans } from '../meshs/mark/MarkMulitPlans';
import { MarkCirclePlan } from '../meshs/mark/MarkCirclePlan';

class MouseState {
    public down: number = 0;
    public move: boolean = false;
    public downTime: number = 0;
    public isDbClick: boolean = false;
    public x: number = 0;
    public y: number = 0;
    public lastClickX: number = 0;
    public lastClickY: number = 0;
    public lastClickPointTime: number = 0;
    public lastMovePoint: Vector3 = null;
    public lastMovePointTime: number = 0;
}

export function setupEventListener(events: Events) {
    const on = (key: number, fn?: Function, multiFn?: boolean): Function | Function[] => events.on(key, fn, multiFn);
    const fire = (key: number, ...args: any): any => events.fire(key, ...args);
    const canvas: HTMLCanvasElement = fire(GetCanvas);
    let keySet: Set<string> = new Set();

    let disposed: boolean;
    let mouseState: MouseState = new MouseState();
    let lastActionTome: number;

    on(StartAutoRotate, () => {
        fire(GetControls).autoRotate = fire(GetOptions).autoRotate = true;
    });
    on(StopAutoRotate, (flyDisable: boolean = true) => {
        fire(GetControls).autoRotate = fire(GetOptions).autoRotate = false;
        flyDisable && fire(FlyDisable);
    });

    on(RotateAt, (rotateLeft: boolean = true) => {
        if (disposed) return;
        const controls: CameraControls = fire(GetControls);
        const angle = rotateLeft ? Math.PI / 128 : -(Math.PI / 128);
        const matrix4: Matrix4 = new Matrix4().makeRotationAxis(new Vector3(0, 0, -1).transformDirection(controls.object.matrixWorld), angle);
        controls.object.up.transformDirection(matrix4);
        fire(ViewerNeedUpdate);
    });
    on(RotateLeft, () => {
        if (disposed) return;
        events.fire(RotateAt, true);
    });
    on(RotateRight, () => {
        if (disposed) return;
        events.fire(RotateAt, false);
    });

    on(SplatSetPointcloudMode, (isPointcloudMode?: boolean) => {
        const opts: Reall3dViewerOptions = fire(GetOptions);
        isPointcloudMode ??= !opts.pointcloudMode;
        opts.pointcloudMode = isPointcloudMode;
        const scene: Scene = fire(GetScene);
        scene.traverse((obj: any) => obj instanceof SplatMesh && (obj as SplatMesh).fire(SplatUpdatePointMode, isPointcloudMode));
    });
    on(SplatSwitchDisplayMode, () => {
        const scene: Scene = fire(GetScene);
        scene.traverse((obj: any) => obj instanceof SplatMesh && (obj as SplatMesh).fire(SplatMeshSwitchDisplayMode));
    });
    on(SplatUpdateLightFactor, (lightFactor: number) => {
        const scene: Scene = fire(GetScene);
        scene.traverse((obj: any) => obj instanceof SplatMesh && (obj as SplatMesh).fire(SplatUpdateLightFactor, lightFactor));
    });
    on(FocusAabbCenter, () => {
        const scene: Scene = fire(GetScene);
        let splat: SplatMesh;
        scene.traverse((obj: any) => obj instanceof SplatMesh && (splat = obj));
        splat && fire(CameraSetLookAt, splat.fire(GetAabbCenter));
    });

    on(KeyActionCheckAndExecute, () => {
        if (!keySet.size) return;

        const opts: Reall3dViewerOptions = fire(GetOptions);
        if (!opts.enableKeyboard) return keySet.clear();

        if (opts.markMode && keySet.has('Escape')) {
            fire(CancelCurrentMark);
            keySet.clear();
            return;
        }

        if (keySet.has('Space')) {
            opts.bigSceneMode ? fire(SplatSetPointcloudMode) : fire(SplatSwitchDisplayMode);
            keySet.clear();
        } else if (keySet.has('KeyR')) {
            opts.autoRotate ? fire(StopAutoRotate) : fire(StartAutoRotate);
            keySet.clear();
        } else if (keySet.has('KeyM')) {
            fire(MarkUpdateVisible, !opts.markVisible);
            keySet.clear();
        } else if (keySet.has('ArrowLeft')) {
            fire(RotateLeft);
            fire(ControlPlaneSwitchVisible, true);
            keySet.clear();
        } else if (keySet.has('ArrowRight')) {
            fire(RotateRight);
            fire(ControlPlaneSwitchVisible, true);
            keySet.clear();
        } else if (keySet.has('KeyP')) {
            fire(Flying, true);
            keySet.clear();
        } else if (keySet.has('Equal')) {
            fire(AddFlyPosition);
            keySet.clear();
        } else if (keySet.has('Minus')) {
            fire(ClearFlyPosition);
            keySet.clear();
        } else if (keySet.has('KeyY')) {
            fire(MetaSaveSmallSceneCameraInfo);
            keySet.clear();
        } else if (keySet.has('KeyI')) {
            fire(PrintInfo);
            keySet.clear();
        } else if (keySet.has('KeyF')) {
            fire(FocusAabbCenter);
            keySet.clear();
        } else if (keySet.has('F2')) {
            !opts.bigSceneMode && window.open('/editor/index.html?url=' + encodeURIComponent((fire(GetSplatMesh) as SplatMesh).meta.url));
            keySet.clear();
        }
    });

    on(SelectPointAndLookAt, async (x: number, y: number) => {
        if (mouseState.move) return; // 鼠标有移动时忽略
        const rs: Vector3[] = await fire(RaycasterRayIntersectPoints, x, y);
        if (rs.length) {
            fire(CameraSetLookAt, rs[0], true);
        }
    });

    on(SelectMarkPoint, async (x: number, y: number) => {
        const scene: Scene = fire(GetScene);
        const splats: SplatMesh[] = [];
        scene.traverse(child => child instanceof SplatMesh && splats.push(child));

        const rs: Vector3[] = await fire(RaycasterRayIntersectPoints, x, y);
        if (rs.length) {
            splats.length && splats[0].fire(SplatUpdateMarkPoint, rs[0].x, rs[0].y, rs[0].z, true);
            return new Vector3(rs[0].x, rs[0].y, rs[0].z);
        } else {
            splats.length && splats[0].fire(SplatUpdateMarkPoint, 0, 0, 0, false);
        }
        return null;
    });

    on(ClearMarkPoint, async () => {
        const scene: Scene = fire(GetScene);
        const splats: SplatMesh[] = [];
        scene.traverse(child => child instanceof SplatMesh && splats.push(child));
        for (let i = 0; i < splats.length; i++) {
            splats[i].fire(SplatUpdateMarkPoint, 0, 0, 0, false);
        }
    });

    const keydownEventListener = (e: KeyboardEvent) => {
        if (e.target['type'] === 'text') return;

        if (disposed || e.code === 'F5') return;
        e.preventDefault();
        if (e.code !== 'KeyR') {
            keySet.add(e.code);
            fire(StopAutoRotate);
        }
        lastActionTome = Date.now();
    };

    const keyupEventListener = (e: KeyboardEvent) => {
        if (e.target['type'] === 'text') return;

        if (disposed) return;
        e.code === 'KeyR' && keySet.add(e.code);
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            fire(ControlsUpdateRotateAxis);
        }
        lastActionTome = Date.now();
    };

    on(
        OnViewerUpdate,
        () => {
            if (fire(IsControlPlaneVisible) && Date.now() - lastActionTome > 2000) {
                fire(ControlPlaneSwitchVisible, false);
                // 旋转轴调整后 2 秒内无操作，自动保存相机位置
                fire(MetaSaveSmallSceneCameraInfo);
            }
        },
        true,
    );

    const blurEventListener = () => {
        keySet.clear();
    };

    const wheelEventListener = (e: MouseEvent) => {
        parent && setTimeout(() => window.focus());
        e.preventDefault();
        if (disposed) return;
        fire(StopAutoRotate);
        lastActionTome = Date.now();
    };

    const canvasContextmenuEventListener = (e: MouseEvent) => {
        e.preventDefault();
        if (disposed) return;
        fire(StopAutoRotate);
        lastActionTome = Date.now();
    };

    let markDistanceLine: MarkDistanceLine;
    let markMultiLines: MarkMultiLines;
    let markMultiPlans: MarkMultiPlans;
    let markCirclePlan: MarkCirclePlan;

    on(CancelCurrentMark, () => {
        markDistanceLine?.dispose();
        markMultiLines?.dispose();
        markMultiPlans?.dispose();
        markCirclePlan?.dispose();
        markDistanceLine = null;
        markMultiLines = null;
        markMultiPlans = null;
        markCirclePlan = null;
        mouseState.lastMovePoint = null;
        fire(MarkFinish);
    });

    const canvasMousedownEventListener = async (e: MouseEvent) => {
        parent && setTimeout(() => window.focus());
        e.preventDefault();
        if (disposed) return;
        fire(StopAutoRotate);

        mouseState.down = e.button === 2 ? 2 : 1;
        mouseState.move = false;
        mouseState.isDbClick = Date.now() - mouseState.downTime < 300;

        lastActionTome = Date.now();
        mouseState.downTime = Date.now();
    };

    const canvasMousemoveEventListener = async (e: MouseEvent) => {
        e.preventDefault();
        if (disposed) return;

        if (mouseState.down) {
            mouseState.move = true;
            lastActionTome = Date.now();
        }

        const opts: Reall3dViewerOptions = fire(GetOptions);
        if (opts.markMode) {
            const point: Vector3 = await fire(SelectMarkPoint, e.clientX, e.clientY); // 显示提示点
            if (point && !mouseState.down && opts.markType === 'distance' && markDistanceLine) {
                markDistanceLine.drawUpdate({ endPoint: point.toArray() });
            } else if (!mouseState.down && opts.markType === 'circle' && markCirclePlan) {
                if (point) {
                    markCirclePlan.drawUpdate(null, true, point);
                    mouseState.lastMovePoint = point;
                    mouseState.lastMovePointTime = Date.now();
                } else {
                    mouseState.lastMovePoint = null;
                    mouseState.lastMovePointTime = 0;
                }
            } else if (!mouseState.down && opts.markType === 'lines' && markMultiLines) {
                if (point) {
                    markMultiLines.drawUpdate(null, true, point);
                    mouseState.lastMovePoint = point;
                    mouseState.lastMovePointTime = Date.now();
                } else {
                    mouseState.lastMovePoint = null;
                    mouseState.lastMovePointTime = 0;
                }
            } else if (!mouseState.down && opts.markType === 'plans' && markMultiPlans) {
                if (point) {
                    markMultiPlans.drawUpdate(null, true, point);
                    mouseState.lastMovePoint = point;
                    mouseState.lastMovePointTime = Date.now();
                } else {
                    mouseState.lastMovePoint = null;
                    mouseState.lastMovePointTime = 0;
                }
            }
            // fire(ViewerNeedUpdate);
        }
    };

    const canvasMouseupEventListener = async (e: MouseEvent) => {
        e.preventDefault();
        if (disposed) return;
        const opts: Reall3dViewerOptions = fire(GetOptions);

        if (mouseState.isDbClick) {
            // 双击停止标注
            if (markMultiLines) {
                if (Math.abs(e.clientX - mouseState.lastClickX) < 2 && Math.abs(e.clientY - mouseState.lastClickY) < 2) {
                    // 两次双击的屏幕距离差小于2，则判定为停止标注的有效双击
                    markMultiLines.drawFinish(mouseState.lastClickPointTime > 0);
                    markMultiLines = null;
                    mouseState.lastMovePoint = null;
                }
            } else if (markMultiPlans) {
                if (Math.abs(e.clientX - mouseState.lastClickX) < 2 && Math.abs(e.clientY - mouseState.lastClickY) < 2) {
                    // 两次双击的屏幕距离差小于2，则判定为停止标注的有效双击
                    markMultiPlans.drawFinish(mouseState.lastClickPointTime > 0);
                    markMultiPlans = null;
                    mouseState.lastMovePoint = null;
                }
            }
        }

        if (opts.markMode) {
            if (mouseState.down === 1 && !mouseState.move && Date.now() - mouseState.downTime < 500) {
                if (opts.markType === 'point') {
                    const point: Vector3 = await fire(SelectMarkPoint, e.clientX, e.clientY);
                    if (point) {
                        const markSinglePoint = new MarkSinglePoint(events, await fire(SelectMarkPoint, e.clientX, e.clientY));
                        fire(GetScene).add(markSinglePoint);
                        markSinglePoint.drawFinish();
                    }
                } else if (opts.markType === 'distance') {
                    if (!markDistanceLine) {
                        // 开始测量
                        const point: Vector3 = await fire(SelectMarkPoint, e.clientX, e.clientY);
                        if (point) {
                            markDistanceLine = new MarkDistanceLine(events);
                            markDistanceLine.drawStart(point);
                            fire(GetScene).add(markDistanceLine);
                        }
                    } else {
                        // 完成测量
                        const point: Vector3 = await fire(SelectMarkPoint, e.clientX, e.clientY);
                        if (point) {
                            markDistanceLine.drawFinish(point);
                            markDistanceLine = null;
                        } else {
                            mouseState.isDbClick && fire(CancelCurrentMark); // 取消标记
                        }
                    }
                } else if (opts.markType === 'lines') {
                    if (!markMultiLines) {
                        // 开始
                        const point: Vector3 = await fire(SelectMarkPoint, e.clientX, e.clientY);
                        if (point) {
                            markMultiLines = new MarkMultiLines(events);
                            markMultiLines.drawStart(point);
                            fire(GetScene).add(markMultiLines);
                        }
                    } else {
                        // 继续
                        if (mouseState.lastMovePoint && fire(RaycasterRayDistanceToPoint, e.clientX, e.clientY, mouseState.lastMovePoint) < 0.03) {
                            // 点击位置与移动提示点相近，按选中提示点处理
                            markMultiLines.drawUpdate(null, true, mouseState.lastMovePoint, true);
                            mouseState.lastClickPointTime = Date.now();
                        } else {
                            // 按点击位置计算选点
                            const point: Vector3 = await fire(SelectMarkPoint, e.clientX, e.clientY);
                            if (point) {
                                markMultiLines.drawUpdate(null, true, point, true);
                                mouseState.lastClickPointTime = Date.now();
                            } else {
                                mouseState.lastClickPointTime = 0;
                            }
                        }
                    }
                } else if (opts.markType === 'plans') {
                    if (!markMultiPlans) {
                        // 开始
                        const point: Vector3 = await fire(SelectMarkPoint, e.clientX, e.clientY);
                        if (point) {
                            markMultiPlans = new MarkMultiPlans(events);
                            markMultiPlans.drawStart(point);
                            fire(GetScene).add(markMultiPlans);
                        }
                    } else {
                        // 继续
                        if (mouseState.lastMovePoint && fire(RaycasterRayDistanceToPoint, e.clientX, e.clientY, mouseState.lastMovePoint) < 0.03) {
                            // 点击位置与移动提示点相近，按选中提示点处理
                            markMultiPlans.drawUpdate(null, true, mouseState.lastMovePoint, true);
                            mouseState.lastClickPointTime = Date.now();
                        } else {
                            // 按点击位置计算选点
                            const point: Vector3 = await fire(SelectMarkPoint, e.clientX, e.clientY);
                            if (point) {
                                markMultiPlans.drawUpdate(null, true, point, true);
                                mouseState.lastClickPointTime = Date.now();
                            } else {
                                mouseState.lastClickPointTime = 0;
                            }
                        }
                    }
                } else if (opts.markType === 'circle') {
                    if (!markCirclePlan) {
                        // 开始
                        const point: Vector3 = await fire(SelectMarkPoint, e.clientX, e.clientY);
                        if (point) {
                            markCirclePlan = new MarkCirclePlan(events);
                            markCirclePlan.drawStart(point);
                            fire(GetScene).add(markCirclePlan);
                        }
                    } else {
                        // 完成
                        const point: Vector3 = await fire(SelectMarkPoint, e.clientX, e.clientY);
                        if (point) {
                            markCirclePlan.drawFinish(point);
                            markCirclePlan = null;
                        } else {
                            mouseState.isDbClick && fire(CancelCurrentMark); // 取消标记
                        }
                    }
                }

                mouseState.lastClickX = e.clientX;
                mouseState.lastClickY = e.clientY;
            }
        }

        mouseState.down === 2 && !mouseState.move && fire(SelectPointAndLookAt, e.clientX, e.clientY); // 右击不移动，调整旋转中心

        mouseState.down = 0;
        mouseState.move = false;
        lastActionTome = Date.now();
    };

    function canvasTouchstartEventListener(event: TouchEvent) {
        event.preventDefault();
        if (disposed) return;
        fire(StopAutoRotate);
        mouseState.down = event.touches.length;
        if (mouseState.down === 1) {
            mouseState.move = false;
            mouseState.x = event.touches[0].clientX;
            mouseState.y = event.touches[0].clientY;
        }
    }
    function canvasTouchmoveEventListener(event: TouchEvent) {
        if (event.touches.length === 1) {
            mouseState.move = true;
        }
    }
    function canvasTouchendEventListener(event: TouchEvent) {
        if (mouseState.down === 1 && !mouseState.move) {
            fire(SelectPointAndLookAt, mouseState.x, mouseState.y);
        }
    }

    window.addEventListener('keydown', keydownEventListener);
    window.addEventListener('keyup', keyupEventListener);
    window.addEventListener('blur', blurEventListener);
    window.addEventListener('wheel', wheelEventListener, { passive: false });
    canvas.addEventListener('contextmenu', canvasContextmenuEventListener);
    canvas.addEventListener('mousedown', canvasMousedownEventListener);
    canvas.addEventListener('mousemove', canvasMousemoveEventListener);
    canvas.addEventListener('mouseup', canvasMouseupEventListener);
    canvas.addEventListener('touchstart', canvasTouchstartEventListener, { passive: false });
    canvas.addEventListener('touchmove', canvasTouchmoveEventListener, { passive: false });
    canvas.addEventListener('touchend', canvasTouchendEventListener, { passive: false });

    window.addEventListener('resize', resize);
    resize();
    function resize() {
        const { width, height, top, left } = fire(GetCanvasSize);
        const camera: PerspectiveCamera = fire(GetCamera);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        const cSS3DRenderer: CSS3DRenderer = fire(GetCSS3DRenderer);
        cSS3DRenderer.setSize(width, height);
        cSS3DRenderer.domElement.style.position = 'absolute';
        cSS3DRenderer.domElement.style.left = `${left}px`;
        cSS3DRenderer.domElement.style.top = `${top}px`;
        const renderer = fire(GetRenderer);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setSize(width, height);
    }

    on(EventListenerDispose, () => {
        disposed = true;
        window.removeEventListener('keydown', keydownEventListener);
        window.removeEventListener('keyup', keyupEventListener);
        window.removeEventListener('blur', blurEventListener);
        window.removeEventListener('wheel', wheelEventListener);
        canvas.removeEventListener('contextmenu', canvasContextmenuEventListener);
        canvas.removeEventListener('mousedown', canvasMousedownEventListener);
        canvas.removeEventListener('mousemove', canvasMousemoveEventListener);
        canvas.removeEventListener('mouseup', canvasMouseupEventListener);
        canvas.removeEventListener('touchstart', canvasTouchstartEventListener);
        canvas.removeEventListener('touchmove', canvasTouchmoveEventListener);
        canvas.removeEventListener('touchend', canvasTouchendEventListener);
        window.removeEventListener('resize', resize);
    });
}
