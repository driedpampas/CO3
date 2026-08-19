import { Platform } from 'react-native';
import { changeIcon } from 'react-native-change-icon';

export const setAppIcon = async theme => {
    if (Platform.OS !== 'android') return;

    try {
        const isDark = theme === 'dark' || theme === 'black';
        if (isDark) {
            await changeIcon('Dark');
        } else {
            await changeIcon('Default');
        }
    } catch (error) {
        if (!error?.message?.includes('ICON_ALREADY_USED')) {
            console.warn('Failed to set app icon:', error?.message || error);
        }
    }
};

export default {
    setAppIcon,
};
