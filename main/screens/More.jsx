import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Animated,
    DeviceEventEmitter,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MoreScreen = ({
    currentTheme,
    setScreens,
    screens,
    theme,
    setTheme,
    viewMode,
    setViewMode,
    isIncognitoMode,
    toggleIncognitoMode,
    settingsDAO,
    workDAO,
    libraryDAO,
    historyDAO,
    progressDAO,
    kudoHistoryDAO,
    databaseObj,
    chapterDAO,
    setJsonSettings,
    openTagSearch,
}) => {
    const navigation = useNavigation();

    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const { t } = useTranslation();

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const handlePress = useCallback(
        screenName => {
            switch (screenName) {
                case 'Preferences':
                    navigation.push('Preferences', {
                        currentTheme: currentTheme,
                        theme: theme,
                        setTheme: setTheme,
                        viewMode: viewMode,
                        setViewMode: setViewMode,
                        isIncognitoMode: isIncognitoMode,
                        toggleIncognitoMode: toggleIncognitoMode,
                        settingsDAO: settingsDAO,
                        setScreens: setScreens,
                        onRestartOnboarding: () => {
                            setJsonSettings(prev => ({ ...prev, finishedOnboarding: false }));
                        },
                    });
                    break;
                case 'Account':
                    navigation.push('Account', {
                        currentTheme: currentTheme,
                        setScreens: setScreens,
                    });
                    break;
                case 'KudosHistory':
                    navigation.push('KudosHistory', {
                        currentTheme: currentTheme,
                        workDAO: workDAO,
                        libraryDAO: libraryDAO,
                        setScreens: setScreens,
                        historyDAO: historyDAO,
                        settingsDAO: settingsDAO,
                        progressDAO: progressDAO,
                        kudoHistoryDAO: kudoHistoryDAO,
                        chapterDAO: chapterDAO,
                    });
                    break;
                case 'Bookmarks':
                    navigation.push('Bookmarks', {
                        currentTheme: currentTheme,
                        workDAO: workDAO,
                        libraryDAO: libraryDAO,
                        setScreens: setScreens,
                        screens: screens,
                        historyDAO: historyDAO,
                        settingsDAO: settingsDAO,
                        progressDAO: progressDAO,
                        kudoHistoryDAO: kudoHistoryDAO,
                        chapterDAO: chapterDAO,
                    });
                    break;
                case 'ReadLater':
                    navigation.push('ReadLater', {
                        currentTheme: currentTheme,
                        workDAO: workDAO,
                        libraryDAO: libraryDAO,
                        setScreens: setScreens,
                        screens: screens,
                        historyDAO: historyDAO,
                        settingsDAO: settingsDAO,
                        progressDAO: progressDAO,
                        kudoHistoryDAO: kudoHistoryDAO,
                        chapterDAO: chapterDAO,
                    });
                    break;
                case 'Categories':
                    navigation.push('Categories', {
                        currentTheme: currentTheme,
                        workDAO: workDAO,
                        libraryDAO: libraryDAO,
                        setScreens: setScreens,
                        historyDAO: historyDAO,
                        settingsDAO: settingsDAO,
                        progressDAO: progressDAO,
                        kudoHistoryDAO: kudoHistoryDAO,
                    });
                    break;
                case 'Statistics':
                    navigation.push('Statistics', {
                        currentTheme: currentTheme,
                        workDAO: workDAO,
                        libraryDAO: libraryDAO,
                        setScreens: setScreens,
                        historyDAO: historyDAO,
                        settingsDAO: settingsDAO,
                        progressDAO: progressDAO,
                        kudoHistoryDAO: kudoHistoryDAO,
                        databaseObj: databaseObj,
                        openTagSearch: openTagSearch,
                        chapterDAO: chapterDAO,
                    });
                    break;
                case 'Data and Storage':
                    navigation.push('Storage', {
                        currentTheme: currentTheme,
                        workDAO: workDAO,
                        libraryDAO: libraryDAO,
                        setScreens: setScreens,
                        historyDAO: historyDAO,
                        settingsDAO: settingsDAO,
                        progressDAO: progressDAO,
                        kudoHistoryDAO: kudoHistoryDAO,
                        databaseObj: databaseObj,
                    });
                    break;
                case 'Word Replacer':
                    navigation.push('WordReplacer', {
                        currentTheme: currentTheme,
                        workDAO: workDAO,
                        libraryDAO: libraryDAO,
                        setScreens: setScreens,
                        historyDAO: historyDAO,
                        settingsDAO: settingsDAO,
                        progressDAO: progressDAO,
                        kudoHistoryDAO: kudoHistoryDAO,
                        databaseObj: databaseObj,
                    });
                    break;
                case 'About':
                    navigation.push('About', {
                        currentTheme: currentTheme,
                        workDAO: workDAO,
                        libraryDAO: libraryDAO,
                        setScreens: setScreens,
                        historyDAO: historyDAO,
                        settingsDAO: settingsDAO,
                        progressDAO: progressDAO,
                        kudoHistoryDAO: kudoHistoryDAO,
                        db: databaseObj,
                    });
                    break;
                case 'Help':
                    navigation.push('Help', {
                        currentTheme: currentTheme,
                        workDAO: workDAO,
                        libraryDAO: libraryDAO,
                        setScreens: setScreens,
                        historyDAO: historyDAO,
                        settingsDAO: settingsDAO,
                        progressDAO: progressDAO,
                        kudoHistoryDAO: kudoHistoryDAO,
                    });
                    break;
            }
            console.log(`${screenName} pressed`);
        },
        [
            navigation,
            currentTheme,
            theme,
            setTheme,
            viewMode,
            setViewMode,
            isIncognitoMode,
            toggleIncognitoMode,
            settingsDAO,
            setScreens,
            setJsonSettings,
            workDAO,
            libraryDAO,
            historyDAO,
            progressDAO,
            kudoHistoryDAO,
            chapterDAO,
            screens,
            databaseObj,
            openTagSearch,
        ],
    );

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('doubleTap', _id => {
            handlePress('Preferences');
        });

        return () => {
            subscription.remove();
        };
    }, [handlePress]);

    const menuItems = [
        {
            name: t('screen_more_nav_preference'),
            icon: 'settings',
            handler: () => handlePress('Preferences'),
        },
        {
            name: t('screen_more_nav_account'),
            icon: 'account-circle',
            handler: () => handlePress('Account'),
        },
        {
            name: t('screen_more_nav_kudos'),
            icon: 'favorite',
            handler: () => handlePress('KudosHistory'),
        },
        {
            name: t('screen_more_nav_bookmarks'),
            icon: 'bookmarks',
            handler: () => handlePress('Bookmarks'),
        },
        {
            name: t('screen_more_nav_later'),
            icon: 'watch-later',
            handler: () => handlePress('ReadLater'),
        },
        {
            name: t('screen_more_nav_categories'),
            icon: 'category',
            handler: () => handlePress('Categories'),
        },
        {
            name: t('screen_more_nav_stats'),
            icon: 'bar-chart',
            handler: () => handlePress('Statistics'),
        },
        {
            name: t('screen_more_nav_data'),
            icon: 'storage',
            handler: () => handlePress('Data and Storage'),
        },
        {
            name: t('screen_more_nav_word-replacer'),
            icon: 'find-replace',
            handler: () => handlePress('Word Replacer'),
        },
        {
            name: t('screen_more_nav_about'),
            icon: 'info',
            handler: () => handlePress('About'),
        },
        {
            name: t('screen_more_nav_help'),
            icon: 'help',
            handler: () => handlePress('Help'),
        },
    ];

    return (
        <ScrollView
            style={[styles.mainContent, { backgroundColor: currentTheme.backgroundColor }]}
            contentContainerStyle={{
                paddingBottom: insets.bottom + 60,
            }}
        >
            <View style={styles.contentContainer}>
                <View
                    style={[
                        styles.menuContainer,
                        {
                            borderColor: currentTheme.borderColor,
                            backgroundColor: currentTheme.cardBackground,
                        },
                    ]}
                >
                    {menuItems.map((item, index) => (
                        <Animated.View
                            key={item.name}
                            style={[
                                {
                                    opacity: fadeAnim,
                                    transform: [
                                        {
                                            translateX: fadeAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [-20, 0],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.menuItem,
                                    {
                                        backgroundColor: currentTheme.cardBackground,
                                        borderBottomColor: currentTheme.borderColor,
                                    },
                                    index === menuItems.length - 1 && styles.lastItem,
                                ]}
                                onPress={item.handler}
                                activeOpacity={0.7}
                            >
                                <View style={styles.iconContainer}>
                                    <Icon
                                        name={item.icon}
                                        size={20}
                                        color={currentTheme.primaryColor}
                                    />
                                </View>
                                <Text style={[styles.menuText, { color: currentTheme.textColor }]}>
                                    {item.name}
                                </Text>
                                <Icon
                                    name="chevron-right"
                                    size={20}
                                    color={currentTheme.placeholderColor}
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    mainContent: {
        flex: 1,
    },
    contentContainer: {
        padding: 10,
    },
    menuContainer: {
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    iconContainer: {
        width: 28,
        alignItems: 'center',
        marginRight: 10,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
});

export default MoreScreen;
