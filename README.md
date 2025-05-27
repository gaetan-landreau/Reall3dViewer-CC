<p align=center>
<img style="width:128px;height:128px" src="https://gotoeasy.github.io/reall3d/logo.png"/>
</p>

# Reall3dViewer

`Reall3dViewer` is a 3D Gaussian Splatting viewer built on Three.js. Crafting an exceptional 3DGS viewer is no small feat, which is why we've chosen to open-source our project. We hope to harness the collective wisdom and efforts of the community to drive the advancement of 3DGS applications together!

<br>

<p align="center">
    <a href="https://github.com/reall3d-com/Reall3dViewer/blob/master/README_ZH.md"><img src="https://img.shields.io/badge/readme-Chinese-brightgreen.svg"></a>
    <a href="https://github.com/microsoft/TypeScript"><img src="https://img.shields.io/badge/lang-TypeScript-brightgreen.svg"></a>
    <a href="https://github.com/mrdoob/three.js"><img src="https://img.shields.io/badge/base-Threejs-brightgreen.svg"></a>
    <a href="https://github.com/reall3d-com/Reall3dViewer/releases/latest"><img src="https://img.shields.io/github/release/reall3d-com/Reall3dViewer.svg"></a>
    <a href="https://github.com/reall3d-com/Reall3dViewer/blob/master/LICENSE"><img src="https://img.shields.io/github/license/reall3d-com/Reall3dViewer"></a>
<p>

<br>

## Features
- [x] Support formats: `.ply`, `.splat`, `.spx`, `.spz`
- [x] Support mark and measurement
- [x] Support text watermark
- [x] Support 1st to 3nd degree spherical harmonics
- [x] Supports rendering models within maps

## `.spx`

- Format Specification: https://github.com/reall3d-com/Reall3dViewer/blob/main/SPX_EN.md
- Conversion Tool: https://github.com/gotoeasy/gsbox

## Basic Usage
```shell
# develop
npm run dev

# build
npm run build

# open a web browser to render your 3dgs model
# http://hostname:port/index.html?url=your-model-link-address

# .spx file can be obtained through conversion using the gsbox
gsbox p2x -i /path/to/input.ply -o /path/to/output.spx -sh 0
```

## TODO
- Continuously optimize and enhance rendering performance
- Large scene


## Acknowledgments
We would like to express our gratitude to the following projects for their valuable reference implementations
- https://github.com/antimatter15/splat
- https://github.com/mkkellogg/GaussianSplats3D
- https://github.com/huggingface/gsplat.js
- https://github.com/playcanvas/supersplat
- https://github.com/sxguojf/three-tile
