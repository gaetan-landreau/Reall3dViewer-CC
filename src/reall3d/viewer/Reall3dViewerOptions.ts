// ==============================================
// Copyright (c) 2025 reall3d.com, MIT license
// ==============================================
import { PerspectiveCamera, Renderer, Scene } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Events } from '../events/Events';

/**
 * 高斯网格配置项
 */
export interface Reall3dViewerOptions {
    /**
     *  指定渲染器对象传入使用，未定义时自动生成
     */
    renderer?: Renderer | undefined;

    /**
     *  指定场景对象传入使用，未定义时自动生成
     */
    scene?: Scene | undefined;

    /**
     *  指定相机对象传入使用，未定义时自动生成
     */
    camera?: PerspectiveCamera | undefined;

    /**
     *  控制器
     */
    controls?: OrbitControls;

    /**
     *  渲染器事件管理器
     */
    viewerEvents?: Events | undefined;

    /**
     *  是否调试模式，生产环境默认false
     */
    debugMode?: boolean | undefined;

    /**
     * 是否大场景模式，初始化后不可修改
     */
    bigSceneMode?: boolean;

    /**
     * 是否点云模式渲染，默认为true
     * 支持通过viewer.options()动态更新
     */
    pointcloudMode?: boolean | undefined;

    /**
     * 移动端可渲染的高斯点数量限制
     * 支持通过viewer.options()动态更新
     */
    maxRenderCountOfMobile?: number | undefined;

    /**
     * PC端可渲染的高斯点数量限制
     * 支持通过viewer.options()动态更新
     */
    maxRenderCountOfPc?: number | undefined;

    /**
     * 颜色亮度系数，默认1.1
     */
    lightFactor?: number | undefined;

    /**
     *  容器元素或其选择器，默认选择器为'#gsviewer'，自动创建画布时若找不到容器节点，将在body下自动创建容器
     */
    root?: HTMLElement | string | undefined;

    /**
     * 相机视场，默认 45
     */
    fov?: number | undefined;

    /**
     * 相机近截面距离，默认 0.1
     */
    near?: number | undefined;

    /**
     * 相机远截面距离，默认 1000
     */
    far?: number | undefined;

    /**
     * 相机位置，默认 [0, -5, 15]
     */
    position?: number[] | undefined;

    /**
     * 相机注视点，默认 [0, 0, 0]
     */
    lookAt?: number[] | undefined;

    /**
     * 相机上向量，默认 [0, -1, 0]
     */
    lookUp?: number[] | undefined;

    /**
     * 是否自动旋转，默认true
     * 支持通过viewer.options()动态更新
     */
    autoRotate?: boolean | undefined;

    /**
     * 是否启用阻尼效果，默认true
     */
    enableDamping?: boolean | undefined;

    /**
     * 是否允许操作缩放，默认true
     */
    enableZoom?: boolean | undefined;

    /**
     * 是否允许操作旋转，默认true
     */
    enableRotate?: boolean | undefined;

    /**
     * 是否允许操作拖动，默认true
     */
    enablePan?: boolean | undefined;

    /**
     * 最小视距
     */
    minDistance?: number | undefined;

    /**
     * 最大视距
     */
    maxDistance?: number | undefined;

    /**
     * 最小倾斜角度
     */
    minPolarAngle?: number | undefined;

    /**
     * 最大倾斜角度
     */
    maxPolarAngle?: number | undefined;

    /**
     * 是否允许键盘操作，默认true
     */
    enableKeyboard?: boolean | undefined;

    /**
     * 标注模式，默认false
     */
    markMode?: boolean | undefined;

    /**
     * 标注类型（点、线、面、距离、面积、圆），默认undefined
     */
    markType?: 'point' | 'lines' | 'plans' | 'distance' | 'area' | 'circle' | undefined;

    /**
     * 标注是否显示，默认true
     */
    markVisible?: boolean | undefined;

    /**
     * 米单位比例尺（1单位长度等于多少米），默认1
     */
    meterScale?: number | undefined;

    /**
     * 是否禁止直接拖拽本地文件进行查看，默认false
     */
    disableDropLocalFile?: boolean | undefined;

    /**
     * 球谐系数的渲染级别，默认为模型数据的最大可渲染级别
     */
    shDegree?: number | undefined;

    /**
     * 背景色（默认 '#000000'）
     */
    background?: string;
}
