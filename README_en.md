[中文文档](./README.md)

# Gemini Lossless Watermark Remover

<p align="center">
  <img src="./logo.png" width="120" alt="Gemini Watermark Remover Logo">
</p>

## Overview

`Gemini Watermark Remover` is a browser-only image tool focused on removing visible Gemini watermarks.

- Local processing only: images are not uploaded to servers
- No backend required: static deployment is enough
- Deterministic math: based on Reverse Alpha Blending

## Features

- Auto-detects 48×48 / 96×96 watermark variants
- Supports JPG / PNG / WebP
- Supports batch processing and ZIP download
- Supports browser extension script for Gemini pages

## Run Locally

### 1) Install dependencies

```bash
corepack pnpm install
```

### 2) Development mode (watch build)

```bash
corepack pnpm dev
```

### 3) Preview locally

```bash
npx --yes serve dist -l 28008
```

Then open `http://127.0.0.1:28008`.

### 4) Production build

```bash
corepack pnpm build
```

### 5) Userscript output

Built userscript path: `dist/userscript/yutoai-watermark-remover.user.js`

## Project Structure

```text
yutoai-watermark-remover/
├── public/                # Static assets (including favicon/logo)
├── src/                   # Source code
├── dist/                  # Build output
├── build.js               # Build script
└── package.json
```

## Limitations

- Removes visible watermark only
- Does not remove invisible/steganographic marks (for example SynthID)
- Guaranteed only for currently supported watermark patterns

## Legal Disclaimer

This tool is for personal learning and research purposes only.

Watermark removal may have legal implications depending on your jurisdiction and use case. You are solely responsible for ensuring compliance with applicable laws, platform terms, and intellectual property rules.

The author does not encourage use for infringement, misrepresentation, or any unlawful purpose.

**THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTIES OF ANY KIND. THE AUTHOR SHALL NOT BE LIABLE FOR ANY CLAIMS, DAMAGES, OR OTHER LIABILITY ARISING FROM USE OF THIS SOFTWARE.**

## Credits

The Reverse Alpha Blending method and calibrated watermark masks are based on original work by AllenK (Kwyshell), © 2024, under MIT License.

## License

[MIT License](./LICENSE)
