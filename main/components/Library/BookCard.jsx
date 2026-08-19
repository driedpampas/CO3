import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getJsonSettings } from '../../storage/jsonSettings';
import HtmlTextRenderer from '../common/HtmlTextRenderer';
import BookDetailsModal from './BookDetailsModal';
import QuickActionsModal from './QuickActionsModal';

const imageMappings = {
    rating: {
        'General Audiences': require('../../res/status/public/icon-general-public.png'),
        'Teen And Up Audiences': require('../../res/status/public/icon-teen-public.png'),
        Mature: require('../../res/status/public/icon-mature-public.png'),
        Explicit: require('../../res/status/public/icon-explicite-public.png'),
        'Not Rated': require('../../res/status/public/icon-unknown-public.png'),
        default: require('../../res/status/public/icon-unknown-public.png'),
    },
    category: {
        'F/F': require('../../res/status/relationship/icon-ff-relationships.png'),
        'F/M': require('../../res/status/relationship/icon-inter-relationships.png'),
        'M/M': require('../../res/status/relationship/icon-mm-relationships.png'),
        Multi: require('../../res/status/relationship/icon-multiple-relationships.png'),
        Gen: require('../../res/status/relationship/icon-none-relationships.png'),
        Other: require('../../res/status/relationship/icon-other-relationships.png'),
        None: require('../../res/status/relationship/icon-none-relationships.png'),
        default: require('../../res/status/relationship/icon-unknown-relationships.png'),
    },
    warningStatus: {
        'Creator Chose Not To Use Archive Warnings': require('../../res/status/warnings/icon-unspecified-warning.png'),
        WarningGiven: require('../../res/status/warnings/icon-has-warning.png'),
        'No Archive Warnings Apply': require('../../res/status/warnings/icon-unknown-warning.png'),
        ExternalWork: require('../../res/status/warnings/icon-web-warning.png'),
        default: require('../../res/status/warnings/icon-unknown-warning.png'),
    },
    isCompleted: {
        true: require('../../res/status/status/icon-done-status.png'),
        false: require('../../res/status/status/icon-unfinished-status.png'),
        null: require('../../res/status/status/icon-unknown-status.png'),
        undefined: require('../../res/status/status/icon-unknown-status.png'),
    },
};

