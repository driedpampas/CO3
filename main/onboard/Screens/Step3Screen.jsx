import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { themes } from '../../utils/themes';

const THEMES = [
    {
        key: 'light',
        labelKey: 'screen_preferences_label_theme_light',
        icon: 'wb-sunny',
        bg: themes.light.backgroundColor,
        cardBg: themes.light.inputBackground,
        text: themes.light.textColor,
        subtext: themes.light.secondaryTextColor,
        accent: themes.light.primaryColor,
        border: themes.light.borderColor,
    },
    {
        key: 'dark',
        labelKey: 'screen_preferences_label_theme_dark',
        icon: 'brightness-3',
        bg: themes.dark.backgroundColor,
        cardBg: themes.dark.cardBackground,
        text: themes.dark.textColor,
        subtext: themes.dark.secondaryTextColor,
        accent: themes.dark.primaryColor,
        border: themes.dark.borderColor,
    },
    {
        key: 'black',
        labelKey: 'screen_preferences_label_theme_black',
        icon: 'brightness-1',
        bg: themes.black.backgroundColor,
        cardBg: themes.black.cardBackground,
        text: themes.black.textColor,
        subtext: themes.black.secondaryTextColor,
        accent: themes.black.primaryColor,
        border: themes.black.borderColor,
    },
];

export default function Step3({ currentTheme, setScreen, theme, setTheme }) {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                <Text style={[styles.heading, { color: currentTheme.textColor }]}>
                    {t('onboard_step3_title')}
                </Text>
                <Text style={[styles.subheading, { color: currentTheme.secondaryTextColor }]}>
                    {t('onboard_step3_sub')}
                </Text>

                {/* Theme Selection Cards */}
                <View style={styles.themeList}>
                    {THEMES.map(themeItem => {
                        const isActive = theme === themeItem.key;

                        return (
                            <TouchableOpacity
                                key={themeItem.key}
                                style={[
                                    styles.themeCard,
                                    {
                                        backgroundColor: themeItem.bg,
                                        borderColor: isActive
                                            ? themeItem.accent
                                            : currentTheme.borderColor,
                                        borderWidth: isActive ? 2 : 1,
                                    },
                                ]}
                                onPress={() => setTheme(themeItem.key)}
                                activeOpacity={0.85}
                            >
                                {/* Miniature UI Mockup */}
                                <View
                                    style={[
                                        styles.mockupHeader,
                                        { backgroundColor: themeItem.cardBg },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.mockupDot,
                                            { backgroundColor: themeItem.accent },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.mockupBar,
                                            {
                                                backgroundColor: themeItem.border,
                                                width: '45%',
                                            },
                                        ]}
                                    />
                                </View>

                                <View style={styles.mockupBody}>
                                    <View
                                        style={[
                                            styles.mockupLine,
                                            {
                                                backgroundColor: themeItem.text,
                                                opacity: 0.8,
                                                width: '80%',
                                            },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.mockupLine,
                                            {
                                                backgroundColor: themeItem.subtext,
                                                opacity: 0.5,
                                                width: '95%',
                                            },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.mockupLine,
                                            {
                                                backgroundColor: themeItem.subtext,
                                                opacity: 0.3,
                                                width: '60%',
                                            },
                                        ]}
                                    />
                                </View>

                                {/* Theme Label Bar */}
                                <View
                                    style={[
                                        styles.themeCardBottom,
                                        {
                                            borderTopColor: themeItem.border,
                                            backgroundColor: themeItem.cardBg,
                                        },
                                    ]}
                                >
                                    <View style={styles.labelRow}>
                                        <Icon
                                            name={themeItem.icon}
                                            size={16}
                                            color={themeItem.text}
                                        />
                                        <Text
                                            style={[styles.themeLabel, { color: themeItem.text }]}
                                        >
                                            {t(themeItem.labelKey)}
                                        </Text>
                                    </View>

                                    {isActive && (
                                        <View
                                            style={[
                                                styles.activeBadge,
                                                { backgroundColor: themeItem.accent },
                                            ]}
                                        >
                                            <Icon name="check" size={12} color="#ffffff" />
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Plain Info Text */}
                <Text style={[styles.infoText, { color: currentTheme.secondaryTextColor }]}>
                    {t('onboard_step3_info_text')}
                </Text>
            </ScrollView>

            {/* Navigation Footer */}
            <View style={styles.navRow}>
                <TouchableOpacity
                    style={[styles.backButton, { borderColor: currentTheme.borderColor }]}
                    onPress={() => setScreen(1)}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={20} color={currentTheme.textColor} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: currentTheme.primaryColor }]}
                    onPress={() => setScreen(3)}
                    activeOpacity={0.85}
                >
                    <Text style={styles.nextButtonText}>{t('onboard_step3_button')}</Text>
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
    themeList: {
        gap: 12,
        marginBottom: 16,
    },
    themeCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    mockupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    mockupDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    mockupBar: {
        height: 6,
        borderRadius: 3,
    },
    mockupBody: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 6,
    },
    mockupLine: {
        height: 6,
        borderRadius: 3,
    },
    themeCardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    themeLabel: {
        fontSize: 15,
        fontWeight: '700',
    },
    activeBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 12,
        paddingHorizontal: 8,
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
