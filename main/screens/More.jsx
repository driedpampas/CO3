import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
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
    const { t } = useTranslation();

    const handlePress = useCallback(
        screenName => {
            switch (screenName) {
                case 'Preferences':
                    navigation.push('Preferences', {
                        currentTheme: currentTheme,
                    });
                    break;
                case 'Account':
                    navigation.push('Account', {
                        currentTheme: currentTheme,
                    });
                    break;
                case 'KudosHistory':
                    navigation.push('KudosHistory', {
                        currentTheme: currentTheme,
                    });
                    break;
                case 'Bookmarks':
                    navigation.push('Bookmarks', {
                        currentTheme: currentTheme,
                    });
                    break;
                case 'ReadLater':
                    navigation.push('ReadLater', {
                        currentTheme: currentTheme,
                    });
                    break;
                case 'Categories':
                    navigation.push('Categories', {
                        currentTheme: currentTheme,
                    });
                    break;
                case 'Statistics':
                    navigation.push('Statistics', {
                        currentTheme: currentTheme,
                    });
                    break;
                case 'Data and Storage':
                    navigation.push('Storage', {
                        currentTheme: currentTheme,
                    });
                    break;
                case 'Word Replacer':
                    navigation.push('WordReplacer', {
                        currentTheme: currentTheme,
                    });
                    break;
                case 'About':
                    navigation.push('About', {
                        currentTheme: currentTheme,
                    });
                    break;
                case 'Help':
                    navigation.push('Help', {
                        currentTheme: currentTheme,
                    });
                    break;
            }
            console.log(`${screenName} pressed`);
        },
        [navigation, currentTheme],
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
                        <View key={item.name}>
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
                        </View>
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
