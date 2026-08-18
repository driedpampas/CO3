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
                (cleanId.includes('react-native') ||
                    cleanId.includes('web-mocks') ||
                    code.includes('</') ||
                    code.includes('/>'))
            ) {
                const result = babel.transformSync(code, {
                    filename: cleanId,
                    presets: ['@babel/preset-react'],
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
    resolve: {
        alias: {
            'react-native': 'react-native-web',
            'react-native-fs': path.resolve(__dirname, 'web-mocks/react-native-fs.js'),
            '@react-native-documents/picker': path.resolve(__dirname, 'web-mocks/picker.js'),
            'react-native-notify-kit': path.resolve(__dirname, 'web-mocks/notifee.js'),
            'react-native-sqlite-storage': path.resolve(__dirname, 'web-mocks/sqlite.js'),
            'react-native-webview': path.resolve(__dirname, 'web-mocks/webview.js'),
            'react-native-gesture-handler': path.resolve(
                __dirname,
                'web-mocks/gesture-handler.js',
            ),
            'react-native-screens': path.resolve(__dirname, 'web-mocks/screens.js'),
            '@react-native-community/slider': path.resolve(__dirname, 'web-mocks/slider.js'),
            'react-native-keychain': path.resolve(__dirname, 'web-mocks/keychain.js'),
            'react-native-background-actions': path.resolve(
                __dirname,
                'web-mocks/background-actions.js',
            ),
            'react-native-system-navigation-bar': path.resolve(
                __dirname,
                'web-mocks/navigation-bar.js',
            ),
            '@react-native-cookies/cookies': path.resolve(__dirname, 'web-mocks/cookies.js'),
            '@react-native-picker/picker': path.resolve(__dirname, 'web-mocks/rn-picker.js'),
            '@react-native-async-storage/async-storage': path.resolve(
                __dirname,
                'web-mocks/async-storage.js',
            ),
            'react-native-safe-area-context': path.resolve(
                __dirname,
                'web-mocks/safe-area-context.js',
            ),
            'react-native-linear-gradient': path.resolve(
                __dirname,
                'web-mocks/linear-gradient.js',
            ),
            'react-native-inappbrowser-reborn': path.resolve(
                __dirname,
                'web-mocks/inappbrowser.js',
            ),
        },
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
