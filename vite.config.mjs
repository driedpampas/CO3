import path from 'node:path';
import { fileURLToPath } from 'node:url';
import babel from '@babel/core';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function transformJsxInJsPlugin() {
    return {
        name: 'transform-jsx-in-js',
        enforce: 'pre',
        transform(code, id) {
            const cleanId = id.split('?')[0];
            if (
                cleanId.endsWith('.js') &&
                !cleanId.includes('.vite/deps') &&
                (cleanId.includes('react-native') ||
                    cleanId.includes('web-mocks') ||
                    code.includes('</') ||
                    code.includes('/>') ||
                    code.includes('@flow'))
            ) {
                const result = babel.transformSync(code, {
                    filename: cleanId,
                    configFile: false,
                    babelrc: false,
                    presets: ['@babel/preset-react'],
                    plugins: ['@babel/plugin-transform-flow-strip-types'],
                    sourceMaps: true,
                });
                return result ? { code: result.code, map: result.map } : null;
            }
        },
    };
}

export default defineConfig({
    base: './',
    plugins: [transformJsxInJsPlugin(), react()],
    esbuild: {
        loader: 'jsx',
        include: /.*\.[tj]sx?$/,
        exclude: [],
    },
    optimizeDeps: {
        include: [
            '@react-native/normalize-colors',
            'react-native-web',
            'react',
            'react-dom',
            'prop-types',
            'hoist-non-react-statics',
            'lodash',
            'invariant',
            'nullthrows',
            'scheduler',
            'react-is',
            'setimmediate',
            'buffer',
            'jszip',
            'ky',
            'fast-html-parser',
            'htmlparser2',
            'entities',
            'domhandler',
            'react-i18next',
        ],
        exclude: [
            'react-native',
            'react-native-vector-icons',
            'react-native-progress',
            'react-native-portalize',
            'react-native-device-info',
            'react-native-restart',
            'react-native-super-grid',
            'react-native-html-parser',
            'react-native-render-html',
            'react-native-toast-message',
            'react-native-calendars',
            'react-native-svg',
            'react-native-reanimated',
            'react-native-worklets',
            '@native-html/transient-render-engine',
            '@expo/vector-icons',
            '@react-navigation/bottom-tabs',
            '@react-navigation/native',
            '@react-navigation/native-stack',
            '@react-navigation/elements',
            '@react-navigation/core',
            'react-native-fs',
            '@react-native-documents/picker',
            'react-native-notify-kit',
            'react-native-sqlite-storage',
            'react-native-webview',
            'react-native-gesture-handler',
            'react-native-screens',
            '@react-native-community/slider',
            'react-native-keychain',
            'react-native-background-actions',
            'react-native-system-navigation-bar',
            '@react-native-cookies/cookies',
            '@react-native-picker/picker',
            '@react-native-async-storage/async-storage',
            'react-native-linear-gradient',
            'react-native-inappbrowser-reborn',
            'react-native-change-icon',
        ],
    },
    resolve: {
        alias: [
            {
                find: 'react-native-change-icon',
                replacement: path.resolve(
                    __dirname,
                    'web-mocks/change-icon.js',
                ),
            },
            {
                find: 'react-native-vector-icons/MaterialIcons',
                replacement: path.resolve(
                    __dirname,
                    'web-mocks/rn-vector-icons-MaterialIcons.jsx',
                ),
            },
            {
                find: 'react-native-vector-icons/MaterialCommunityIcons',
                replacement: path.resolve(
                    __dirname,
                    'web-mocks/rn-vector-icons-MaterialCommunityIcons.jsx',
                ),
            },
            { find: 'react-native', replacement: 'react-native-web' },
            {
                find: 'react-native-fs',
                replacement: path.resolve(
                    __dirname,
                    'web-mocks/react-native-fs.js',
                ),
            },
            {
                find: '@react-native-documents/picker',
                replacement: path.resolve(__dirname, 'web-mocks/picker.js'),
            },
            {
                find: 'react-native-notify-kit',
                replacement: path.resolve(__dirname, 'web-mocks/notifee.js'),
            },
            {
                find: 'react-native-sqlite-storage',
                replacement: path.resolve(__dirname, 'web-mocks/sqlite.js'),
            },
            {
                find: 'react-native-webview',
                replacement: path.resolve(__dirname, 'web-mocks/webview.jsx'),
            },
            {
                find: 'react-native-gesture-handler',
                replacement: path.resolve(
                    __dirname,
                    'web-mocks/gesture-handler.jsx',
                ),
            },
            {
                find: 'react-native-screens',
                replacement: path.resolve(__dirname, 'web-mocks/screens.jsx'),
            },
            {
                find: '@react-native-community/slider',
                replacement: path.resolve(__dirname, 'web-mocks/slider.jsx'),
            },
            {
                find: 'react-native-keychain',
                replacement: path.resolve(__dirname, 'web-mocks/keychain.js'),
            },
            {
                find: 'react-native-background-actions',
                replacement: path.resolve(
                    __dirname,
                    'web-mocks/background-actions.js',
                ),
            },
            {
                find: 'react-native-system-navigation-bar',
                replacement: path.resolve(
                    __dirname,
                    'web-mocks/navigation-bar.js',
                ),
            },
            {
                find: '@react-native-cookies/cookies',
                replacement: path.resolve(__dirname, 'web-mocks/cookies.js'),
            },
            {
                find: '@react-native-picker/picker',
                replacement: path.resolve(__dirname, 'web-mocks/rn-picker.jsx'),
            },
            {
                find: '@react-native-async-storage/async-storage',
                replacement: path.resolve(
                    __dirname,
                    'web-mocks/async-storage.js',
                ),
            },
            {
                find: 'react-native-safe-area-context',
                replacement: path.resolve(
                    __dirname,
                    'web-mocks/safe-area-context.jsx',
                ),
            },
            {
                find: 'react-native-linear-gradient',
                replacement: path.resolve(
                    __dirname,
                    'web-mocks/linear-gradient.jsx',
                ),
            },
            {
                find: 'react-native-inappbrowser-reborn',
                replacement: path.resolve(
                    __dirname,
                    'web-mocks/inappbrowser.js',
                ),
            },
        ],
        extensions: [
            '.web.tsx',
            '.web.ts',
            '.web.jsx',
            '.web.js',
            '.tsx',
            '.ts',
            '.jsx',
            '.js',
            '.mjs',
            '.json',
        ],
    },
    define: {
        __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
        __BUNDLE_START_TIME__: JSON.stringify(Date.now()),
        __VERSION__: JSON.stringify('0.80.1'),
        global: 'globalThis',
    },
    server: {
        port: 3000,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            external: ['electron'],
        },
    },
});
