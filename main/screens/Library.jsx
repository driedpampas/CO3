import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    DeviceEventEmitter,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BookCard from '../components/Library/BookCard';
import CategorySelectionModal from '../components/WorkScreen/CategorySelectionModal.jsx';
import { getJsonSettings } from '../storage/jsonSettings';

const LibraryScreen = ({
    searchTerm,
    setSearchTerm,
    currentTheme,
    viewMode,
    setIsAddWorkModalOpen,
    libraryDAO,
    workDAO,
    setScreens,
    screens,
    setActiveScreen,
    settingsDAO,
    historyDAO,
    progressDAO,
    kudoHistoryDAO,
    openTagSearch,
    chapterDAO,
    selectedCollection,
    setSelectedCollection,
}) => {
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [_totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    const [sortType, setSortType] = useState('lastRead');
    const [collectionsWithCounts, setCollectionsWithCounts] = useState([]);
    const [allCollections, setAllCollections] = useState([]);
    const [showSortModal, setShowSortModal] = useState(false);
    const [showAllCollectionsModal, setShowAllCollectionsModal] = useState(false);

    const [jsonSettings, setJsonSettings] = useState();

    const insets = useSafeAreaInsets();

    const pageSize = 20;

    const { t } = useTranslation();

    const navigation = useNavigation();

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('doubleTap', _id => {
            navigation.push('ReadLaterScreen', {
                setScreens: setScreens,
                currentTheme: currentTheme,
                workDAO: workDAO,
                libraryDAO: libraryDAO,
                historyDAO: historyDAO,
                settingsDAO: settingsDAO,
                progressDAO: progressDAO,
                kudoHistoryDAO: kudoHistoryDAO,
                screens: screens,
                chapterDAO: chapterDAO,
            });
        });

        return () => {
            subscription.remove();
        };
    }, [
        historyDAO,
        workDAO,
        settingsDAO,
        progressDAO,
        setScreens,
        navigation.push,
        currentTheme,
        screens,
        libraryDAO,
        kudoHistoryDAO,
        chapterDAO,
    ]);

    const loadCollections = useCallback(async () => {
        if (!libraryDAO) return;
        try {
            const collections = await libraryDAO.getCollectionsWithCounts();
            setAllCollections(collections.map(c => c.name));
            setCollectionsWithCounts(collections);
        } catch (err) {
            console.error('Error loading collections:', err);
        }
    }, [libraryDAO]);

    const loadWorks = useCallback(
        async (pageToLoad = 1, isReset = true, isFilter = false) => {
            if (!libraryDAO || !workDAO) return;

            try {
                if (isReset && !isFilter) {
                    setLoading(true);
                }
                if (isReset && isFilter) {
                    setFilterLoading(true);
                }
                if (isReset) {
                    setError(null);
                } else {
                    setLoadingMore(true);
                }

                let libraryEntries;
                let count;

                if (searchTerm?.trim()) {
                    setIsSearching(true);
                    libraryEntries = await libraryDAO.search(
                        searchTerm.trim(),
                        pageToLoad,
                        pageSize,
                        sortType,
                        selectedCollection,
                    );
                    count = await libraryDAO.getSearchCount(searchTerm.trim(), selectedCollection);
                } else {
                    setIsSearching(false);
                    libraryEntries = await libraryDAO.getByPage(
                        pageToLoad,
                        pageSize,
                        sortType,
                        selectedCollection,
                    );
                    count = await libraryDAO.getTotalCount(selectedCollection);
                }

                const worksWithLibraryData = [];
                for (const entry of libraryEntries) {
                    try {
                        const work = await workDAO.get(entry.work.id);
                        if (work) {
                            worksWithLibraryData.push({
                                work: work,
                                library: entry.library,
                            });
                        }
                    } catch (err) {
                        console.error(`Error fetching work ${entry.work.id}:`, err);
                    }
                }

                if (isReset) {
                    setWorks(worksWithLibraryData);
                    setTotalCount(count);
                } else {
                    setWorks(prevWorks => [...prevWorks, ...worksWithLibraryData]);
                }

                setCurrentPage(pageToLoad);

                const isLastPage = libraryEntries.length < pageSize;
                setHasMore(!isLastPage);

                getJsonSettings()
                    .then(setJsonSettings)
                    .catch(() => {});
            } catch (err) {
                console.error('Error loading works:', err);
                setError({
                    message: err.message || 'Failed to load library',
                    details: err.toString(),
                });
            } finally {
                setLoading(false);
                setFilterLoading(false);
                setLoadingMore(false);
                setRefreshing(false);
            }
        },
        [searchTerm, libraryDAO, sortType, selectedCollection, workDAO],
    );

    useEffect(() => {
        loadCollections();
    }, [loadCollections]);

    useEffect(() => {
        if (libraryDAO && workDAO) {
            loadWorks(1, true, true);
        }
    }, [libraryDAO, workDAO, loadWorks]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadWorks(1, true);
    }, [loadWorks]);

    const handleLoadMore = useCallback(() => {
        if (!loading && !loadingMore && hasMore && works.length > 0) {
            loadWorks(currentPage + 1, false);
        }
    }, [loading, loadingMore, hasMore, works.length, currentPage, loadWorks]);

    const handleWorkUpdate = useCallback(() => {
        loadWorks(1, true, true);
    }, [loadWorks]);

    const handleGoToBrowse = () => {
        setActiveScreen('browse');
    };

    const formatWork = workData => {
        const { work, library } = workData;
        return {
            id: work.id,
            title: work.title,
            author: work.author,
            rating: work.rating,
            category: work.category,
            warningStatus: work.warningStatus,
            isCompleted: work.isCompleted,
            tags: work.tags,
            warnings: work.warnings,
            description: work.description,
            descriptionHTML: work.descriptionHTML,
            lastUpdated: work.updated ? new Date(work.updated).toLocaleDateString() : 'Unknown',
            likes: work.kudos,
            bookmarks: work.bookmarks,
            words: work.words,
            views: work.hits,
            language: work.language,
            currentChapter: work.currentChapter,
            chapterCount: work.chapterCount,
            dateAdded: library.dateAdded,
            collection: library.collection,
            readIndex: library.readIndex,
            lastRead: library.readIndex
                ? new Date(library.readIndex).toLocaleDateString()
                : 'Never',
        };
    };

    const handleSortChange = newSortType => {
        setSortType(newSortType);
        setShowSortModal(false);
    };

    const handleCollectionFilter = collection => {
        setSelectedCollection(collection === selectedCollection ? null : collection);
    };

    const handleCollectionSelect = collection => {
        setSelectedCollection(collection);
        setShowAllCollectionsModal(false);
    };

    const getTopCollections = () => {
        return collectionsWithCounts.slice(0, 3);
    };

    const hasMoreThanThreeCollections = collectionsWithCounts.length > 3;

    const renderHeader = () => {
        if (allCollections.length <= 1) return null;
        return (
            <View style={styles.headerContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.collectionsScroll}
                    contentContainerStyle={styles.collectionsScrollContent}
                >
                    <TouchableOpacity
                        style={[
                            styles.collectionChip,
                            {
                                backgroundColor:
                                    selectedCollection === null
                                        ? currentTheme.primaryColor
                                        : currentTheme.cardBackground,
                                borderColor: currentTheme.borderColor,
                            },
                        ]}
                        onPress={() => handleCollectionFilter(null)}
                    >
                        <Text
                            style={[
                                styles.collectionChipText,
                                {
                                    color:
                                        selectedCollection === null
                                            ? 'white'
                                            : currentTheme.textColor,
                                },
                            ]}
                        >
                            All
                        </Text>
                    </TouchableOpacity>

                    {getTopCollections().map(collectionData => (
                        <TouchableOpacity
                            key={collectionData.name}
                            style={[
                                styles.collectionChip,
                                {
                                    backgroundColor:
                                        selectedCollection === collectionData.name
                                            ? currentTheme.primaryColor
                                            : currentTheme.cardBackground,
                                    borderColor:
                                        selectedCollection === collectionData.name
                                            ? currentTheme.primaryColor
                                            : currentTheme.borderColor,
                                },
                            ]}
                            onPress={() => handleCollectionFilter(collectionData.name)}
                        >
                            <Text
                                style={[
                                    styles.collectionChipText,
                                    {
                                        color:
                                            selectedCollection === collectionData.name
                                                ? 'white'
                                                : currentTheme.textColor,
                                    },
                                ]}
                            >
                                {collectionData.name}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {hasMoreThanThreeCollections && (
                        <TouchableOpacity
                            style={[
                                styles.collectionChip,
                                {
                                    backgroundColor: currentTheme.cardBackground,
                                    borderColor: currentTheme.borderColor,
                                },
                            ]}
                            onPress={() => setShowAllCollectionsModal(true)}
                        >
                            <Icon name="more-horiz" size={16} color={currentTheme.textColor} />
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>
        );
    };

    const renderFooter = () => {
        if (loadingMore) {
            return (
                <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color={currentTheme.primaryColor} />
                    <Text style={[styles.footerText, { color: currentTheme.secondaryTextColor }]}>
                        {t('screen_library_loading_more')}
                    </Text>
                </View>
            );
        }

        if (!hasMore && works.length > 0) {
            return (
                <View style={styles.footerLoader}>
                    <Text style={[styles.footerText, { color: currentTheme.placeholderColor }]}>
                        {t('screen_library_end')}
                    </Text>
                </View>
            );
        }

        return null;
    };

    const renderEmpty = () => {
        if (filterLoading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={currentTheme.primaryColor} />
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Icon name="library-books" size={64} color={currentTheme.placeholderColor} />
                <Text style={[styles.emptyTitle, { color: currentTheme.textColor }]}>
                    {isSearching ? t('screen_library_no_result') : t('screen_library_empty')}
                </Text>
                <Text style={[styles.emptyText, { color: currentTheme.secondaryTextColor }]}>
                    {isSearching
                        ? t('screen_library_no_result_sub', { search_term: searchTerm })
                        : t('screen_library_empty_sub')}
                </Text>
                {!isSearching && (
                    <TouchableOpacity
                        style={[
                            styles.addFirstButton,
                            {
                                borderColor: currentTheme.primaryColor,
                                backgroundColor: 'transparent',
                                borderWidth: 1,
                            },
                        ]}
                        onPress={handleGoToBrowse}
                    >
                        <Text
                            style={[
                                styles.addFirstButtonText,
                                { color: currentTheme.primaryColor },
                            ]}
                        >
                            {t('screen_library_browse_works_button')}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderItem = ({ item }) => (
        <BookCard
            book={formatWork(item)}
            viewMode={viewMode}
            theme={currentTheme}
            onUpdate={handleWorkUpdate}
            setScreens={setScreens}
            screens={screens}
            libraryDAO={libraryDAO}
            workDAO={workDAO}
            isInLibrary={true}
            settingsDAO={settingsDAO}
            historyDAO={historyDAO}
            progressDAO={progressDAO}
            kudoHistoryDAO={kudoHistoryDAO}
            openTagSearch={openTagSearch}
            jsonSettings={jsonSettings}
            chapterDAO={chapterDAO}
        />
    );

    const renderSortModal = () => (
        <Modal
            transparent={true}
            visible={showSortModal}
            onRequestClose={() => setShowSortModal(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowSortModal(false)}
            >
                <View
                    style={[
                        styles.sortModal,
                        {
                            backgroundColor: currentTheme.cardBackground,
                            borderColor: currentTheme.borderColor,
                        },
                    ]}
                >
                    <Text style={[styles.sortModalTitle, { color: currentTheme.textColor }]}>
                        {t('screen_library_sort_menu_title')}
                    </Text>
                    {[
                        { key: 'lastRead', label: t('screen_library_sort_selector_read') },
                        {
                            key: 'alphabetical',
                            label: t('screen_library_sort_selector_alphabetical'),
                        },
                        { key: 'dateAdded', label: t('screen_library_sort_selector_date') },
                    ].map(option => (
                        <TouchableOpacity
                            key={option.key}
                            style={[
                                styles.sortOption,
                                {
                                    backgroundColor:
                                        sortType === option.key
                                            ? `${currentTheme.primaryColor}20`
                                            : 'transparent',
                                },
                            ]}
                            onPress={() => handleSortChange(option.key)}
                        >
                            <Text
                                style={[
                                    styles.sortOptionText,
                                    {
                                        color:
                                            sortType === option.key
                                                ? currentTheme.primaryColor
                                                : currentTheme.textColor,
                                    },
                                ]}
                            >
                                {option.label}
                            </Text>
                            {sortType === option.key && (
                                <Icon name="check" size={20} color={currentTheme.primaryColor} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );

    if (loading && works.length === 0) {
        return (
            <View
                style={[styles.centerContainer, { backgroundColor: currentTheme.backgroundColor }]}
            >
                <ActivityIndicator size="large" color={currentTheme.primaryColor} />
                <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
                    {t('screen_library_loading')}
                </Text>
            </View>
        );
    }

    if (error && works.length === 0) {
        return (
            <View
                style={[styles.centerContainer, { backgroundColor: currentTheme.backgroundColor }]}
            >
                <View
                    style={[
                        styles.errorContainer,
                        {
                            backgroundColor: currentTheme.cardBackground,
                            borderColor: currentTheme.borderColor,
                        },
                    ]}
                >
                    <Text style={[styles.errorTitle, { color: currentTheme.textColor }]}>
                        {t('screen_library_loading_failed')}
                    </Text>
                    <Text style={[styles.errorMessage, { color: currentTheme.secondaryTextColor }]}>
                        {error.message}
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: currentTheme.primaryColor }]}
                        onPress={() => loadWorks(1, true)}
                    >
                        <Text style={styles.retryButtonText}>{t('general_retry')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: currentTheme.backgroundColor }}>
            <FlatList
                data={works}
                renderItem={renderItem}
                keyExtractor={item => item.work.id}
                contentContainerStyle={[
                    styles.contentContainer,
                    works.length === 0 && styles.emptyContentContainer,
                ]}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                maintainVisibleContentPosition={{
                    minIndexForVisible: 0,
                }}
                scrollEventThrottle={0}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[currentTheme.primaryColor]}
                        tintColor={currentTheme.primaryColor}
                    />
                }
            />

            {renderSortModal()}

            {/* Sort FAB */}
            <TouchableOpacity
                style={[
                    styles.fab,
                    {
                        backgroundColor: currentTheme.primaryColor,
                        bottom: 72 + insets.bottom,
                    },
                ]}
                onPress={() => setShowSortModal(true)}
            >
                <Icon name="sort" size={24} color="white" />
            </TouchableOpacity>

            <CategorySelectionModal
                visible={showAllCollectionsModal}
                categories={allCollections}
                onSelect={handleCollectionSelect}
                onCancel={() => setShowAllCollectionsModal(false)}
                theme={currentTheme}
                title={t('screen_library_select_category_modal_title')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        padding: 10,
        paddingBottom: 70,
    },
    emptyContentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    headerContainer: {
        marginBottom: 8,
    },
    fab: {
        position: 'absolute',
        right: 14,
        bottom: 80,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    collectionsScroll: {
        flex: 1,
    },
    collectionsScrollContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    collectionChip: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        marginRight: 6,
        borderWidth: 1,
    },
    collectionChipText: {
        fontSize: 12,
        fontWeight: '500',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorContainer: {
        padding: 24,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        maxWidth: '90%',
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    addFirstButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addFirstButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    footerLoader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        marginBottom: 20,
    },
    footerText: {
        marginLeft: 10,
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sortModal: {
        width: '80%',
        maxWidth: 300,
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
    },
    sortModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    sortOptionText: {
        fontSize: 16,
    },
});

export default LibraryScreen;
