export const AndroidForegroundServiceType = {
    SPECIAL_USE: 1073741824,
    DATA_SYNC: 1,
};

export const AndroidImportance = {
    NONE: 0,
    MIN: 1,
    LOW: 2,
    DEFAULT: 3,
    HIGH: 4,
    MAX: 5,
};

export const AndroidStyle = {
    BIGTEXT: 0,
    BIGPICTURE: 1,
    INBOX: 2,
    MESSAGING: 3,
};

export const EventType = {
    UNKNOWN: -1,
    DISMISSED: 0,
    PRESS: 1,
    ACTION_PRESS: 2,
    DELIVERED: 3,
    APP_BLOCKED: 4,
    CHANNEL_BLOCKED: 5,
    CHANNEL_GROUP_BLOCKED: 6,
    TRIGGER_NOTIFICATION_CREATED: 7,
    FG_ALREADY_EXIST: 8,
};

export const displayNotification = async (notification) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title || '', { body: notification.body });
    }
    return '';
};

export const requestPermission = async () => ({ status: 1 });
export const createChannel = async () => 'default';
export const onBackgroundEvent = () => {};
export const onForegroundEvent = () => () => {};

export default {
    displayNotification,
    requestPermission,
    createChannel,
    onBackgroundEvent,
    onForegroundEvent,
    EventType,
    AndroidImportance,
    AndroidStyle,
    AndroidForegroundServiceType,
};