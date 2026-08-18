import { AppRegistry } from 'react-native';
import appJson from './app.json';
import App from './main/app';

AppRegistry.registerComponent(appJson.name, () => App);
AppRegistry.runApplication(appJson.name, {
    initialProps: {},
    rootTag: document.getElementById('app-root'),
    rootViewStyle: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});
