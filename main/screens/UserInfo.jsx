import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HtmlTextRenderer from '../components/common/HtmlTextRenderer';
import LoadingSpinner from '../components/History/Spinner';
import { getUserInfo, getUserInfoByPseud } from '../web/user/getUserInfo';

export default function UserInfoScreen({ route }) {
    const {
        currentTheme,
        username,
        onBack,
        setScreens,
        workDAO,
        libraryDAO,
        historyDAO,
        settingsDAO,
        progressDAO,
        kudoHistoryDAO,
        chapterDAO,
    } = route.params;

    const navigation = useNavigation();

    const { t } = useTranslation();
    const [userInfo, setUserInfo] = useState();
    const [error, setError] = useState(false);
    const [properUsername, setProperUsername] = useState();
    const [properPseud, setProperPseud] = useState();

    const loadUserInfo = useCallback(async (parsedUsername, parsedPseud) => {
        console.log('loadUserInfo');
        setError(false);
        setUserInfo(undefined);
        const fetch = parsedPseud
            ? getUserInfoByPseud(parsedUsername, parsedPseud)
            : getUserInfo(parsedUsername);
        fetch
            .then(data => {
                const bioHtml = data.bio ? data.bio.toString() : undefined;
                setUserInfo({ ...data, bio: bioHtml });
            })
            .catch(err => {
                console.error(err);
                setError(true);
            });
    }, []);

    useEffect(() => {
        let parsedUsername = username;
        let parsedPseud = null;

        if (username.includes('(')) {
            const match = username.match(/^([^(]+?)\s*\(([^)]*)\)$/);
            if (match) {
                parsedPseud = match[1].trim();
                parsedUsername = match[2];
            }
        }

        setProperUsername(parsedUsername);
        setProperPseud(parsedPseud);
        loadUserInfo(parsedUsername, parsedPseud);
    }, [username, loadUserInfo]);

    function userHeader() {
        if (error) {
            return (
                <SafeAreaView
                    style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}
                >
                    <View style={[styles.header, { borderBottomColor: currentTheme.borderColor }]}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Icon name="arrow-back" size={24} color={currentTheme.textColor} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: currentTheme.textColor }]}>
                            {t('general_error')}
                        </Text>
                    </View>

                    <View style={styles.errorContainer}>
                        <Icon name="error-outline" size={48} color={currentTheme.iconColor} />
                        <Text style={[styles.errorText, { color: currentTheme.textColor }]}>
                            {t('screen_user_profile_error_load')}
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.retryButton,
                                { backgroundColor: currentTheme.primaryColor },
                            ]}
                            onPress={loadUserInfo}
                        >
                            <Text style={styles.retryButtonText}>{t('general_retry')}</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            );
        }

        if (!userInfo)
            return (
                <LoadingSpinner
                    currentTheme={currentTheme}
                    message={t('screen_user_profile_loading')}
                />
            );

        return (
            <SafeAreaView>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack}>
                        <Icon name="arrow-back" size={24} color={currentTheme.textColor} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: currentTheme.textColor }]}>
                        {t('screen_user_profile_title')}
                    </Text>
                </View>
                <ScrollView>
                    {userInfo ? (
                        <>
                            <View style={styles.headerContainer}>
                                <View style={styles.profileHeader}>
                                    <Image
                                        source={{ uri: userInfo.avatarUrl }}
                                        style={[
                                            styles.icon,
                                            {
                                                borderColor: currentTheme.borderColor,
                                                marginBottom: 0,
                                            },
                                        ]}
                                    />
                                    <View style={styles.userDetails}>
                                        <Text
                                            style={[
                                                styles.username,
                                                { color: currentTheme.textColor },
                                            ]}
                                        >
                                            {properPseud ? properPseud : properUsername}
                                        </Text>
                                        {userInfo.joinDate && (
                                            <Text
                                                style={[
                                                    styles.joinDate,
                                                    { color: currentTheme.secondaryTextColor },
                                                ]}
                                            >
                                                {t('screen_user_profile_joined', {
                                                    date: userInfo.joinDate,
                                                })}
                                            </Text>
                                        )}
                                        {properPseud && (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    navigation.push('User', {
                                                        username: properUsername,
                                                        currentTheme: currentTheme,
                                                        onBack: onBack,
                                                        setScreens: setScreens,
                                                        workDAO: workDAO,
                                                        libraryDAO: libraryDAO,
                                                        historyDAO: historyDAO,
                                                        chapterDAO: chapterDAO,
                                                        progressDAO: progressDAO,
                                                        kudoHistoryDAO: kudoHistoryDAO,
                                                    });
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.joinDate,
                                                        { color: currentTheme.secondaryTextColor },
                                                    ]}
                                                >
                                                    {t('screen_user_profile_pseud_of', {
                                                        username: properUsername,
                                                    })}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {userInfo.bio && (
                                    <>
                                        <Text
                                            style={[
                                                styles.subTitle,
                                                { color: currentTheme.textColor },
                                            ]}
                                        >
                                            {t('screen_user_profile_bio')}
                                        </Text>
                                        <HtmlTextRenderer
                                            html={userInfo.bio}
                                            currentTheme={currentTheme}
                                        />
                                    </>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.bookMarkButton,
                                    { borderColor: currentTheme.borderColor },
                                ]}
                                onPress={() => {
                                    navigation.push('Bookmarks', {
                                        setScreens: setScreens,
                                        historyDAO: historyDAO,
                                        settingsDAO: settingsDAO,
                                        progressDAO: progressDAO,
                                        workDAO: workDAO,
                                        libraryDAO: libraryDAO,
                                        kudoHistoryDAO: kudoHistoryDAO,
                                        currentTheme: currentTheme,
                                        username: properUsername,
                                        chapterDAO: chapterDAO,
                                        pseud: properPseud,
                                    });
                                }}
                            >
                                <Text
                                    style={[
                                        styles.bookMarkButtonText,
                                        { color: currentTheme.textColor },
                                    ]}
                                >
                                    {t('screen_user_profile_bookmark_button')}
                                </Text>
                                <Icon
                                    name={'chevron-right'}
                                    size={24}
                                    color={currentTheme.iconColor}
                                    style={[{}]}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.workButton,
                                    { borderColor: currentTheme.borderColor },
                                ]}
                                onPress={() => {
                                    navigation.push('UserWork', {
                                        setScreens: setScreens,
                                        historyDAO: historyDAO,
                                        settingsDAO: settingsDAO,
                                        progressDAO: progressDAO,
                                        workDAO: workDAO,
                                        libraryDAO: libraryDAO,
                                        kudoHistoryDAO: kudoHistoryDAO,
                                        currentTheme: currentTheme,
                                        username: properUsername,
                                        chapterDAO: chapterDAO,
                                        pseud: properPseud,
                                    });
                                }}
                            >
                                <Text
                                    style={[
                                        styles.bookMarkButtonText,
                                        { color: currentTheme.textColor },
                                    ]}
                                >
                                    {t('screen_user_profile_works_button')}
                                </Text>
                                <Icon
                                    name={'chevron-right'}
                                    size={24}
                                    color={currentTheme.iconColor}
                                    style={[{}]}
                                />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <ActivityIndicator />
                    )}
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
            {userHeader()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        padding: 12,
        alignItems: 'flex-start',
    },
    loader: {
        marginTop: 30,
    },
    icon: {
        width: 72,
        height: 72,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 10,
    },
    bioWrapper: {
        width: '100%',
    },
    subTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 8,
        width: '70%',
    },
    username: {
        fontSize: 16,
        paddingLeft: 8,
    },
    joinDate: {
        fontSize: 13,
        paddingLeft: 8,
    },
    bookMarkButton: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        padding: 12,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    workButton: {
        borderBottomWidth: 1,
        padding: 12,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    bookMarkButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 12,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 6,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});
