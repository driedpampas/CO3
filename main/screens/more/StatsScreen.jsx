import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppContext } from '../../app';
import * as Stats from '../../storage/Stats';

function StatTile({ icon, label, value, subtext, currentTheme, accent }) {
    const isLoading = value === undefined || value === null;

    return (
        <View
            style={[
                styles.statTile,
                {
                    backgroundColor: currentTheme.cardBackground,
                    borderColor: currentTheme.borderColor,
                },
            ]}
        >
            <View style={styles.tileHeader}>
                <View style={[styles.iconBadge, { backgroundColor: `${accent}18` }]}>
                    <Icon name={icon} size={20} color={accent} />
                </View>
                {subtext ? (
                    <Text style={[styles.tileSubtext, { color: currentTheme.secondaryTextColor }]}>
                        {subtext}
                    </Text>
                ) : null}
            </View>

            <View style={styles.tileBody}>
                {isLoading ? (
                    <ActivityIndicator size="small" color={accent} style={styles.spinner} />
                ) : (
                    <Text style={[styles.tileValue, { color: currentTheme.textColor }]}>
                        {String(value)}
                    </Text>
                )}
                <Text
                    style={[styles.tileLabel, { color: currentTheme.secondaryTextColor }]}
                    numberOfLines={1}
                >
                    {label}
                </Text>
            </View>
        </View>
    );
}

