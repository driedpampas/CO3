import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function HelpScreen({ route }) {
    const { currentTheme } = route.params;
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
                    {t('screen_help_title')}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroSection}>
                    <Image style={styles.logo} source={require('../../res/logo.png')} />
                    <Text style={[styles.appTitle, { color: theme.textColor }]}>
                        {t('general_app_name')} Help & Support
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.secondaryTextColor }]}>
                        {t('screen_help_sub')}
                    </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

                <View style={styles.section}>
                    <Text style={[styles.sectionHeading, { color: theme.textColor }]}>
                        Troubleshooting & Feedback
                    </Text>
                    <Text style={[styles.description, { color: theme.secondaryTextColor }]}>
                        Have a problem, found a bug, or have a feature request? Submit an issue on
                        our GitHub repository.
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.linkRow,
                            {
                                borderColor: theme.borderColor,
                                backgroundColor: theme.cardBackground,
                            },
                        ]}
                        onPress={() => Linking.openURL('https://github.com/driedpampas/CO3/issues')}
                    >
                        <Icon name="bug-report" size={22} color={theme.primaryColor} />
                        <View style={styles.linkTextWrap}>
                            <Text style={[styles.linkTitle, { color: theme.textColor }]}>
                                {t('screen_help_github')}
                            </Text>
                            <Text style={[styles.linkSub, { color: theme.secondaryTextColor }]}>
                                Report bugs and request new features
                            </Text>
                        </View>
                        <Icon
                            name="open-in-new"
                            size={18}
                            color={theme.placeholderColor || theme.secondaryTextColor}
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
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
        width: 72,
        height: 72,
        borderRadius: 18,
        marginBottom: 12,
    },
    appTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        marginHorizontal: 20,
        marginVertical: 12,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 8,
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    linkTextWrap: {
        flex: 1,
    },
    linkTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    linkSub: {
        fontSize: 12,
    },
});
