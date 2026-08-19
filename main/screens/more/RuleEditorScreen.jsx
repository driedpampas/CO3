import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Material3Switch from '../../components/common/Material3Switch';

export default function RuleEditorScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { t } = useTranslation();

    const { rule, currentTheme, onSave } = route.params || {};

    const [title, setTitle] = useState(rule?.title ?? '');
    const [match, setMatch] = useState(rule?.match ?? '');
    const [replace, setReplace] = useState(rule?.replace ?? '');
    const [caseSensitive, setCaseSensitive] = useState(!!rule?.caseSensitive);
    const [useRegex, setUseRegex] = useState(!!rule?.useRegex);
    const [testInput, setTestInput] = useState('');

    const theme = currentTheme || {
        backgroundColor: '#ffffff',
        textColor: '#171717',
        secondaryTextColor: '#525252',
        inputBackground: '#f5f5f5',
        cardBackground: '#ffffff',
        borderColor: '#e5e5e5',
        primaryColor: '#7c3aed',
        placeholderColor: '#a3a3a3',
    };

    const previewResult = useMemo(() => {
        if (!testInput || !match) return testInput;
        try {
            if (useRegex) {
                const flags = caseSensitive ? 'g' : 'gi';
                const regex = new RegExp(match, flags);
                return testInput.replace(regex, replace);
            }
            if (caseSensitive) {
                return testInput.replaceAll(match, replace);
            }
            const regex = new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            return testInput.replace(regex, replace);
        } catch (err) {
            return `Regex Error: ${err.message}`;
        }
    }, [testInput, match, replace, caseSensitive, useRegex]);

    const handleSave = () => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            Alert.alert('Error', 'Rule title cannot be empty.');
            return;
        }

        if (useRegex) {
            try {
                new RegExp(match);
            } catch (err) {
                Alert.alert('Invalid Regex', err.message);
                return;
            }
        }

        if (onSave) {
            onSave({
                ...rule,
                title: trimmedTitle,
                match,
                replace,
                caseSensitive,
                useRegex,
            });
        }
        navigation.goBack();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            {/* Top Bar */}
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: theme.headerBackground || theme.backgroundColor,
                        borderBottomColor: theme.borderColor,
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerIconButton}
                >
                    <Icon name="arrow-back" size={24} color={theme.textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textColor }]}>
                    {rule?.title
                        ? t('component_rule_edit_header')
                        : t('screen_word_replacer_new_rule')}
                </Text>
                <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.saveButton, { backgroundColor: theme.primaryColor }]}
                >
                    <Text style={styles.saveButtonText}>{t('general_save')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Form Fields */}
                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.cardBackground,
                            borderColor: theme.borderColor,
                        },
                    ]}
                >
                    <Text style={[styles.fieldLabel, { color: theme.textColor }]}>
                        {t('component_rule_edit_title_label')}
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: theme.textColor,
                                borderColor: theme.borderColor,
                                backgroundColor: theme.inputBackground,
                            },
                        ]}
                        value={title}
                        onChangeText={setTitle}
                        placeholder={t('component_rule_edit_title_placeholder')}
                        placeholderTextColor={theme.placeholderColor}
                    />

                    <Text style={[styles.fieldLabel, { color: theme.textColor, marginTop: 14 }]}>
                        {t('component_rule_edit_match_label')}
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: theme.textColor,
                                borderColor: theme.borderColor,
                                backgroundColor: theme.inputBackground,
                            },
                        ]}
                        value={match}
                        onChangeText={setMatch}
                        placeholder={t('component_rule_edit_match_placeholder')}
                        placeholderTextColor={theme.placeholderColor}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text style={[styles.fieldLabel, { color: theme.textColor, marginTop: 14 }]}>
                        {t('component_rule_edit_replace_label')}
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: theme.textColor,
                                borderColor: theme.borderColor,
                                backgroundColor: theme.inputBackground,
                            },
                        ]}
                        value={replace}
                        onChangeText={setReplace}
                        placeholder={t('component_rule_edit_replace_placeholder')}
                        placeholderTextColor={theme.placeholderColor}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                {/* Options Toggles */}
                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.cardBackground,
                            borderColor: theme.borderColor,
                            marginTop: 12,
                        },
                    ]}
                >
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleTextContainer}>
                            <View style={styles.toggleIconLabel}>
                                <MCIcon
                                    name="format-letter-case"
                                    size={20}
                                    color={theme.primaryColor}
                                />
                                <Text style={[styles.toggleTitle, { color: theme.textColor }]}>
                                    {t('component_rule_edit_case_sensitive_label')}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.toggleDescription,
                                    { color: theme.secondaryTextColor },
                                ]}
                            >
                                Match exact upper/lowercase letters
                            </Text>
                        </View>
                        <Material3Switch
                            value={caseSensitive}
                            onValueChange={setCaseSensitive}
                            theme={theme}
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

                    <View style={styles.toggleRow}>
                        <View style={styles.toggleTextContainer}>
                            <View style={styles.toggleIconLabel}>
                                <MCIcon name="regex" size={20} color={theme.primaryColor} />
                                <Text style={[styles.toggleTitle, { color: theme.textColor }]}>
                                    {t('component_rule_edit_regex_label')}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.toggleDescription,
                                    { color: theme.secondaryTextColor },
                                ]}
                            >
                                Treat match expression as regular expression
                            </Text>
                        </View>
                        <Material3Switch
                            value={useRegex}
                            onValueChange={setUseRegex}
                            theme={theme}
                        />
                    </View>
                </View>

                {/* Live Tester / Playground */}
                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.cardBackground,
                            borderColor: theme.borderColor,
                            marginTop: 12,
                        },
                    ]}
                >
                    <View style={styles.playgroundHeader}>
                        <Icon name="science" size={20} color={theme.primaryColor} />
                        <Text style={[styles.playgroundTitle, { color: theme.textColor }]}>
                            Live Rule Tester
                        </Text>
                    </View>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: theme.textColor,
                                borderColor: theme.borderColor,
                                backgroundColor: theme.inputBackground,
                                minHeight: 60,
                            },
                        ]}
                        value={testInput}
                        onChangeText={setTestInput}
                        placeholder="Type test text here to test replacement in real-time..."
                        placeholderTextColor={theme.placeholderColor}
                        multiline
                    />
                    <Text style={[styles.previewLabel, { color: theme.secondaryTextColor }]}>
                        Preview Result:
                    </Text>
                    <View
                        style={[
                            styles.previewBox,
                            {
                                backgroundColor: theme.inputBackground,
                                borderColor: theme.borderColor,
                            },
                        ]}
                    >
                        <Text style={{ color: theme.textColor, fontSize: 14 }}>
                            {previewResult || '(Enter sample text above to preview)'}
                        </Text>
                    </View>
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerIconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        marginLeft: 12,
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
    },
    input: {
        fontSize: 15,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    toggleTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    toggleIconLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    toggleTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    toggleDescription: {
        fontSize: 12,
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginVertical: 8,
    },
    playgroundHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    playgroundTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    previewLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 4,
    },
    previewBox: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        minHeight: 44,
    },
});
