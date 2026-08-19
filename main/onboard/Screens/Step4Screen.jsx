import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SUPPORT_ITEMS = [
    {
        key: 'ao3',
        labelKey: 'onboard_step4_ao3_label',
        descriptionKey: 'onboard_step4_ao3_desc',
        ctaKey: 'onboard_step4_ao3_cta',
        url: 'https://archiveofourown.org/donate',
        color: '#22c55e',
        icon: 'favorite',
    },
    {
        key: 'co3',
        labelKey: 'onboard_step4_co3_label',
        descriptionKey: 'onboard_step4_co3_desc',
        ctaKey: 'onboard_step4_co3_cta',
        url: 'https://ko-fi.com/tbvns',
        color: '#ea580c',
        icon: 'coffee',
    },
];

export default function Step4({ currentTheme, setScreen, onFinish }) {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                <Text style={[styles.heading, { color: currentTheme.textColor }]}>
                    {t('onboard_step4_title')}
                </Text>
                <Text style={[styles.subheading, { color: currentTheme.secondaryTextColor }]}>
                    {t('onboard_step4_sub')}
                </Text>

                {/* Support Cards */}
                <View style={styles.cardList}>
                    {SUPPORT_ITEMS.map(item => (
                        <View
                            key={item.key}
                            style={[
                                styles.card,
                                {
                                    backgroundColor: currentTheme.cardBackground,
                                    borderColor: currentTheme.borderColor,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.cardIconWrap,
                                    { backgroundColor: `${item.color}18` },
                                ]}
                            >
                                <Icon name={item.icon} size={22} color={item.color} />
                            </View>
                            <View style={styles.cardBody}>
                                <Text style={[styles.cardTitle, { color: currentTheme.textColor }]}>
                                    {t(item.labelKey)}
                                </Text>
                                <Text
                                    style={[
                                        styles.cardDesc,
                                        { color: currentTheme.secondaryTextColor },
                                    ]}
                                >
                                    {t(item.descriptionKey)}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.ctaButton, { backgroundColor: item.color }]}
                                    onPress={() => Linking.openURL(item.url)}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.ctaText}>{t(item.ctaKey)}</Text>
                                    <Icon name="open-in-new" size={14} color="#ffffff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Navigation Footer */}
            <View style={[styles.navRow, { borderTopColor: currentTheme.borderColor }]}>
                <TouchableOpacity
                    style={[styles.backButton, { borderColor: currentTheme.borderColor }]}
                    onPress={() => setScreen(2)}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={20} color={currentTheme.textColor} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: currentTheme.primaryColor }]}
                    onPress={onFinish}
                    activeOpacity={0.85}
                >
                    <Text style={styles.nextButtonText}>{t('onboard_step4_button')}</Text>
                    <Icon name="check" size={20} color="#ffffff" />
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
        gap: 12,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        flexDirection: 'row',
        gap: 14,
    },
    cardIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    cardBody: {
        flex: 1,
        gap: 6,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    cardDesc: {
        fontSize: 13,
        lineHeight: 19,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginTop: 4,
    },
    ctaText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
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