function AuthorList({
    authors,
    currentTheme,
    accent,
    setScreens,
    workDAO,
    libraryDAO,
    historyDAO,
    settingsDAO,
    progressDAO,
    kudoHistoryDAO,
    chapterDAO,
}) {
    const isLoading = authors === undefined || authors === null;
    const navigation = useNavigation();
    const { t } = useTranslation();

    function onBack() {
        navigation.goBack();
    }

    return (
        <View
            style={[
                styles.sectionCard,
                {
                    backgroundColor: currentTheme.cardBackground,
                    borderColor: currentTheme.borderColor,
                },
            ]}
        >
            <View style={styles.sectionCardHeader}>
                <View style={[styles.iconBadge, { backgroundColor: `${accent}18` }]}>
                    <Icon name="person" size={20} color={accent} />
                </View>
                <Text style={[styles.sectionCardTitle, { color: currentTheme.textColor }]}>
                    {t('screen_stats_favorite_author')}
                </Text>
            </View>

            {isLoading ? (
                <ActivityIndicator size="small" color={accent} style={styles.spinner} />
            ) : Array.isArray(authors) && authors.length > 0 ? (
                authors.map((item, i) => (
                    <TouchableOpacity
                        key={item.author || i}
                        style={[
                            styles.listRow,
                            i < authors.length - 1 && {
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                borderBottomColor: currentTheme.borderColor,
                            },
                        ]}
                        activeOpacity={0.6}
                        onPress={() => {
                            navigation.push('User', {
                                currentTheme,
                                username: item.author,
                                onBack,
                                setScreens,
                                workDAO,
                                libraryDAO,
                                historyDAO,
                                settingsDAO,
                                progressDAO,
                                kudoHistoryDAO,
                                chapterDAO,
                            });
                        }}
                    >
                        <View
                            style={[
                                styles.rankBadge,
                                {
                                    backgroundColor:
                                        i === 0 ? `${accent}25` : currentTheme.inputBackground,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.rankText,
                                    { color: i === 0 ? accent : currentTheme.secondaryTextColor },
                                ]}
                            >
                                {i + 1}
                            </Text>
                        </View>
                        <Text
                            style={[styles.listRowText, { color: currentTheme.textColor }]}
                            numberOfLines={1}
                        >
                            {item.author}
                        </Text>
                        <View style={[styles.countBadge, { backgroundColor: `${accent}18` }]}>
                            <Text style={[styles.countText, { color: accent }]}>
                                {item.author_count === 1
                                    ? t('screen_stats_work_count', { count: item.author_count })
                                    : t('screen_stats_work_count_plural', {
                                          count: item.author_count,
                                      })}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <Text style={[styles.emptyText, { color: currentTheme.secondaryTextColor }]}>
                    {t('screen_stats_no_data')}
                </Text>
            )}
        </View>
    );
}

function TagList({ tags, currentTheme, accent, openTagSearch }) {
    const isLoading = tags === undefined || tags === null;
    const { t } = useTranslation();

    return (
        <View
            style={[
                styles.sectionCard,
                {
                    backgroundColor: currentTheme.cardBackground,
                    borderColor: currentTheme.borderColor,
                },
            ]}
        >
            <View style={styles.sectionCardHeader}>
                <View style={[styles.iconBadge, { backgroundColor: `${accent}18` }]}>
                    <Icon name="local-offer" size={20} color={accent} />
                </View>
                <Text style={[styles.sectionCardTitle, { color: currentTheme.textColor }]}>
                    {t('screen_stats_preferred_tags')}
                </Text>
            </View>

            {isLoading ? (
                <ActivityIndicator size="small" color={accent} style={styles.spinner} />
            ) : Array.isArray(tags) && tags.length > 0 ? (
                <View style={styles.tagRow}>
                    {tags.map(tag => (
                        <TouchableOpacity
                            key={tag.tag_name}
                            style={[
                                styles.tag,
                                { backgroundColor: `${accent}12`, borderColor: `${accent}30` },
                            ]}
                            activeOpacity={0.7}
                            onPress={() => {
                                if (openTagSearch) openTagSearch(tag.tag_name);
                            }}
                        >
                            <Text style={[styles.tagText, { color: accent }]}>
                                {tag.tag_name}
                                <Text style={{ opacity: 0.5 }}> · </Text>
                                <Text style={styles.tagCountText}>{tag.usage_count}</Text>
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <Text style={[styles.emptyText, { color: currentTheme.secondaryTextColor }]}>
                    {t('screen_stats_no_data')}
                </Text>
            )}
        </View>
    );
}

export default function StatsScreen({ route }) {
    const context = useContext(AppContext) || {};
    const params = route?.params || {};
    const currentTheme = params.currentTheme || context.currentTheme;
    const setScreens = params.setScreens || context.setScreens;
    const databaseObj = params.databaseObj || context.databaseObj;
    const openTagSearch = params.openTagSearch || context.openTagSearch;
    const workDAO = params.workDAO || context.workDAO;
    const libraryDAO = params.libraryDAO || context.libraryDAO;
    const historyDAO = params.historyDAO || context.historyDAO;
    const settingsDAO = params.settingsDAO || context.settingsDAO;
    const progressDAO = params.progressDAO || context.progressDAO;
    const kudoHistoryDAO = params.kudoHistoryDAO || context.kudoHistoryDAO;
    const chapterDAO = params.chapterDAO || context.chapterDAO;

    const navigation = useNavigation();
    const { t } = useTranslation();

    const [filterRange, setFilterRange] = useState('all'); // 'all', '30', '7'
    const [totalChapterRead, setTotalChapterRead] = useState();
    const [totalWordsRead, setTotalWordsRead] = useState();
    const [totalWorksStarted, setTotalWorksStarted] = useState();
    const [totalWorksKudoed, setTotalWorksKudoed] = useState();
    const [preferedTags, setPreferedTags] = useState();
    const [preferedAuthor, setPreferedAuthor] = useState();

    const loadStats = useCallback(async () => {
        if (!databaseObj) return;

        const daysLimit = filterRange === '7' ? 7 : filterRange === '30' ? 30 : null;

        Stats.totalChaptersRead(databaseObj, daysLimit).then(setTotalChapterRead);
        Stats.totalWordsRead(databaseObj, daysLimit).then(setTotalWordsRead);
        Stats.totalWorksStarted(databaseObj).then(setTotalWorksStarted);
        Stats.totalWorksKudoed(databaseObj).then(setTotalWorksKudoed);
        Stats.preferredTag(databaseObj).then(setPreferedTags);
        Stats.preferredAuthor(databaseObj).then(setPreferedAuthor);
    }, [databaseObj, filterRange]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const formatWordCount = count => {
        if (!count) return '0';
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
        return String(count);
    };

    const formatReadingTime = words => {
        if (!words) return '0m';
        const totalMinutes = Math.round(words / 220); // standard ~220 WPM
        if (totalMinutes < 60) return `${totalMinutes}m`;
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return `${hours}h ${mins}m`;
    };

    const accent = currentTheme.primaryColor;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
            <View style={[styles.header, { borderBottomColor: currentTheme.borderColor }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={currentTheme.textColor} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: currentTheme.textColor }]}>
                    {t('screen_stats_title')}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Time Range Filter Chips */}
                <View style={styles.filterRow}>
                    {[
                        { key: 'all', label: 'All Time' },
                        { key: '30', label: 'Past 30 Days' },
                        { key: '7', label: 'Past 7 Days' },
                    ].map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.filterChip,
                                filterRange === tab.key
                                    ? { backgroundColor: accent, borderColor: accent }
                                    : {
                                          backgroundColor: currentTheme.cardBackground,
                                          borderColor: currentTheme.borderColor,
                                      },
                            ]}
                            onPress={() => setFilterRange(tab.key)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    {
                                        color:
                                            filterRange === tab.key
                                                ? '#ffffff'
                                                : currentTheme.secondaryTextColor,
                                    },
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Section: Reading Activity */}
                <Text style={[styles.sectionHeading, { color: currentTheme.textColor }]}>
                    {t('screen_stats_reading_activity')}
                </Text>

                <View style={styles.tileGrid}>
                    <StatTile
                        icon="auto-stories"
                        label="Words Read"
                        value={formatWordCount(totalWordsRead)}
                        currentTheme={currentTheme}
                        accent={accent}
                    />
                    <StatTile
                        icon="schedule"
                        label="Reading Time"
                        value={formatReadingTime(totalWordsRead)}
                        subtext="~220 wpm"
                        currentTheme={currentTheme}
                        accent={accent}
                    />
                    <StatTile
                        icon="menu-book"
                        label={t('screen_stats_chapter_read')}
                        value={totalChapterRead}
                        currentTheme={currentTheme}
                        accent={accent}
                    />
                    <StatTile
                        icon="bookmark"
                        label={t('screen_stats_work_started')}
                        value={totalWorksStarted}
                        currentTheme={currentTheme}
                        accent={accent}
                    />
                    <StatTile
                        icon="favorite"
                        label="Kudosed Works"
                        value={totalWorksKudoed}
                        currentTheme={currentTheme}
                        accent="#ef4444"
                    />
                    <StatTile
                        icon="speed"
                        label="Average Speed"
                        value="220"
                        subtext="words/min"
                        currentTheme={currentTheme}
                        accent={accent}
                    />
                </View>

                {/* Section: Your Preferences */}
                <Text
                    style={[
                        styles.sectionHeading,
                        { color: currentTheme.textColor, marginTop: 12 },
                    ]}
                >
                    {t('screen_stats_your_preference')}
                </Text>

                <AuthorList
                    authors={preferedAuthor}
                    currentTheme={currentTheme}
                    accent={accent}
                    setScreens={setScreens}
                    workDAO={workDAO}
                    libraryDAO={libraryDAO}
                    historyDAO={historyDAO}
                    settingsDAO={settingsDAO}
                    progressDAO={progressDAO}
                    kudoHistoryDAO={kudoHistoryDAO}
                    chapterDAO={chapterDAO}
                />

                <TagList
                    tags={preferedTags}
                    currentTheme={currentTheme}
                    accent={accent}
                    openTagSearch={openTagSearch}
                />
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    sectionHeading: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 12,
    },
    tileGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    statTile: {
        width: '48.5%',
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
        justifyContent: 'space-between',
        minHeight: 96,
    },
    tileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tileSubtext: {
        fontSize: 11,
    },
    tileBody: {
        gap: 2,
    },
    tileValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    tileLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    spinner: {
        alignSelf: 'flex-start',
        marginVertical: 4,
    },
    sectionCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        marginBottom: 12,
    },
    sectionCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    sectionCardTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 10,
    },
    rankBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: 12,
        fontWeight: '700',
    },
    listRowText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    countBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    countText: {
        fontSize: 12,
        fontWeight: '600',
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    tagCountText: {
        fontSize: 11,
        fontWeight: '500',
    },
    emptyText: {
        fontSize: 13,
        fontStyle: 'italic',
        paddingVertical: 4,
    },
});
