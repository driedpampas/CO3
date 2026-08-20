import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    DeviceEventEmitter,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import UpdateBookCard from '../components/Update/UpdateBookCard';
import { STORAGE_KEYS } from '../utils/constants';
import { run } from '../web/updater';

const UpdateScreen = ({
    currentTheme,
    updateDAO,
    workDAO,
    setScreens,
    screens: _screens,
    libraryDAO,
    settingsDAO,
    historyDAO,
    progressDAO,
    kudoHistoryDAO,
    openTagSearch,
    databaseObj,
    chapterDAO,
    lastUpdate: _lastUpdate,
    setLastUpdate,
    refreshing: refreshingProp,
    setRefreshing: setRefreshingProp,
    handleManualUpdate: handleManualUpdateProp,
}) => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [localRefreshing, setLocalRefreshing] = useState(false);

    const refreshing = refreshingProp !== undefined ? refreshingProp : localRefreshing;
    const setRefreshing = setRefreshingProp || setLocalRefreshing;

    const navigation = useNavigation();

    const { t } = useTranslation();

    const formatRelativeTime = useCallback(
        date => {
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return t('screen_update_time_now');
            if (diffMins < 60)
                return diffMins > 1
                    ? t('screen_update_time_minute_plural', { count: diffMins })
                    : t('screen_update_time_minute', { count: diffMins });
            if (diffHours < 24)
                return diffHours > 1
                    ? t('screen_update_time_hour_plural', { count: diffHours })
                    : t('screen_update_time_hour', { count: diffHours });
            return diffDays > 1
                ? t('screen_update_time_day_plural', { count: diffDays })
                : t('screen_update_time_day', { count: diffDays });
        },
        [t],
    );

    const loadUpdates = useCallback(async () => {
        try {
            if (updateDAO) {
                const allUpdates = await updateDAO.getAll();
                // Sort updates by date descending (newest first)
                const sortedUpdates = allUpdates.sort((a, b) => b.date - a.date);
                setUpdates(sortedUpdates);

                let latestTimestamp = null;
                const lastCheckedStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATE_CHECK);
                if (lastCheckedStr) {
                    const parsed = parseInt(lastCheckedStr, 10);
                    if (!Number.isNaN(parsed)) {
                        latestTimestamp = parsed;
                    }
                }
                if (sortedUpdates.length > 0) {
                    latestTimestamp = Math.max(latestTimestamp || 0, sortedUpdates[0].date);
                }

                if (latestTimestamp) {
                    if (setLastUpdate) {
                        setLastUpdate(formatRelativeTime(new Date(latestTimestamp)));
                    }
                } else if (setLastUpdate) {
                    setLastUpdate(null);
                }
            }
        } catch (error) {
            console.error('Error loading updates:', error);
        } finally {
            setLoading(false);
        }
    }, [updateDAO, formatRelativeTime, setLastUpdate]);

    useEffect(() => {
        loadUpdates();
    }, [loadUpdates]);

    useEffect(() => {
        if (!refreshing) {
            loadUpdates();
        }
    }, [refreshing, loadUpdates]);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('doubleTap', _id => {
            console.log('Should open the download manager screen but not implemented rn');
            Toast.show({
                type: 'error',
                text1: 'Not implemented yet !',
                text2: 'Future download manager screen will be here.',
            });
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const handleManualUpdate = useCallback(async () => {
        if (handleManualUpdateProp) {
            await handleManualUpdateProp();
            return;
        }
        setRefreshing(true);
        try {
            await run(databaseObj);
            await loadUpdates();
        } catch (error) {
            console.error('Error running manual update:', error);
        } finally {
            setRefreshing(false);
        }
    }, [handleManualUpdateProp, setRefreshing, databaseObj, loadUpdates]);

    const groupUpdatesByDate = updatesList => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const groups = {
            today: [],
            yesterday: [],
            older: [],
        };

        updatesList.forEach(update => {
            const updateDate = new Date(update.date);
            updateDate.setHours(0, 0, 0, 0);

            if (updateDate.getTime() === today.getTime()) {
                groups.today.push(update);
            } else if (updateDate.getTime() === yesterday.getTime()) {
                groups.yesterday.push(update);
            } else {
                groups.older.push(update);
            }
        });

        return groups;
    };

    const handleUpdatePress = async update => {
        let loadChapterIndex = null;

        if (update.chapterNumber) {
            try {
                const work = await workDAO.get(update.workId);

                if (work?.chapters) {
                    const targetNum = parseInt(update.chapterNumber, 10);
                    const idx = work.chapters.findIndex(c => c.number === targetNum);

                    if (idx !== -1) {
                        loadChapterIndex = idx;
                    } else {
                        loadChapterIndex = targetNum - 1;
                    }
                }
            } catch (e) {
                console.log('Error finding chapter index', e);
                loadChapterIndex = update.chapterNumber - 1;
            }
        }

        navigation.push('Work', {
            key: `update_${update.id}`,
            workId: update.workId,
            currentTheme: currentTheme,
            libraryDAO: libraryDAO,
            workDAO: workDAO,
            setScreens: setScreens,
            settingsDAO: settingsDAO,
            historyDAO: historyDAO,
            progressDAO: progressDAO,
            kudoHistoryDAO: kudoHistoryDAO,
            openTagSearch: openTagSearch,
            loadChapter: loadChapterIndex,
            chapterDAO: chapterDAO,
        });
    };

    if (loading) {
        return (
            <View
                style={[styles.centerContainer, { backgroundColor: currentTheme.backgroundColor }]}
            >
                <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
                    {t('screen_update_loading')}
                </Text>
            </View>
        );
    }

    const groupedUpdates = groupUpdatesByDate(updates);

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    updates.length === 0 && styles.emptyScrollContent,
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleManualUpdate}
                        colors={[currentTheme.primaryColor]}
                        tintColor={currentTheme.primaryColor}
                        progressBackgroundColor={currentTheme.cardBackground}
                    />
                }
            >
                {updates.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="check-circle" size={64} color={currentTheme.placeholderColor} />
                        <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
                            {t('screen_update_no_update')}
                        </Text>
                        <Text
                            style={[
                                styles.emptySubtext,
                                { color: currentTheme.secondaryTextColor },
                            ]}
                        >
                            {t('screen_update_no_update_sub')}
                        </Text>
                    </View>
                ) : (
                    <>
                        {groupedUpdates.today.length > 0 && (
                            <View style={styles.section}>
                                <Text
                                    style={[styles.sectionTitle, { color: currentTheme.textColor }]}
                                >
                                    {t('screen_update_today')}
                                </Text>
                                {groupedUpdates.today.map(update => (
                                    <UpdateBookCard
                                        key={update.id}
                                        update={update}
                                        workDAO={workDAO}
                                        theme={currentTheme}
                                        onPress={() => handleUpdatePress(update)}
                                        chapter={update}
                                    />
                                ))}
                            </View>
                        )}

                        {groupedUpdates.yesterday.length > 0 && (
                            <View style={styles.section}>
                                <Text
                                    style={[styles.sectionTitle, { color: currentTheme.textColor }]}
                                >
                                    {t('screen_update_yesterday')}
                                </Text>
                                {groupedUpdates.yesterday.map(update => (
                                    <UpdateBookCard
                                        key={update.id}
                                        update={update}
                                        workDAO={workDAO}
                                        theme={currentTheme}
                                        onPress={() => handleUpdatePress(update)}
                                    />
                                ))}
                            </View>
                        )}

                        {groupedUpdates.older.length > 0 && (
                            <View style={styles.section}>
                                <Text
                                    style={[styles.sectionTitle, { color: currentTheme.textColor }]}
                                >
                                    {t('screen_update_earlier')}
                                </Text>
                                {groupedUpdates.older.map(update => (
                                    <UpdateBookCard
                                        key={update.id}
                                        update={update}
                                        workDAO={workDAO}
                                        theme={currentTheme}
                                        onPress={() => handleUpdatePress(update)}
                                    />
                                ))}
                            </View>
                        )}
                    </>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    emptyScrollContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginHorizontal: 12,
        marginBottom: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 13,
        marginTop: 6,
        textAlign: 'center',
    },
    loadingText: {
        fontSize: 14,
    },
    bottomPadding: {
        height: 70,
    },
});

export default UpdateScreen;
