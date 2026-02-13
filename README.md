[English README](./README_en.md)

# Gemini 无损去水印工具

<p align="center">
  <img src="./logo.png" width="120" alt="Gemini Watermark Remover Logo">
</p>

## 项目简介

`Gemini Watermark Remover` 是一个纯浏览器端的图像去水印工具，主要用于处理 Gemini 图像中的可见水印。

- 本地处理：图片不会上传到服务器
- 无后端依赖：静态部署即可运行
- 数学反解：基于 Reverse Alpha Blending

## 功能特性

- 自动识别 48×48 / 96×96 水印尺寸
- 支持 JPG / PNG / WebP
- 支持批量处理与打包下载
- 支持浏览器扩展脚本（Gemini 页面）

## 本地运行与启动

### 1) 安装依赖

```bash
corepack pnpm install
```

### 2) 开发模式（监听构建）

```bash
corepack pnpm dev
```

### 3) 启动本地预览

```bash
npx --yes serve dist -l 28008
```

然后访问 `http://127.0.0.1:28008`。

### 4) 生产构建

```bash
corepack pnpm build
```

### 5) 用户脚本产物

构建后脚本路径：`dist/userscript/yutoai-watermark-remover.user.js`

## 项目结构

```text
yutoai-watermark-remover/
├── public/                # 静态资源（含 favicon/logo）
├── src/                   # 源码
├── dist/                  # 构建输出
├── build.js               # 构建脚本
└── package.json
```

## 局限性

- 仅移除可见水印
- 不处理隐形/隐写水印（如 SynthID）
- 仅保证对当前支持的水印模式有效

## 法律声明

本工具仅供个人学习与研究使用。

去除水印行为在不同司法辖区可能涉及法律风险。用户需自行确保使用行为符合适用法律、服务条款与知识产权要求，并自行承担相应责任。

作者不鼓励将本工具用于任何侵权、虚假陈述或其他非法用途。

**本软件按“原样”提供，不附带任何明示或暗示担保。对因使用本软件引发的任何索赔、损害或责任，作者不承担责任。**

## 致谢与版权说明

本项目的 Reverse Alpha Blending 方法与标定水印掩码，基于 AllenK（Kwyshell）原始工作（© 2024），并遵循 MIT 许可。

## License

[MIT License](./LICENSE)
