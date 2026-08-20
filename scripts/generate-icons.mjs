import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SRC_SVG = path.join(ROOT, 'main/res/branding/Logo_Tales_of_Our_Own.svg');
const PLAIN_SVG = path.join(ROOT, 'main/res/branding/Logo_Tales_of_Our_Own.plain.svg');
const LOGO_SVG = path.join(ROOT, 'main/res/branding/logo.svg');
const APPLOGO_JSX = path.join(ROOT, 'main/components/common/AppLogo.jsx');

const ANDROID_RES = path.join(ROOT, 'android/app/src/main/res');
const IOS_APPICONSET = path.join(ROOT, 'ios/CO3/Images.xcassets/AppIcon.appiconset');

const COLOR_PRIMARY = '#990001';
const COLOR_BG_LIGHT = '#ffffff';
const COLOR_BG_DARK = '#121212';
const COLOR_MONO = '#000000';

function run(cmd) {
    execSync(cmd, { stdio: 'pipe' });
}

function checkInkscape() {
    try {
        execSync('inkscape --version', { stdio: 'pipe' });
    } catch {
        console.error('Error: inkscape CLI not found. Please install Inkscape.');
        process.exit(1);
    }
}

function extractPathData(svgContent) {
    const pathRegex = /<path[^>]*\bd="([^"]+)"[^>]*>/g;
    const paths = [];
    let match = pathRegex.exec(svgContent);
    while (match !== null) {
        paths.push(match[1].trim());
        match = pathRegex.exec(svgContent);
    }
    if (paths.length === 0) {
        throw new Error('No path elements found in SVG');
    }
    return paths;
}

function renderSvgToPng(svgString, outPath, width, height) {
    const tmpSvg = path.join(os.tmpdir(), `icon_tmp_${Date.now()}_${Math.random().toString(36).slice(2)}.svg`);
    fs.writeFileSync(tmpSvg, svgString, 'utf-8');
    try {
        const outDir = path.dirname(outPath);
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }
        run(`inkscape -w ${width} -h ${height} --export-filename="${outPath}" "${tmpSvg}"`);
    } finally {
        if (fs.existsSync(tmpSvg)) {
            fs.unlinkSync(tmpSvg);
        }
    }
}

function buildSvgMarkup({ canvasSize, bgColor, logoPaths, logoColor, isAdaptive = false }) {
    let scale;
    let tx;
    let ty;

    if (isAdaptive) {
        // Android adaptive icon (108dp canvas)
        scale = (canvasSize / 108) * 0.112058;
        tx = (canvasSize / 108) * 20.3827;
        ty = (canvasSize / 108) * 30.748;
    } else {
        // Square icon with 70% width coverage
        const targetWidth = canvasSize * 0.7;
        scale = targetWidth / 600;
        const targetHeight = 415 * scale;
        tx = (canvasSize - targetWidth) / 2;
        ty = (canvasSize - targetHeight) / 2;
    }

    const bgRect = bgColor ? `<rect width="${canvasSize}" height="${canvasSize}" fill="${bgColor}" />` : '';
    const pathTags = logoPaths
        ? logoPaths.map(d => `<path fill="${logoColor || COLOR_PRIMARY}" d="${d}" />`).join('\n    ')
        : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}">
  ${bgRect}
  ${pathTags ? `<g transform="translate(${tx}, ${ty}) scale(${scale})">\n    ${pathTags}\n  </g>` : ''}
