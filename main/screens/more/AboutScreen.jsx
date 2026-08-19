import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { co3Version } from '../../constant';
import AppLogo from '../../components/common/AppLogo';

export default function AboutScreen({ route }) {
    const { setScreens, currentTheme, db } = route.params;
    const navigation = useNavigation();
    const { t } = useTranslation();

    function onBack() {
        navigation.goBack();
    }

    const theme = currentTheme || {
        backgroundColor: '#ffffff',
        textColor: '#171717',
        secondaryTextColor: '#525252',
        borderColor: '#e5e5e5',
        primaryColor: '#7c3aed',
    };

    return (
        <SafeAreaView style={[{ backgroundColor: theme.backgroundColor }, styles.container]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={theme.textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textColor }]}>
                    {t('screen_about_title')}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroSection}>
                    <TouchableOpacity
                        disabled={!__DEV__}
                        onPress={() => {
                            if (__DEV__) {
                                navigation.push('Debug', {
                                    setScreens,
                                    db,
                                });
                            }
                        }}
                    >
                        <AppLogo size={90} style={styles.logo} />
                    </TouchableOpacity>
                    <Text style={[styles.appTitle, { color: theme.textColor }]}>
                        {t('general_app_name')}
                    </Text>
                    <Text style={[styles.versionText, { color: theme.secondaryTextColor }]}>
                        {t('screen_about_version', { co3Version })}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.secondaryTextColor }]}>
                        {t('screen_about_sub')}
                    </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

                <View style={styles.infoSection}>
                    <Text style={[styles.description, { color: theme.textColor }]}>
                        {t('screen_about_text_1')}
                    </Text>
                    <Text
                        style={[
                            styles.description,
                            { color: theme.secondaryTextColor, marginTop: 6 },
                        ]}
                    >
                        {t('screen_about_text_2')}
                    </Text>

                    <View style={styles.linksContainer}>
                        <LinkButton
                            url="https://github.com/driedpampas/CO3/releases"
                            label={t('screen_about_news')}
                            theme={theme}
                            icon="new-releases"
                        />
                        <LinkButton
                            url="https://github.com/driedpampas/CO3"
                            label={t('screen_about_source')}
                            theme={theme}
                            icon="code"
                        />
                        <LinkButton
                            url="https://github.com/driedpampas/CO3/issues"
                            label="Issue Tracker & Feedback"
                            theme={theme}
                            icon="bug-report"
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function LinkButton({ url, label, theme, icon = 'link' }) {
    return (
        <TouchableOpacity
            style={[styles.linkRow, { borderColor: theme.borderColor }]}
            onPress={() => {
                InAppBrowser.open(url, {
                    showTitle: true,
                    toolbarColor: theme.backgroundColor,
                    enableUrlBarHiding: true,
                    enableDefaultShare: true,
                    forceCloseOnRedirection: false,
                    dismissButtonStyle: 'close',
                    preferredBarTintColor: theme.backgroundColor,
                    preferredControlTintColor: 'white',
                });
            }}
        >
            <Icon name={icon} size={20} color={theme.primaryColor} />
            <Text style={[styles.linkText, { color: theme.textColor }]}>{label}</Text>
            <Icon
                name="open-in-new"
                size={16}
                color={theme.placeholderColor || theme.secondaryTextColor}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    logo: {
        marginBottom: 12,
    },
    appTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    versionText: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 4,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    divider: {
        height: 1,
        marginHorizontal: 20,
        marginVertical: 12,
    },
    infoSection: {
        paddingHorizontal: 20,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    linksContainer: {
        marginTop: 20,
        gap: 10,
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        gap: 12,
    },
    linkText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
});
