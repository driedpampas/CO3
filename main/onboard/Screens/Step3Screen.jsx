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
                                {/* Top row: Mockup dot/bar on left, Notch on right */}
                                <View style={styles.cardTopRow}>
                                    <View style={styles.mockupHeaderLeft}>
                                        <View
                                            style={[
                                                styles.mockupDot,
                                                { backgroundColor: themeItem.accent },
                                            ]}
                                        />
                                        <View
                                            style={[
                                                styles.mockupBar,
                                                { backgroundColor: themeItem.cardBg },
                                            ]}
                                        />
                                    </View>

                                    {/* Notch badge in upper right */}
                                    <View
                                        style={[
                                            styles.notch,
                                            {
                                                backgroundColor: themeItem.cardBg,
                                                borderColor: themeItem.border,
                                            },
                                        ]}
                                    >
                                        <Icon
                                            name={themeItem.icon}
                                            size={13}
                                            color={themeItem.text}
                                        />
                                        <Text style={[styles.notchText, { color: themeItem.text }]}>
                                            {t(themeItem.labelKey)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Skeleton content lines */}
                                <View style={styles.mockupBody}>
                                    <View
                                        style={[
                                            styles.mockupLine,
                                            {
                                                backgroundColor: themeItem.text,
                                                opacity: 0.85,
                                                width: '90%',
                                            },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.mockupLine,
                                            {
                                                backgroundColor: themeItem.subtext,
                                                opacity: 0.5,
                                                width: '75%',
                                            },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.mockupLine,
                                            {
                                                backgroundColor: themeItem.subtext,
                                                opacity: 0.3,
                                                width: '50%',
                                            },
                                        ]}
                                    />
                                </View>

                                {/* Centered Checkmark Badge floating above skeleton when active */}
                                {isActive && (
                                    <View style={styles.centerCheckOverlay} pointerEvents="none">
                                        <View
                                            style={[
                                                styles.centerCheckBadge,
                                                { backgroundColor: themeItem.accent },
                                            ]}
                                        >
                                            <Icon name="check" size={20} color="#ffffff" />
                                        </View>
                                    </View>
                                )}
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
        padding: 14,
        position: 'relative',
        overflow: 'hidden',
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    mockupHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    mockupDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    mockupBar: {
        width: 60,
        height: 6,
        borderRadius: 3,
    },
    notch: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    notchText: {
        fontSize: 12,
        fontWeight: '700',
    },
    mockupBody: {
        gap: 6,
    },
    mockupLine: {
        height: 6,
        borderRadius: 3,
    },
    centerCheckOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerCheckBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 4,
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
