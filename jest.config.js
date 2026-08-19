module.exports = {
    preset: '@react-native/jest-preset',
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    setupFiles: [
        '<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js',
        '<rootDir>/node_modules/react-native-reanimated/mock.js',
    ],
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|react-navigation|@react-navigation/.*|react-native-gesture-handler|react-native-reanimated|react-native-worklets|react-native-safe-area-context|react-native-screens|react-native-vector-icons|react-native-notify-kit|@react-native-cookies/cookies|ky)',
    ],
    moduleNameMapper: {
        '^@react-native-async-storage/async-storage$':
            '<rootDir>/node_modules/@react-native-async-storage/async-storage/jest/async-storage-mock.js',
        '^react-native-device-info$':
            '<rootDir>/node_modules/react-native-device-info/jest/react-native-device-info-mock.js',
        '^react-native-worklets$':
            '<rootDir>/node_modules/react-native-worklets/lib/module/mock.js',
        '^react-native-restart$':
            '<rootDir>/node_modules/react-native-restart/src/__mocks__/react-native-restart.tsx',
        '^@react-native-cookies/cookies$': '<rootDir>/web-mocks/cookies.js',
        '^react-native-keychain$': '<rootDir>/web-mocks/keychain.js',
        '^react-native-notify-kit$': '<rootDir>/web-mocks/notifee.js',
        '^react-native-sqlite-storage$': '<rootDir>/web-mocks/sqlite.js',
        '^react-native-fs$': '<rootDir>/web-mocks/react-native-fs.js',
        '^react-native-webview$': '<rootDir>/web-mocks/webview.jsx',
        '^react-native-screens$': '<rootDir>/web-mocks/screens.jsx',
        '^@react-native-community/slider$': '<rootDir>/web-mocks/slider.jsx',
        '^react-native-linear-gradient$': '<rootDir>/web-mocks/linear-gradient.jsx',
        '^react-native-system-navigation-bar$': '<rootDir>/web-mocks/navigation-bar.js',
        '^@react-native-documents/picker$': '<rootDir>/web-mocks/picker.js',
        '^@react-native-picker/picker$': '<rootDir>/web-mocks/rn-picker.jsx',
        '^react-native-background-actions$': '<rootDir>/web-mocks/background-actions.js',
        '^react-native-inappbrowser-reborn$': '<rootDir>/web-mocks/inappbrowser.js',
    },
};