const BookCard = ({
    book,
    viewMode,
    theme,
    onUpdate,
    setScreens,
    libraryDAO,
    workDAO,
    settingsDAO,
    historyDAO,
    progressDAO,
    kudoHistoryDAO,
    openTagSearch,
    showDate = true,
    jsonSettings,
    chapterDAO,
}) => {
    const navigation = useNavigation();

    const [isMainModalOpen, setIsMainModalOpen] = useState(false);
    const [isAllTagsModalOpen, setIsAllTagsModalOpen] = useState(false);
    const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
    const [badgeColor, setBadgeColor] = useState();

    useEffect(() => {
        if (!jsonSettings?.showStatusBadge) {
            return;
        }

        async function getBadgeColor() {
            const work = await workDAO.get(book.id);

            if (!work) {
                return;
            }

            const history = await progressDAO.getProgressList(book.id);
            if (history?.length === 0) {
                setBadgeColor(theme.statusBadge.clicked);
                return;
            }

            const chapters = await chapterDAO.getChaptersForWork(book.id);
            const lastChapter = chapters[chapters.length - 1];
            const prog = await progressDAO.get(book.id, lastChapter.id);

            if (prog >= 0.9) {
                setBadgeColor(theme.statusBadge.finished);
            } else {
                setBadgeColor(theme.statusBadge.started);
            }
        }

        if (jsonSettings.showStatusBadge) getBadgeColor();
    }, [
        book.id,
        chapterDAO,
        jsonSettings.showStatusBadge,
        progressDAO,
        theme.statusBadge.clicked,
        theme.statusBadge.finished,
        theme.statusBadge.started,
        workDAO,
    ]);

    const isSmall = viewMode === 'small';
    const isMed = viewMode === 'med';
    const isFull = viewMode === 'full';

    const showDescriptionInCard = isFull;
    const showTagsWarningsButton = !isSmall;
    const showMetadataInCard = !isSmall;

    const { t } = useTranslation();

    let buttonText = t('component_book_card_show_more_button');
    if (isMed) {
        buttonText = t('component_book_card_show_more_button_med');
    }

    const ratingImage = imageMappings.rating[book.rating] || imageMappings.rating.default;
    let categoryImage = imageMappings.category[book.category] || imageMappings.category.default;
    let warningImage =
        imageMappings.warningStatus[book.warnings] || imageMappings.warningStatus.default;
    let statusImage = imageMappings.isCompleted[book.isCompleted] || imageMappings.isCompleted.null;

    //Additional checks
    if (book.category && book.category.split(' ').length > 1 && book.category !== 'No category') {
        categoryImage = imageMappings.category.Multi;
    }

    if (book.warningStatus === 'Yes') {
        warningImage = imageMappings.warningStatus.WarningGiven;
    }

    if (book.isCompleted === null) {
        if (book.chapterCount === book.currentChapter) {
            statusImage = imageMappings.isCompleted.true;
        } else {
            statusImage = imageMappings.isCompleted.false;
        }
    }

    const images = [ratingImage, categoryImage, warningImage, statusImage];
    const gridSize = isSmall ? 50 : 75;
    const imageSize = gridSize / 2;

    function handleClick() {
        navigation.push('Work', {
            workId: book.id,
            currentTheme: theme,
            libraryDAO,
            workDAO,
            settingsDAO,
            historyDAO,
            progressDAO,
            kudoHistoryDAO,
            openTagSearch,
            chapterDAO,
        });
        if (!badgeColor && jsonSettings?.showStatusBadge) {
            setBadgeColor(theme.statusBadge.clicked);
        }
    }

    return (
        <TouchableOpacity
            onPress={handleClick}
            onLongPress={() => {
                setIsQuickActionsOpen(!isQuickActionsOpen);
            }}
            activeOpacity={0.7}
            style={[
                styles.card,
                {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.borderColor,
                },
                isSmall && styles.smallCard,
            ]}
        >
            <View style={[styles.imageSection, isSmall && styles.smallImageSection]}>
                {/* Status image grid */}
                {badgeColor && (
                    <View style={[styles.statusBadge, { backgroundColor: badgeColor }]} />
                )}
                <View
                    style={[
                        styles.imageGrid,
                        {
                            width: gridSize,
                            height: gridSize,
                            marginRight: 16,
                            borderRadius: 4,
                            overflow: 'hidden',
                        },
                    ]}
                >
                    <View style={styles.imageRow}>
                        <Image
                            source={images[0]}
                            style={[
                                styles.statusImage,
                                {
                                    width: imageSize,
                                    height: imageSize,
                                    marginRight: -1,
                                    marginBottom: -1,
                                },
                            ]}
                        />
                        <Image
                            source={images[1]}
                            style={[
                                styles.statusImage,
                                {
                                    width: imageSize,
                                    height: imageSize,
                                    marginBottom: -1,
                                },
                            ]}
                        />
                    </View>
                    <View style={styles.imageRow}>
                        <Image
                            source={images[2]}
                            style={[
                                styles.statusImage,
                                {
                                    width: imageSize,
                                    height: imageSize,
                                    marginRight: -1,
                                },
                            ]}
                        />
                        <Image
                            source={images[3]}
                            style={[
                                styles.statusImage,
                                {
                                    width: imageSize,
                                    height: imageSize,
                                },
                            ]}
                        />
                    </View>
                </View>

                <View style={styles.titleSection}>
                    <Text
                        style={[
                            styles.title,
                            { color: theme.textColor },
                            isSmall && styles.smallTitle,
                        ]}
                    >
                        {book.title}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.push('User', {
                                currentTheme: theme,
                                username: book.author,
                                onBack: () => navigation.goBack(),
                                setScreens: setScreens,
                                workDAO: workDAO,
                                libraryDAO: libraryDAO,
                                historyDAO: historyDAO,
                                settingsDAO: settingsDAO,
                                progressDAO: progressDAO,
                                kudoHistoryDAO: kudoHistoryDAO,
                                chapterDAO: chapterDAO,
                            });
                        }}
                    >
                        <Text
                            style={[
                                styles.author,
                                { color: theme.secondaryTextColor },
                                isSmall && styles.smallAuthor,
                            ]}
                        >
                            {t('screen_work_by_author', { author: book.author })}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {!isSmall && (
                <View style={styles.contentSection}>
                    {showTagsWarningsButton &&
                        (book.tags.length > 0 || book.warnings.length > 0 || isMed) && (
                            <TouchableOpacity
                                style={styles.tagsButton}
                                onPress={() => setIsMainModalOpen(true)}
                            >
                                <Icon name="local-offer" size={16} color={theme.primaryColor} />
                                <Text
                                    style={[styles.tagsButtonText, { color: theme.primaryColor }]}
                                >
                                    {buttonText}
                                </Text>
                            </TouchableOpacity>
                        )}

                    {showDescriptionInCard &&
                        book.description &&
                        (jsonSettings ? (
                            jsonSettings.showFullDescription && jsonSettings.preferHtml ? (
                                <HtmlTextRenderer
                                    currentTheme={theme}
                                    html={book.descriptionHTML}
                                    extraTagsStyles={{
                                        p: {
                                            fontSize: 14,
                                            paddingBottom: 12,
                                        },
                                        span: {
                                            fontSize: 14,
                                            paddingBottom: 12,
                                        },
                                        a: {
                                            fontSize: 14,
                                            paddingBottom: 12,
                                            color: theme.primaryColor,
                                            textDecorationLine: 'underline',
                                        },
                                    }}
                                />
                            ) : (
                                <Text
                                    style={[styles.description, { color: theme.textColor }]}
                                    numberOfLines={
                                        jsonSettings
                                            ? jsonSettings.showFullDescription
                                                ? 0
                                                : 3
                                            : 3
                                    }
                                >
                                    {book.description}
                                </Text>
                            )
                        ) : (
                            <Text
                                style={[styles.description, { color: theme.textColor }]}
                                numberOfLines={
                                    jsonSettings ? (jsonSettings.showFullDescription ? 0 : 3) : 3
                                }
                            >
                                {book.description}
                            </Text>
                        ))}

                    {showMetadataInCard && (
                        <View style={[styles.metadataGrid, { borderTopColor: theme.borderColor }]}>
                            <View style={styles.gridRow}>
                                <View style={styles.gridItem}>
                                    <Icon name="favorite" size={13} color="#ef4444" />
                                    <Text
                                        style={[
                                            styles.gridValue,
                                            { color: theme.secondaryTextColor },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {book.likes?.toLocaleString() || '0'}
                                    </Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Icon name="book" size={13} color={theme.primaryColor} />
                                    <Text
                                        style={[
                                            styles.gridValue,
                                            { color: theme.secondaryTextColor },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {`${book.currentChapter}/${book.chapterCount || '?'}`}
                                    </Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Icon name="bookmark" size={13} color="#f59e0b" />
                                    <Text
                                        style={[
                                            styles.gridValue,
                                            { color: theme.secondaryTextColor },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {book.bookmarks?.toLocaleString() || '0'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.gridRow}>
                                <View style={styles.gridItem}>
                                    <Icon name="text-snippet" size={13} color={theme.iconColor} />
                                    <Text
                                        style={[
                                            styles.gridValue,
                                            { color: theme.secondaryTextColor },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {book.words?.toLocaleString() || '0'}
                                    </Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Icon name="visibility" size={13} color={theme.iconColor} />
                                    <Text
                                        style={[
                                            styles.gridValue,
                                            { color: theme.secondaryTextColor },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {book.views?.toLocaleString() || '0'}
                                    </Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Icon
                                        name={showDate ? 'schedule' : 'language'}
                                        size={13}
                                        color={theme.iconColor}
                                    />
                                    <Text
                                        style={[
                                            styles.gridValue,
                                            { color: theme.secondaryTextColor },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {showDate
                                            ? book.lastUpdated
                                            : book.language || t('general_unknown')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            )}

            {isSmall && (
                <TouchableOpacity
                    style={[styles.infoButton, { backgroundColor: theme.primaryColor }]}
                    onPress={() => setIsMainModalOpen(true)}
                >
                    <Icon name="info" size={20} color="white" />
                </TouchableOpacity>
            )}

            <QuickActionsModal
                isOpen={isQuickActionsOpen}
                onClose={() => setIsQuickActionsOpen(false)}
                work={book}
                theme={theme}
                libraryDAO={libraryDAO}
                workDAO={workDAO}
            />

            <BookDetailsModal
                book={book}
                isOpen={isMainModalOpen}
                onClose={() => setIsMainModalOpen(false)}
                mode={isSmall ? 'full' : 'summary'}
                theme={theme}
                onShowAllTags={() => {
                    setIsMainModalOpen(false);
                    setIsAllTagsModalOpen(true);
                }}
                openTagSearch={openTagSearch}
            />

            <BookDetailsModal
                book={book}
                isOpen={isAllTagsModalOpen}
                onClose={() => setIsAllTagsModalOpen(false)}
                mode="allTags"
                theme={theme}
                openTagSearch={openTagSearch}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'column',
    },
    smallCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    imageSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    smallImageSection: {
        marginBottom: 0,
        flex: 1,
    },
    imageGrid: {
        marginRight: 12,
        borderRadius: 4,
        overflow: 'hidden',
    },
    imageRow: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    statusImage: {
        resizeMode: 'contain',
        margin: 0,
    },
    titleSection: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    smallTitle: {
        fontSize: 15,
    },
    author: {
        fontSize: 13,
    },
    smallAuthor: {
        fontSize: 12,
    },
    contentSection: {
        flex: 1,
    },
    tagsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tagsButtonText: {
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 4,
    },
    description: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 8,
    },
    metadataGrid: {
        marginTop: 4,
        paddingTop: 8,
        borderTopWidth: 1,
    },
    gridRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    gridItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginRight: 4,
    },
    gridValue: {
        fontSize: 12,
        fontWeight: '500',
    },
    infoButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: {
        width: 7,
        height: 7,
        position: 'absolute',
        top: 1,
        right: 1,
        borderRadius: 5,
    },
});

export default BookCard;