</svg>`;
}

function main() {
    console.log('==> Checking dependencies...');
    checkInkscape();

    if (!fs.existsSync(SRC_SVG)) {
        console.error(`Error: Source SVG not found at ${SRC_SVG}`);
        process.exit(1);
    }

    console.log('==> Generating Plain SVG...');
    run(`inkscape --export-plain-svg --export-filename="${PLAIN_SVG}" "${SRC_SVG}"`);

    const plainContent = fs.readFileSync(PLAIN_SVG, 'utf-8');
    const paths = extractPathData(plainContent);
    const combinedPathData = paths.join(' ');

    console.log(`==> Extracted ${paths.length} subpath(s).`);

    // 1. Generate main/res/branding/logo.svg
    console.log('==> Updating main/res/branding/logo.svg...');
    const logoSvgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   width="600"
   height="415"
   viewBox="0 0 600 415"
   version="1.1"
   id="svg1"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <defs
     id="defs1" />
  <path
     id="path-logo"
     fill="${COLOR_PRIMARY}"
     style="display:inline"
     d="${combinedPathData}" />
</svg>
`;
    fs.writeFileSync(LOGO_SVG, logoSvgContent, 'utf-8');

    // 2. Update main/components/common/AppLogo.jsx
    console.log('==> Updating main/components/common/AppLogo.jsx...');
    const appLogoContent = `import React from 'react';
import Svg, { Path } from 'react-native-svg';

const LOGO_PATH =
    '${combinedPathData}';

const ASPECT_RATIO = 415 / 600;

export default function AppLogo({ size, width, height, color = '${COLOR_PRIMARY}', style, ...props }) {
    let resolvedWidth = width;
    let resolvedHeight = height;

    if (size) {
        resolvedWidth = size;
        resolvedHeight = size * ASPECT_RATIO;
    } else if (resolvedWidth && !resolvedHeight) {
        resolvedHeight = resolvedWidth * ASPECT_RATIO;
    } else if (!resolvedWidth && resolvedHeight) {
        resolvedWidth = resolvedHeight / ASPECT_RATIO;
    } else if (!resolvedWidth && !resolvedHeight) {
        resolvedWidth = 100;
        resolvedHeight = 100 * ASPECT_RATIO;
    }

    return (
        <Svg
            width={resolvedWidth}
            height={resolvedHeight}
            viewBox="0 0 600 415"
            style={style}
            {...props}
        >
            <Path d={LOGO_PATH} fill={color} />
        </Svg>
    );
}
`;
    fs.writeFileSync(APPLOGO_JSX, appLogoContent, 'utf-8');

    // 3. Generate Android Vector Drawables
    console.log('==> Generating Android Vector Drawables...');
    const buildAndroidVector = color => `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
  <group
      android:scaleX="0.112058"
      android:scaleY="0.112058"
      android:translateX="20.3827"
      android:translateY="30.7480">
    <path
        android:pathData="${combinedPathData}"
        android:fillColor="${color}" />
  </group>
</vector>
`;

    fs.writeFileSync(
        path.join(ANDROID_RES, 'drawable/ic_launcher_foreground.xml'),
        buildAndroidVector(COLOR_PRIMARY),
        'utf-8',
    );
    fs.writeFileSync(
        path.join(ANDROID_RES, 'drawable/ic_launcher_foreground_dark.xml'),
        buildAndroidVector(COLOR_PRIMARY),
        'utf-8',
    );
    fs.writeFileSync(
        path.join(ANDROID_RES, 'drawable/ic_launcher_monochrome.xml'),
        buildAndroidVector(COLOR_MONO),
        'utf-8',
    );

    // 4. Generate Android Mipmap PNGs
    console.log('==> Generating Android Mipmap PNGs...');
    const mipmaps = [
        { dir: 'mipmap-mdpi', adaptiveSize: 108, legacySize: 48 },
        { dir: 'mipmap-hdpi', adaptiveSize: 162, legacySize: 72 },
        { dir: 'mipmap-xhdpi', adaptiveSize: 216, legacySize: 96 },
        { dir: 'mipmap-xxhdpi', adaptiveSize: 324, legacySize: 144 },
        { dir: 'mipmap-xxxhdpi', adaptiveSize: 432, legacySize: 192 },
    ];

    for (const { dir, adaptiveSize, legacySize } of mipmaps) {
        const targetDir = path.join(ANDROID_RES, dir);

        // Adaptive layers
        const fgSvg = buildSvgMarkup({
            canvasSize: adaptiveSize,
            bgColor: null,
            logoPaths: paths,
            logoColor: COLOR_PRIMARY,
            isAdaptive: true,
        });
        renderSvgToPng(fgSvg, path.join(targetDir, 'ic_launcher_foreground.png'), adaptiveSize, adaptiveSize);
        renderSvgToPng(fgSvg, path.join(targetDir, 'ic_launcher_foreground_dark.png'), adaptiveSize, adaptiveSize);

        const monoSvg = buildSvgMarkup({
            canvasSize: adaptiveSize,
            bgColor: null,
            logoPaths: paths,
            logoColor: COLOR_MONO,
            isAdaptive: true,
        });
        renderSvgToPng(monoSvg, path.join(targetDir, 'ic_launcher_monochrome.png'), adaptiveSize, adaptiveSize);

        const bgSvg = buildSvgMarkup({
            canvasSize: adaptiveSize,
            bgColor: COLOR_BG_LIGHT,
            logoPaths: null,
        });
        renderSvgToPng(bgSvg, path.join(targetDir, 'ic_launcher_background.png'), adaptiveSize, adaptiveSize);

        const bgDarkSvg = buildSvgMarkup({
            canvasSize: adaptiveSize,
            bgColor: COLOR_BG_DARK,
            logoPaths: null,
        });
        renderSvgToPng(bgDarkSvg, path.join(targetDir, 'ic_launcher_background_dark.png'), adaptiveSize, adaptiveSize);

        // Legacy icons
        const legacyLightSvg = buildSvgMarkup({
            canvasSize: legacySize,
            bgColor: COLOR_BG_LIGHT,
            logoPaths: paths,
            logoColor: COLOR_PRIMARY,
            isAdaptive: false,
        });
        renderSvgToPng(legacyLightSvg, path.join(targetDir, 'ic_launcher.png'), legacySize, legacySize);

        const legacyDarkSvg = buildSvgMarkup({
            canvasSize: legacySize,
            bgColor: COLOR_BG_DARK,
            logoPaths: paths,
            logoColor: COLOR_PRIMARY,
            isAdaptive: false,
        });
        renderSvgToPng(legacyDarkSvg, path.join(targetDir, 'ic_launcher_dark.png'), legacySize, legacySize);
    }

    // 5. Generate iOS AppIcon set
    console.log('==> Generating iOS AppIcon set...');
    const contentsJsonPath = path.join(IOS_APPICONSET, 'Contents.json');
    if (fs.existsSync(contentsJsonPath)) {
        const contents = JSON.parse(fs.readFileSync(contentsJsonPath, 'utf-8'));
        for (const img of contents.images) {
            const sizeParts = img.size.split('x').map(parseFloat);
            const scaleMultiplier = parseFloat(img.scale.replace('x', ''));
            const pixelWidth = Math.round(sizeParts[0] * scaleMultiplier);
            const pixelHeight = Math.round(sizeParts[1] * scaleMultiplier);
            const targetPath = path.join(IOS_APPICONSET, img.filename);

            const iosSvg = buildSvgMarkup({
                canvasSize: pixelWidth,
                bgColor: COLOR_BG_LIGHT,
                logoPaths: paths,
                logoColor: COLOR_PRIMARY,
                isAdaptive: false,
            });
            renderSvgToPng(iosSvg, targetPath, pixelWidth, pixelHeight);
        }
    }

    // 6. Generate Store, Metadata, and Fallback Icons
    console.log('==> Generating Store & metadata icons...');
    const storeIconSvg = buildSvgMarkup({
        canvasSize: 512,
        bgColor: COLOR_BG_LIGHT,
        logoPaths: paths,
        logoColor: COLOR_PRIMARY,
        isAdaptive: false,
    });
    renderSvgToPng(storeIconSvg, path.join(ROOT, 'android/play_store_512.png'), 512, 512);
    renderSvgToPng(storeIconSvg, path.join(ROOT, 'fastlane/metadata/android/en-US/images/icon.png'), 512, 512);
    renderSvgToPng(storeIconSvg, path.join(ROOT, 'fastlane/metadata/android/fr-FR/images/icon.png'), 512, 512);
    renderSvgToPng(storeIconSvg, path.join(ROOT, 'main/res/logo.png'), 512, 512);

    console.log('==> Icon generation completed successfully!');
}

main();
