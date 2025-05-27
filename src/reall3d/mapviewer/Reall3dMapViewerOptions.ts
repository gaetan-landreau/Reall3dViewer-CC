// ==============================================
// Copyright (c) 2025 reall3d.com, MIT license
// ==============================================
/**
 * 地图配置项
 */
export declare interface Reall3dMapViewerOptions {
    /**
     *  容器元素或其选择器，默认选择器为'#map'，找不到时将自动创建
     */
    root?: HTMLElement | string;

    /**
     * 是否允许键盘操作，默认true
     */
    enableKeyboard?: boolean | undefined;

    /**
     *  是否调试模式，生产环境默认false
     */
    debugMode?: boolean;
}
