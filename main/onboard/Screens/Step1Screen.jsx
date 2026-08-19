import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Step1({ currentTheme, setScreen }) {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                <View style={styles.heroSection}>
                    <Image
                        style={styles.logo}
                        source={require('../../res/CO3.png')}
                        resizeMode="contain"
                    />

                    <Text style={[styles.appName, { color: currentTheme.textColor }]}>
                        {t('general_app_name')}
                    </Text>

                    <Text style={[styles.tagline, { color: currentTheme.secondaryTextColor }]}>
                        {t('onboard_step1_title')}
                    </Text>

                    <View style={[styles.divider, { backgroundColor: currentTheme.borderColor }]} />

                    <Text style={[styles.body, { color: currentTheme.secondaryTextColor }]}>
                        {`${t('onboard_step1_ligne1')}\n${t('onboard_step1_ligne2')}`}
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.bottomSection}>
                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: currentTheme.primaryColor }]}
                    onPress={() => setScreen(1)}
                    activeOpacity={0.85}
                >
                    <Text style={styles.nextButtonText}>{t('onboard_step1_button')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: 16,
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroSection: {
        alignItems: 'center',
        maxWidth: 360,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    appName: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
        textAlign: 'center',
        marginBottom: 6,
    },
    tagline: {
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 20,
    },
    divider: {
        height: 1,
        width: 40,
        marginBottom: 20,
    },
    body: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
    },
    bottomSection: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
    },
    nextButton: {
        height: 50,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});
