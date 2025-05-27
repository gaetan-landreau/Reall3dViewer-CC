// ==============================================
// Copyright (c) 2025 reall3d.com, MIT license
// ==============================================
import { PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { Events } from '../events/Events';
import {
    ComputeFps,
    GetFpsReal,
    CountFpsReal,
    Vector3ToString,
    CountFpsDefault,
    GetFpsDefault,
    Information,
    IsDebugMode,
    ViewerUtilsDispose,
    OnViewerBeforeUpdate,
    ControlsUpdate,
    OnViewerUpdate,
    ViewerDispose,
    GetCameraFov,
    GetCameraPosition,
    GetCameraLookAt,
    GetCameraLookUp,
} from '../events/EventConstants';
import { SplatMeshOptions } from '../meshs/splatmesh/SplatMeshOptions';
import { Reall3dViewerOptions } from '../viewer/Reall3dViewerOptions';

export function setupViewerUtils(events: Events) {
    let disposed: boolean = false;
    const on = (key: number, fn?: Function, multiFn?: boolean): Function | Function[] => events.on(key, fn, multiFn);
    const fire = (key: number, ...args: any): any => events.fire(key, ...args);

    on(ViewerUtilsDispose, () => (disposed = true));

    const fpsMap: Map<number, any> = new Map();
    const fpsRealMap: Map<number, any> = new Map();
    on(CountFpsDefault, () => fire(IsDebugMode) && fpsMap.set(Date.now(), 1));
    on(GetFpsDefault, () => fire(IsDebugMode) && fire(ComputeFps, fpsMap));
    on(CountFpsReal, () => fire(IsDebugMode) && fpsRealMap.set(Date.now(), 1));
    on(GetFpsReal, () => fire(IsDebugMode) && fire(ComputeFps, fpsRealMap));
    on(
        OnViewerUpdate,
        () => {
            if (disposed) return;
            fire(CountFpsReal);
            fire(IsDebugMode) &&
                fire(Information, {
                    fov: fire(GetCameraFov),
                    position: fire(Vector3ToString, fire(GetCameraPosition)),
                    lookAt: fire(Vector3ToString, fire(GetCameraLookAt)),
                    lookUp: fire(Vector3ToString, fire(GetCameraLookUp)),
                });
        },
        true,
    );

    let iRender: number = 0;
    on(
        OnViewerBeforeUpdate,
        () => {
            if (disposed) return;
            fire(ControlsUpdate);
            if (fire(IsDebugMode)) {
                fire(CountFpsDefault);
                !(iRender++ % 5) && fire(Information, { fps: fire(GetFpsDefault), realFps: fire(GetFpsReal) });
            }
        },
        true,
    );

    on(ComputeFps, (map: Map<number, any>) => {
        let dels: number[] = [];
        let now: number = Date.now();
        let rs: number = 0;
        for (const key of map.keys()) {
            now - key <= 1000 ? rs++ : dels.push(key);
        }
        dels.forEach(key => map.delete(key));
        return Math.min(rs, 30);
    });

    window.addEventListener('beforeunload', () => fire(ViewerDispose));
}

export function initSplatMeshOptions(options: SplatMeshOptions): SplatMeshOptions {
    const opts: SplatMeshOptions = { ...options };

    // 默认参数校验设定
    opts.bigSceneMode ??= false;
    opts.pointcloudMode ??= !opts.bigSceneMode; // 小场景默认点云模式，大场景默认正常模式
    opts.lightFactor ??= 1.0;
    opts.name ??= '';
    opts.showWatermark ??= true;

    return opts;
}

export function initGsViewerOptions(options: Reall3dViewerOptions): Reall3dViewerOptions {
    const opts: Reall3dViewerOptions = { ...options };

    // 默认参数校验设定
    opts.position = opts.position ? [...opts.position] : [0, -5, 15];
    opts.lookAt = opts.lookAt ? [...opts.lookAt] : [0, 0, 0];
    opts.lookUp = opts.lookUp ? [...opts.lookUp] : [0, -1, 0];
    opts.fov ??= 45;
    opts.near ??= 0.1;
    opts.far ??= 1000;
    opts.enableDamping ??= true;
    opts.autoRotate ??= true;
    opts.enableZoom ??= true;
    opts.enableRotate ??= true;
    opts.enablePan ??= true;
    opts.enableKeyboard ??= false;
    opts.bigSceneMode ??= false;
    opts.pointcloudMode ??= !opts.bigSceneMode; // 小场景默认点云模式，大场景默认正常模式
    opts.lightFactor ??= 1.1;
    opts.maxRenderCountOfMobile ??= opts.bigSceneMode ? 256 * 10000 : (256 + 128) * 10240;
    opts.maxRenderCountOfPc ??= opts.bigSceneMode ? (256 + 64) * 10000 : (256 + 128) * 10000;
    opts.debugMode ??= location.protocol === 'http:' || /^test\./.test(location.host); // 生产环境不开启
    opts.markMode ??= false;
    opts.markVisible ??= true;
    opts.meterScale ??= 1;

    return opts;
}

export function initRenderer(opts: Reall3dViewerOptions): WebGLRenderer {
    let root: HTMLElement;
    if (opts.root) {
        root = typeof opts.root === 'string' ? document.querySelector(opts.root) || document.querySelector('#gsviewer') : opts.root;
    } else {
        root = document.querySelector('#gsviewer');
    }
    if (!root) {
        root = document.createElement('div');
        root.id = 'gsviewer';
        document.body.appendChild(root);
    }

    let canvas: HTMLCanvasElement = document.querySelector('#gsviewer-canvas') || undefined;
    let renderer = null;
    if (!opts.renderer) {
        renderer = new WebGLRenderer({ canvas, antialias: false, stencil: true, logarithmicDepthBuffer: true, precision: 'highp' });
        renderer.setSize(root.clientWidth, root.clientHeight);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        opts.renderer = renderer;
    } else {
        renderer = opts.renderer;
    }

    canvas = renderer.domElement;
    canvas.id = 'gsviewer-canvas';
    root.appendChild(renderer.domElement);
    return renderer;
}

export function initCamera(opts: Reall3dViewerOptions): PerspectiveCamera {
    let camera = opts.camera;
    if (!camera) {
        const canvas: HTMLCanvasElement = opts.renderer.domElement;
        const aspect = canvas.width / canvas.height;
        let lookUp: Vector3 = new Vector3().fromArray(opts.lookUp);
        let lookAt: Vector3 = new Vector3().fromArray(opts.lookAt);
        let position = new Vector3().fromArray(opts.position);

        camera = new PerspectiveCamera(opts.fov, aspect, opts.near, opts.far);
        camera.position.copy(position);
        camera.up.copy(lookUp).normalize();
        camera.lookAt(lookAt);
        opts.camera = camera;
    }
    return opts.camera;
}

export function copyGsViewerOptions(gsViewerOptions: Reall3dViewerOptions): SplatMeshOptions {
    const { renderer, scene } = gsViewerOptions;
    const opts: SplatMeshOptions = { renderer, scene };
    opts.viewerEvents = gsViewerOptions.viewerEvents;
    opts.debugMode = gsViewerOptions.debugMode;
    opts.renderer = gsViewerOptions.renderer;
    opts.scene = gsViewerOptions.scene;
    opts.controls = gsViewerOptions.controls;
    opts.bigSceneMode = gsViewerOptions.bigSceneMode;
    opts.pointcloudMode = gsViewerOptions.pointcloudMode;
    opts.maxRenderCountOfMobile = gsViewerOptions.maxRenderCountOfMobile;
    opts.maxRenderCountOfPc = gsViewerOptions.maxRenderCountOfPc;
    opts.lightFactor = gsViewerOptions.lightFactor;
    opts.shDegree = gsViewerOptions.shDegree;

    return opts;
}
