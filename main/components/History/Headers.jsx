import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const HistoryHeader = ({
    currentTheme,
    totalCount: _totalCount,
    isFilterActive,
    hasHistory,
    onClearHistory,
    onClearFilter,
    _isKudosHistory = false,
}) => {
    const { t } = useTranslation();

    if (!isFilterActive && !hasHistory) {
        return null;
    }

    return (
        <View style={styles.header}>
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
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 6,
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
