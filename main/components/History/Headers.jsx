import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const HistoryHeader = ({
    currentTheme,
    totalCount,
    isFilterActive,
    hasHistory,
    onClearHistory,
    onClearFilter,
    _isKudosHistory = false,
}) => {
    const { t } = useTranslation();

    return (
        <View style={styles.header}>
            <Text style={[styles.subtitle, { color: currentTheme.secondaryTextColor }]}>
                {isFilterActive
                    ? totalCount > 1
                        ? t('component_history_header_count_filtered_plural', {
                              totalCount: totalCount,
                          })
                        : t('component_history_header_count_filtered', {
                              totalCount: totalCount,
                          })
                    : totalCount > 1
                      ? t('component_history_header_count_plural', {
                            totalCount: totalCount,
                        })
                      : t('component_history_header_count', { totalCount: totalCount })}
            </Text>

            <View style={styles.headerButtons}>
                {isFilterActive && (
                    <TouchableOpacity
                        style={[
                            styles.clearFilterButton,
                            { backgroundColor: currentTheme.primaryColor },
                        ]}
                        onPress={onClearFilter}
                    >
                        <Text style={[styles.clearFilterText, { color: 'white' }]}>
                            {t('component_history_header_clear_filter')}
                        </Text>
                    </TouchableOpacity>
                )}

                {hasHistory && (
                    <TouchableOpacity
                        style={[styles.clearButton, { borderColor: currentTheme.borderColor }]}
                        onPress={onClearHistory}
                    >
                        <Text
                            style={[
                                styles.clearButtonText,
                                { color: currentTheme.secondaryTextColor },
                            ]}
                        >
                            {t('component_history_header_clear_history')}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 6,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    clearFilterButton: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearFilterText: {
        fontSize: 12,
        fontWeight: '500',
    },
    clearButton: {
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    clearButtonText: {
        fontSize: 12,
        fontWeight: '500',
    },
});

export default HistoryHeader;
