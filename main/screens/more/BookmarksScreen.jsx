import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    Linking,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppContext } from '../../app';
import EmptyState from '../../components/History/Empty';
import LoadingSpinner from '../../components/History/Spinner';
import BookCard from '../../components/Library/BookCard';
import { getUsername } from '../../storage/Credentials';
import { fetchBookmarks } from '../../web/other/bookmarks';

export default function BookmarksScreen({ route }) {
    const context = useContext(AppContext) || {};
    const params = route?.params || {};
    const setScreens = params.setScreens || context.setScreens;
    const currentTheme = params.currentTheme || context.currentTheme;
    const workDAO = params.workDAO || context.workDAO;
    const libraryDAO = params.libraryDAO || context.libraryDAO;
    const historyDAO = params.historyDAO || context.historyDAO;
    const settingsDAO = params.settingsDAO || context.settingsDAO;
    const progressDAO = params.progressDAO || context.progressDAO;
    const kudoHistoryDAO = params.kudoHistoryDAO || context.kudoHistoryDAO;
    const chapterDAO = params.chapterDAO || context.chapterDAO;
    const username = params.username;
    const pseud = params.pseud;
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, _setViewMode] = useState('med');
    const [error, setError] = useState(null);

    const { t } = useTranslation();

    const PAGE_SIZE = 20;

    const formatWork = useCallback(
        work => {
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
                lastUpdated: work.updated
                    ? new Date(work.updated).toLocaleDateString()
                    : t('general_unknown'),
                likes: work.kudos,
                bookmarks: work.bookmarks,
                words: work.words,
                views: work.hits,
                language: work.language,
                currentChapter: work.currentChapter,
                chapterCount: work.chapterCount,
                dateAdded: undefined,
                collection: undefined,
                readIndex: undefined,
                lastRead: undefined,
            };
        },
        [t],
    );

    const loadInitialBookmarks = useCallback(async () => {
        let usrname = username;

        if (!username) usrname = await getUsername();

        if (!usrname) {
            setError({ message: t('screen_bookmarks_error_not_logged_in') });
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setCurrentPage(1);
            const res = pseud
                ? await fetchBookmarks(1, username, pseud)
                : username
                  ? await fetchBookmarks(1, username)
                  : await fetchBookmarks(1);
            setBookmarks(res || []);
            setHasMore((res?.length || 0) === PAGE_SIZE);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            setBookmarks([]);
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [username, pseud, t]);

    useEffect(() => {
        loadInitialBookmarks();
    }, [loadInitialBookmarks]);

    const loadMoreBookmarks = async () => {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const nextPage = currentPage + 1;
            const res = pseud
                ? await fetchBookmarks(nextPage, username, pseud)
                : username
                  ? await fetchBookmarks(nextPage, username)
                  : await fetchBookmarks(nextPage);
            const moreData = res || [];

            if (moreData.length > 0) {
                setBookmarks(prev => [...prev, ...moreData]);
                setCurrentPage(nextPage);
                setHasMore(moreData.length === PAGE_SIZE);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading more bookmarks:', error);
            setError(error);
        } finally {
            setLoadingMore(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadInitialBookmarks();
        setRefreshing(false);
    }, [loadInitialBookmarks]);

    const navigation = useNavigation();

    const onBack = () => {
        navigation.goBack();
    };

    const openTagSearch = tag => {
        console.log('Search for tag:', tag);
    };

    const renderBookmark = ({ item, index }) => (
        <BookCard
            key={index}
            book={formatWork(item)}
            viewMode={viewMode}
            theme={currentTheme}
            onUpdate={loadInitialBookmarks}
            setScreens={setScreens}
            libraryDAO={libraryDAO}
            workDAO={workDAO}
            settingsDAO={settingsDAO}
            historyDAO={historyDAO}
            progressDAO={progressDAO}
            kudoHistoryDAO={kudoHistoryDAO}
            openTagSearch={openTagSearch}
            showDate={false}
            chapterDAO={chapterDAO}
        />
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={onBack}>
                <Icon name="arrow-back" size={24} color={currentTheme.textColor} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: currentTheme.textColor }]}>
                {username
                    ? t('screen_bookmarks_title_username', { username: username })
                    : t('screen_bookmarks_title')}
            </Text>

            <TouchableOpacity
                style={{ marginLeft: 'auto' }}
                onPress={() => {
                    username
                        ? InAppBrowser.open(
                              `https://archiveofourown.org/users/${username}/bookmarks`,
                              {
                                  // Android
                                  showTitle: true,
                                  toolbarColor: currentTheme.backgroundColor,
                                  enableUrlBarHiding: true,
                                  enableDefaultShare: true,
                                  forceCloseOnRedirection: false,
                                  // iOS
                                  dismissButtonStyle: 'close',
                                  preferredBarTintColor: currentTheme.backgroundColor,
                                  preferredControlTintColor: 'white',
                              },
                          )
                        : getUsername().then(usrname => {
                              InAppBrowser.open(
                                  `https://archiveofourown.org/users/${usrname}/bookmarks`,
                                  {
                                      // Android
                                      showTitle: true,
                                      toolbarColor: currentTheme.backgroundColor,
                                      enableUrlBarHiding: true,
                                      enableDefaultShare: true,
                                      forceCloseOnRedirection: false,
                                      // iOS
                                      dismissButtonStyle: 'close',
                                      preferredBarTintColor: currentTheme.backgroundColor,
                                      preferredControlTintColor: 'white',
                                  },
                              );
                          });
                }}
            >
                <Icon name="link" size={24} color={currentTheme.textColor} />
            </TouchableOpacity>
        </View>
    );

    const isAuthError = error?.isAuth || !username;

    const renderError = () => {
        if (isAuthError) {
            return (
                <View
                    style={[
                        styles.centerContainer,
                        { backgroundColor: currentTheme.backgroundColor },
                    ]}
                >
                    <Icon name="account-circle" size={72} color={currentTheme.placeholderColor} />
                    <Text
                        style={[
                            styles.emptyTitle,
                            { color: currentTheme.textColor, marginTop: 16, marginBottom: 8 },
                        ]}
                    >
                        {t('screen_login_title') || 'Log In Required'}
                    </Text>
                    <Text
                        style={[
                            styles.emptySubtitle,
                            {
                                color: currentTheme.secondaryTextColor,
                                textAlign: 'center',
                                marginBottom: 20,
                                paddingHorizontal: 32,
                            },
                        ]}
                    >
                        {t('screen_bookmarks_error_not_logged_in')}
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            { backgroundColor: currentTheme.primaryColor },
                        ]}
                        onPress={() => navigation.push('Account', { currentTheme, setScreens })}
                    >
                        <Text style={styles.primaryButtonText}>
                            {t('screen_login_title') || 'Log In'}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

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
                        {t('screen_bookmarks_error')}
                    </Text>
                    <Text style={[styles.errorMessage, { color: currentTheme.secondaryTextColor }]}>
                        {error?.message}
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: currentTheme.primaryColor }]}
                        onPress={() => loadInitialBookmarks()}
                    >
                        <Text style={styles.retryButtonText}>{t('general_retry')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={currentTheme.primaryColor} />
                <Text style={[styles.loadingMoreText, { color: currentTheme.placeholderColor }]}>
                    {t('screen_bookmarks_loading_more')}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <LoadingSpinner currentTheme={currentTheme} message={t('screen_bookmarks_loading')} />
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
            {renderHeader()}

            {error ? (
                renderError()
            ) : bookmarks.length === 0 ? (
                <EmptyState
                    currentTheme={currentTheme}
                    textLine1={t('screen_bookmarks_empty_title')}
                    textLine2={t('screen_bookmarks_empty_subtitle')}
                />
            ) : (
                <FlatList
                    data={bookmarks}
                    renderItem={renderBookmark}
                    keyExtractor={(item, index) => `${item.id || index}`}
                    onEndReached={loadMoreBookmarks}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={renderFooter}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[currentTheme.primaryColor]}
                            tintColor={currentTheme.primaryColor}
                        />
                    }
                    contentContainerStyle={styles.contentContainer}
                    scrollEventThrottle={16}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 10,
        paddingBottom: 70,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        width: '80%',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 16,
        fontStyle: 'italic',
    },
    loadingMore: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    loadingMoreText: {
        fontSize: 14,
    },
    infoText: {
        width: '100%',
        textAlign: 'center',
        fontSize: 20,
    },
    icon: {
        paddingBottom: '10%',
    },
    infoContainer: {
        height: '90%',
        alignItems: 'center',
        justifyContent: 'center',
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
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    emptySubtitle: {
        fontSize: 15,
    },
    primaryButton: {
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
});
