import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Bar } from 'react-native-progress';
import RNRestart from 'react-native-restart';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppContext } from '../../app';
import CustomToast from '../../components/common/CustomToast';
import Material3Switch from '../../components/common/Material3Switch';
import { countDownloads, deleteAllDownloads } from '../../downloads/Downloader';
import { exportBackup, importBackup, inspectBackup } from '../../storage/Backups';
import { clearUnusedCache, database } from '../../storage/DatabaseManager';

export default function StorageScreen({ route }) {
    const { currentTheme, databaseObj = database } = route.params || {};
    const { workDAO, chapterDAO } = useContext(AppContext);
    const navigation = useNavigation();
    const { t } = useTranslation();

    const [storageData, setStorageData] = useState();
    const [downloadedCount, setDownloadedCount] = useState();
    const [cachedWorksCount, setCachedWorksCount] = useState();
    const [cachedChaptersCount, setCachedChaptersCount] = useState();

    // Backup & Restore Granular Modals
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportSettings, setExportSettings] = useState(true);
    const [exportDatabase, setExportDatabase] = useState(true);
    const [exportDownloads, setExportDownloads] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    const [showImportModal, setShowImportModal] = useState(false);
    const [importZipPath, setImportZipPath] = useState(null);
    const [importManifest, setImportManifest] = useState(null);
    const [importSettings, setImportSettings] = useState(true);
    const [importDatabase, setImportDatabase] = useState(true);
    const [importDownloads, setImportDownloads] = useState(true);
    const [isImporting, setIsImporting] = useState(false);

    function onBack() {
        navigation.goBack();
    }

    const getStorageData = useCallback(async () => {
        try {
            const totalSpace = await DeviceInfo.getTotalDiskCapacity();
            const freeSpace = await DeviceInfo.getFreeDiskStorage();

            const totalRawGB = totalSpace / (1024 * 1024 * 1024);
            const freeRawGB = freeSpace / (1024 * 1024 * 1024);
            const usedRawGB = totalRawGB - freeRawGB;

            setStorageData({
                totalSpace,
                freeSpace,
                totalGB: totalRawGB.toFixed(2),
                freeGB: freeRawGB.toFixed(2),
                usedGB: usedRawGB.toFixed(2),
            });
        } catch (e) {
            console.error('Storage data error:', e);
        }
    }, []);

    const getDownloadedCount = useCallback(async () => {
        try {
            setDownloadedCount(await countDownloads());
        } catch (e) {
            console.error('Count downloads error:', e);
        }
    }, []);

    const getCachedCount = useCallback(async () => {
        try {
            if (workDAO) setCachedWorksCount(await workDAO.countWorks());
            if (chapterDAO) setCachedChaptersCount(await chapterDAO.countChapters());
        } catch (e) {
            console.error('Cached count error:', e);
        }
    }, [workDAO, chapterDAO]);

    useEffect(() => {
        getStorageData();
        getDownloadedCount();
        getCachedCount();
    }, [getStorageData, getDownloadedCount, getCachedCount]);

    async function clearCache() {
        clearUnusedCache(databaseObj)
            .then(count => {
                Toast.show({
                    text1: t('screen_storage_button_clear_unused_cache_success_1'),
                    text2: t('screen_storage_button_clear_unused_cache_success_2', {
                        count,
                    }),
                    type: 'success',
                });
            })
            .catch(err => {
                Toast.show({
                    text1: t('screen_storage_button_clear_unused_cache_err_1'),
                    text2: t('screen_storage_button_clear_unused_cache_err_2', {
                        error: err.message,
                    }),
                    type: 'error',
                });
            })
            .finally(() => {
                getCachedCount();
                getStorageData();
            });
    }

    async function deleteDownloads() {
        Alert.alert(
            t('screen_storage_button_delete_downloaded'),
            'Are you sure you want to delete all downloaded chapters?',
            [
                { text: t('general_cancel'), style: 'cancel' },
                {
                    text: t('general_delete'),
                    style: 'destructive',
                    onPress: async () => {
                        await deleteAllDownloads()
                            .then(res => {
                                if (!res) {
                                    Toast.show({
                                        type: 'success',
                                        text1: t(
                                            'screen_storage_button_delete_downloaded_success_1',
                                        ),
                                        text2: t(
                                            'screen_storage_button_delete_downloaded_success_2',
                                        ),
                                    });
                                } else {
                                    Toast.show({
                                        type: 'error',
                                        text1: t(
                                            'screen_storage_button_delete_downloaded_failed_1',
                                        ),
                                        text2: t(
                                            'screen_storage_button_delete_downloaded_failes_2',
                                            {
                                                error: res.message,
                                            },
                                        ),
                                    });
                                }
                            })
                            .finally(() => {
                                getDownloadedCount();
                                getStorageData();
                            });
                    },
                },
            ],
        );
    }

    async function handleExecuteExport() {
        if (!exportSettings && !exportDatabase && !exportDownloads) {
            Alert.alert('Selection Required', 'Please select at least one item to backup.');
            return;
        }

        setIsExporting(true);
        try {
            const outPath = await exportBackup(databaseObj, {
                includeSettings: exportSettings,
                includeDatabase: exportDatabase,
                includeDownloads: exportDownloads,
            });
            setShowExportModal(false);
            Toast.show({
                type: 'success',
                text1: t('screen_storage_button_create_backup_success_1'),
                text2: outPath.split('/').pop(),
            });
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: t('screen_storage_button_create_backup_err_1'),
                text2: err?.message || String(err),
            });
        } finally {
            setIsExporting(false);
        }
    }

    async function onPickBackupFile() {
        try {
            const [file] = await pick({
                type: [types.zip],
            });

            const zipPath = file.uri.replace('file://', '');
            const manifest = await inspectBackup(zipPath);

            setImportZipPath(zipPath);
            setImportManifest(manifest);
            setImportSettings(manifest.hasSettings);
            setImportDatabase(manifest.hasDatabase);
            setImportDownloads(manifest.hasDownloads);
            setShowImportModal(true);
        } catch (err) {
            if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                // Cancelled by user
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Invalid Backup',
                    text2: err.message,
                });
            }
        }
    }

    async function handleExecuteImport() {
        if (!importSettings && !importDatabase && !importDownloads) {
            Alert.alert('Selection Required', 'Please select at least one item to restore.');
            return;
        }

        setIsImporting(true);
        try {
            await importBackup(databaseObj, importZipPath, {
                includeSettings: importSettings,
                includeDatabase: importDatabase,
                includeDownloads: importDownloads,
            });

            setShowImportModal(false);
            Toast.show({
                type: 'success',
                text1: t('screen_storage_button_import_backup_success_1'),
                text2: t('screen_storage_button_import_backup_success_2'),
            });

            setTimeout(() => {
                RNRestart.restart();
            }, 1200);
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: t('screen_storage_button_import_backup_err_1'),
                text2: err.message,
            });
        } finally {
            setIsImporting(false);
        }
    }

    const theme = currentTheme || {
        backgroundColor: '#f5f5f5',
        textColor: '#171717',
        secondaryTextColor: '#525252',
        cardBackground: '#ffffff',
        borderColor: '#e5e5e5',
        primaryColor: '#7c3aed',
        iconColor: '#525252',
        inputBackground: '#ebebeb',
    };

    return (
        <SafeAreaView style={[{ backgroundColor: theme.backgroundColor }, styles.container]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Icon name="arrow-back" size={24} color={theme.textColor} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.textColor }]}>
                    {t('screen_storage_title')}
                </Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Storage Overview */}
                <View style={styles.sectionHeader}>
                    <Icon name="storage" size={20} color={theme.iconColor} />
                    <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
                        {t('screen_storage_section_storage')}
                    </Text>
                </View>

                <View
                    style={[
                        styles.pane,
                        {
                            backgroundColor: theme.cardBackground,
                            borderColor: theme.borderColor,
                        },
                    ]}
                >
                    <Text style={[{ color: theme.textColor, paddingBottom: 6 }, styles.text]}>
                        {t('screen_storage_msg_usage', {
                            total: storageData?.totalGB || '?',
                            used: storageData?.usedGB || '?',
                        })}
                    </Text>
                    <Bar
                        progress={
                            storageData?.freeGB && storageData?.totalGB
                                ? storageData.usedGB / storageData.totalGB
                                : 0
                        }
                        width={null}
                        color={theme.primaryColor}
                        backgroundColor={theme.inputBackground}
                        borderColor={theme.borderColor}
                        height={8}
                        borderRadius={4}
                    />
                    <View style={styles.statsRow}>
                        <Text style={[{ color: theme.secondaryTextColor }, styles.statText]}>
                            {t('screen_storage_msg_downloaded_count', {
                                count: downloadedCount?.chapterCount ?? 0,
                            })}
                        </Text>
                        <Text style={[{ color: theme.secondaryTextColor }, styles.statText]}>
                            {t('screen_storage_msg_cached_works_count', {
                                count: cachedWorksCount ?? 0,
                            })}
                        </Text>
                        <Text style={[{ color: theme.secondaryTextColor }, styles.statText]}>
                            {t('screen_storage_msg_cached_chapters_count', {
                                count: cachedChaptersCount ?? 0,
                            })}
                        </Text>
                    </View>
                </View>

                {/* 2x2 Grid for Actions */}
                <Text style={[styles.gridHeading, { color: theme.secondaryTextColor }]}>
                    Actions & Management
                </Text>
                <View style={styles.gridContainer}>
                    <TouchableOpacity
                        style={[
                            styles.gridButton,
                            {
                                backgroundColor: theme.cardBackground,
                                borderColor: theme.borderColor,
                            },
                        ]}
                        onPress={clearCache}
                    >
                        <View
                            style={[
                                styles.gridIconWrap,
                                { backgroundColor: `${theme.primaryColor}15` },
                            ]}
                        >
                            <Icon name="cleaning-services" size={22} color={theme.primaryColor} />
                        </View>
                        <Text style={[styles.gridButtonTitle, { color: theme.textColor }]}>
                            {t('screen_storage_button_clear_unused_cache')}
                        </Text>
                        <Text style={[styles.gridButtonSub, { color: theme.secondaryTextColor }]}>
                            Clean unused work cache
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.gridButton,
                            {
                                backgroundColor: theme.cardBackground,
                                borderColor: theme.borderColor,
                            },
                        ]}
                        onPress={deleteDownloads}
                    >
                        <View style={[styles.gridIconWrap, { backgroundColor: '#ef444415' }]}>
                            <Icon name="delete-sweep" size={22} color="#ef4444" />
                        </View>
                        <Text style={[styles.gridButtonTitle, { color: theme.textColor }]}>
                            {t('screen_storage_button_delete_downloaded')}
                        </Text>
                        <Text style={[styles.gridButtonSub, { color: theme.secondaryTextColor }]}>
                            Free downloaded files
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.gridButton,
                            {
                                backgroundColor: theme.cardBackground,
                                borderColor: theme.borderColor,
                            },
                        ]}
                        onPress={() => setShowExportModal(true)}
                    >
                        <View
                            style={[
                                styles.gridIconWrap,
                                { backgroundColor: `${theme.primaryColor}15` },
                            ]}
                        >
                            <Icon name="backup" size={22} color={theme.primaryColor} />
                        </View>
                        <Text style={[styles.gridButtonTitle, { color: theme.textColor }]}>
                            {t('screen_storage_button_create_backup')}
                        </Text>
                        <Text style={[styles.gridButtonSub, { color: theme.secondaryTextColor }]}>
                            Export granular archive
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.gridButton,
                            {
                                backgroundColor: theme.cardBackground,
                                borderColor: theme.borderColor,
                            },
                        ]}
                        onPress={onPickBackupFile}
                    >
                        <View
                            style={[
                                styles.gridIconWrap,
                                { backgroundColor: `${theme.primaryColor}15` },
                            ]}
                        >
                            <Icon
                                name="settings-backup-restore"
                                size={22}
                                color={theme.primaryColor}
                            />
                        </View>
                        <Text style={[styles.gridButtonTitle, { color: theme.textColor }]}>
                            {t('screen_storage_button_import_backup')}
                        </Text>
                        <Text style={[styles.gridButtonSub, { color: theme.secondaryTextColor }]}>
                            Restore from .zip file
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footerNotes}>
                    <Text style={[styles.noteText, { color: theme.secondaryTextColor }]}>
                        {t('screen_storage_msg_backup_1')}
                    </Text>
                    <Text style={[styles.noteText, { color: theme.secondaryTextColor }]}>
                        {t('screen_storage_msg_backup_2')}
                    </Text>
                </View>
            </ScrollView>

            {/* Granular Export Modal */}
            <Modal visible={showExportModal} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View
                        style={[
                            styles.modalCard,
                            {
                                backgroundColor: theme.cardBackground,
                                borderColor: theme.borderColor,
                            },
                        ]}
                    >
                        <Text style={[styles.modalTitle, { color: theme.textColor }]}>
                            Create Backup
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: theme.secondaryTextColor }]}>
                            Select the items you would like to include in this backup archive:
                        </Text>

                        <View style={styles.checkRow}>
                            <Text style={[styles.checkLabel, { color: theme.textColor }]}>
                                Settings & Preferences
                            </Text>
                            <Material3Switch
                                value={exportSettings}
                                onValueChange={setExportSettings}
                                theme={theme}
                            />
                        </View>
                        <View style={styles.checkRow}>
                            <Text style={[styles.checkLabel, { color: theme.textColor }]}>
                                Library & History Database
                            </Text>
                            <Material3Switch
                                value={exportDatabase}
                                onValueChange={setExportDatabase}
                                theme={theme}
                            />
                        </View>
                        <View style={styles.checkRow}>
                            <Text style={[styles.checkLabel, { color: theme.textColor }]}>
                                Offline Downloads
                            </Text>
                            <Material3Switch
                                value={exportDownloads}
                                onValueChange={setExportDownloads}
                                theme={theme}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, { borderColor: theme.borderColor }]}
                                onPress={() => setShowExportModal(false)}
                                disabled={isExporting}
                            >
                                <Text style={{ color: theme.textColor }}>
                                    {t('general_cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.modalPrimaryButton,
                                    { backgroundColor: theme.primaryColor },
                                ]}
                                onPress={handleExecuteExport}
                                disabled={isExporting}
                            >
                                {isExporting ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={{ color: 'white', fontWeight: '600' }}>
                                        Export
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Granular Import / Manifest Modal */}
            <Modal visible={showImportModal} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View
                        style={[
                            styles.modalCard,
                            {
                                backgroundColor: theme.cardBackground,
                                borderColor: theme.borderColor,
                            },
                        ]}
                    >
                        <Text style={[styles.modalTitle, { color: theme.textColor }]}>
                            Restore Backup
                        </Text>
                        {importManifest?.createdAt && (
                            <Text
                                style={[styles.manifestDate, { color: theme.secondaryTextColor }]}
                            >
                                Created: {new Date(importManifest.createdAt).toLocaleString()}
                            </Text>
                        )}
                        <Text style={[styles.modalSubtitle, { color: theme.secondaryTextColor }]}>
                            Select components to restore from this archive:
                        </Text>

                        {importManifest?.hasSettings && (
                            <View style={styles.checkRow}>
                                <Text style={[styles.checkLabel, { color: theme.textColor }]}>
                                    Settings & Preferences
                                </Text>
                                <Material3Switch
                                    value={importSettings}
                                    onValueChange={setImportSettings}
                                    theme={theme}
                                />
                            </View>
                        )}
                        {importManifest?.hasDatabase && (
                            <View style={styles.checkRow}>
                                <Text style={[styles.checkLabel, { color: theme.textColor }]}>
                                    Library & History Database
                                </Text>
                                <Material3Switch
                                    value={importDatabase}
                                    onValueChange={setImportDatabase}
                                    theme={theme}
                                />
                            </View>
                        )}
                        {importManifest?.hasDownloads && (
                            <View style={styles.checkRow}>
                                <Text style={[styles.checkLabel, { color: theme.textColor }]}>
                                    Offline Downloads
                                </Text>
                                <Material3Switch
                                    value={importDownloads}
                                    onValueChange={setImportDownloads}
                                    theme={theme}
                                />
                            </View>
                        )}

                        <Text style={[styles.warningText, { color: '#ef4444' }]}>
                            Restoring will overwrite existing selected data and restart the app.
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, { borderColor: theme.borderColor }]}
                                onPress={() => setShowImportModal(false)}
                                disabled={isImporting}
                            >
                                <Text style={{ color: theme.textColor }}>
                                    {t('general_cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.modalPrimaryButton,
                                    { backgroundColor: theme.primaryColor },
                                ]}
                                onPress={handleExecuteImport}
                                disabled={isImporting}
                            >
                                {isImporting ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={{ color: 'white', fontWeight: '600' }}>
                                        Restore
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <CustomToast currentTheme={theme} />
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
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    pane: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
    },
    statsRow: {
        marginTop: 10,
        gap: 4,
    },
    statText: {
        fontSize: 13,
    },
    gridHeading: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    gridButton: {
        width: '48.5%',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'flex-start',
    },
    gridIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    gridButtonTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    gridButtonSub: {
        fontSize: 11,
    },
    footerNotes: {
        gap: 6,
        marginBottom: 32,
    },
    noteText: {
        fontSize: 12,
        lineHeight: 16,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    manifestDate: {
        fontSize: 12,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 13,
        marginBottom: 14,
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    checkLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    warningText: {
        fontSize: 12,
        marginTop: 10,
        marginBottom: 4,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 18,
    },
    modalButton: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 80,
        alignItems: 'center',
    },
    modalPrimaryButton: {
        borderWidth: 0,
    },
    text: {
        fontSize: 14,
    },
});
