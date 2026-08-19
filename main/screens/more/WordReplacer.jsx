import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const STORAGE_KEY = 'WordReplaceRules';

export default function WordReplacer({ route }) {
    const { currentTheme } = route.params;

    const [rules, setRules] = useState([]);

    const { t } = useTranslation();
    const navigation = useNavigation();

    const loadRules = useCallback(async () => {
        try {
            const res = await AsyncStorage.getItem(STORAGE_KEY);
            setRules(res ? JSON.parse(res) : []);
        } catch (error) {
            console.error('Error loading word replace rules:', error);
        }
    }, []);

    useEffect(() => {
        loadRules();
    }, [loadRules]);

    async function saveRules(rulesToSave) {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rulesToSave));
        } catch (error) {
            console.error('Error saving word replace rules:', error);
        }
    }

    function findValidTitle(count = 0) {
        const testTitle =
            count === 0
                ? t('screen_word_replacer_new_rule')
                : t('screen_word_replacer_new_rule_count', { count });

        if (rules.some(rule => rule.title === testTitle)) {
            return findValidTitle(count + 1);
        }
        return testTitle;
    }

    function startEditing(rule) {
        navigation.push('RuleEditor', {
            rule: rule,
            currentTheme: currentTheme,
            onSave: updatedRule => saveRule(updatedRule, rule),
        });
    }

    async function addRule() {
        const newRule = {
            title: findValidTitle(),
            match: '',
            replace: '',
            caseSensitive: false,
            useRegex: false,
        };
        navigation.push('RuleEditor', {
            rule: newRule,
            currentTheme: currentTheme,
            onSave: createdRule => {
                setRules(prev => {
                    const updated = [...prev, createdRule];
                    saveRules(updated);
                    return updated;
                });
            },
        });
    }

    async function saveRule(updatedRule, targetRule) {
        const trimmedTitle = updatedRule.title.trim() || targetRule.title;

        const isDuplicate = rules.some(
            rule => rule !== targetRule && rule.title.toLowerCase() === trimmedTitle.toLowerCase(),
        );

        if (isDuplicate) {
            Alert.alert(
                t('screen_word_replacer_duplicate_title'),
                t('screen_word_replacer_duplicate_message', {
                    trimmedName: trimmedTitle,
                }),
                [{ text: t('general_ok'), onPress: () => {} }],
            );
            return;
        }

        const finalRule = { ...updatedRule, title: trimmedTitle };
        const updated = rules.map(rule => (rule === targetRule ? finalRule : rule));

        setRules(updated);
        await saveRules(updated);
    }

    function onBack() {
        navigation.goBack();
    }

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: currentTheme?.backgroundColor,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: currentTheme?.textColor,
        },
        container: {
            flex: 1,
            padding: 16,
        },
        ruleItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 12,
            borderWidth: 1,
            borderRadius: 8,
            borderColor: currentTheme?.borderColor,
            backgroundColor: currentTheme?.cardBackground,
            gap: 12,
        },
        ruleTextWrap: {
            flex: 1,
        },
        ruleTitle: {
            fontSize: 16,
            color: currentTheme?.textColor,
            paddingVertical: 8,
        },
        ruleSubtitle: {
            fontSize: 13,
            color: currentTheme?.secondaryTextColor,
        },
        iconButton: {
            padding: 8,
            justifyContent: 'center',
            alignItems: 'center',
        },
        addButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginVertical: 16,
            borderRadius: 8,
            backgroundColor: currentTheme?.primaryColor,
            gap: 8,
        },
        addButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
        },
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
        },
        emptyText: {
            fontSize: 16,
            color: currentTheme?.secondaryTextColor,
            textAlign: 'center',
        },
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={onBack}>
                        <Icon name="arrow-back" size={24} color={currentTheme?.textColor} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('screen_word_replacer_title')}</Text>
                </View>
            </View>

            <ScrollView style={styles.container}>
                {rules.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            {t('screen_word_replacer_empty_message')}
                        </Text>
                    </View>
                ) : (
                    rules.map(rule => (
                        <View key={rule.title} style={styles.ruleItem}>
                            <View style={styles.ruleTextWrap}>
                                <Text style={styles.ruleTitle}>{rule.title}</Text>
                                {rule.match || rule.replace ? (
                                    <Text style={styles.ruleSubtitle} numberOfLines={1}>
                                        {rule.match} | {rule.replace}
                                    </Text>
                                ) : null}
                            </View>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => startEditing(rule)}
                            >
                                <Icon name="edit" size={24} color={currentTheme?.textColor} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => showDeleteConfirmation(rule)}
                            >
                                <Icon name="delete" size={24} color="#ff6b6b" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>

            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <TouchableOpacity style={styles.addButton} onPress={addRule}>
                    <Icon name="add" size={24} color="white" />
                    <Text style={styles.addButtonText}>{t('screen_word_replacer_new_rule')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
