import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { availableLanguages, changeLanguage } from '../../storage/LanguageManager';
import { getFlagEmoji } from '../../utils/FlagUtils';

export default function Step2({ currentTheme, setScreen }) {
    const { t, i18n } = useTranslation();
    const currentLng = i18n.language;

    const languages = availableLanguages.map(lang => ({
        key: lang.code,
        label: lang.label,
        emoji: lang.emoji || getFlagEmoji(lang.flag),
    }));

    const selectLanguage = async lng => {
        await changeLanguage(lng);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                <Text style={[styles.heading, { color: currentTheme.textColor }]}>
                    {t('onboard_step2_language_title')}
                </Text>
                <Text style={[styles.subheading, { color: currentTheme.secondaryTextColor }]}>
                    {t('onboard_step2_language_sub')}
                </Text>

                {/* Language Cards */}
                <View style={styles.cardList}>
                    {languages.map(lang => {
                        const isActive = lang.key === currentLng;

                        return (
                            <TouchableOpacity
                                key={lang.key}
                                style={[
                                    styles.languageCard,
                                    {
                                        backgroundColor: isActive
                                            ? `${currentTheme.primaryColor}10`
                                            : currentTheme.cardBackground,
                                        borderColor: isActive
                                            ? currentTheme.primaryColor
                                            : currentTheme.borderColor,
                                        borderWidth: isActive ? 2 : 1,
                                    },
                                ]}
                                onPress={() => selectLanguage(lang.key)}
                                activeOpacity={0.85}
                            >
                                <View style={styles.cardLeft}>
                                    <View
                                        style={[
                                            styles.emojiContainer,
                                            { backgroundColor: currentTheme.inputBackground },
                                        ]}
                                    >
                                        <Text style={styles.emojiText}>{lang.emoji}</Text>
                                    </View>
                                    <View style={styles.labelWrapper}>
                                        <Text
                                            style={[
                                                styles.languageLabel,
                                                { color: currentTheme.textColor },
                                            ]}
                                        >
                                            {lang.label}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.languageSubcode,
                                                { color: currentTheme.secondaryTextColor },
                                            ]}
                                        >
                                            {lang.key.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    style={[
                                        styles.radioCircle,
                                        {
                                            borderColor: isActive
                                                ? currentTheme.primaryColor
                                                : currentTheme.borderColor,
                                            backgroundColor: isActive
                                                ? currentTheme.primaryColor
                                                : 'transparent',
                                        },
                                    ]}
                                >
                                    {isActive && <Icon name="check" size={14} color="#ffffff" />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Navigation Footer */}
            <View style={styles.navRow}>
                <TouchableOpacity
                    style={[styles.backButton, { borderColor: currentTheme.borderColor }]}
                    onPress={() => setScreen(0)}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={20} color={currentTheme.textColor} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: currentTheme.primaryColor }]}
                    onPress={() => setScreen(2)}
                    activeOpacity={0.85}
                >
                    <Text style={styles.nextButtonText}>{t('onboard_step2_button')}</Text>
                    <Icon name="arrow-forward" size={18} color="#ffffff" />
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
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 16,
        flexGrow: 1,
    },
    heading: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    subheading: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    cardList: {
        gap: 10,
    },
    languageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    emojiContainer: {
        width: 42,
        height: 42,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emojiText: {
        fontSize: 24,
    },
    labelWrapper: {
        gap: 2,
    },
    languageLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    languageSubcode: {
        fontSize: 12,
        fontWeight: '500',
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
    },
    backButton: {
        width: 50,
        height: 50,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButton: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    nextButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});
