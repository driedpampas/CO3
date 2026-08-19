import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Step1 from './Screens/Step1Screen';
import Step2 from './Screens/Step2Screen';
import Step3 from './Screens/Step3Screen';
import Step4 from './Screens/Step4Screen';

export default function MainOnboardScreen({ currentTheme, theme, setTheme, onFinish }) {
    const [screen, setScreen] = useState(0);

    useEffect(() => {
        AsyncStorage.getItem('WordReplaceRules').then(value => {
            if (!value) {
                AsyncStorage.setItem(
                    'WordReplaceRules',
                    JSON.stringify([
                        {
                            title: 'Y/N Replacer',
                            match: 'y/n',
                            replace:
                                '[Go to (More > Word Replacer > Y/N Replacer) to set your name]',
                            caseSensitive: false,
                            useRegex: false,
                        },
                    ]),
                );
            }
        });
    }, []);

    const renderScreen = () => {
        switch (screen) {
            case 0:
                return <Step1 currentTheme={currentTheme} setScreen={setScreen} />;
            case 1:
                return <Step2 currentTheme={currentTheme} setScreen={setScreen} />;
            case 2:
                return (
                    <Step3
                        currentTheme={currentTheme}
                        setScreen={setScreen}
                        theme={theme}
                        setTheme={setTheme}
                    />
                );
            case 3:
                return (
                    <Step4 currentTheme={currentTheme} setScreen={setScreen} onFinish={onFinish} />
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
            {/* Progress indicator dots */}
            <View style={styles.dotsRow}>
                {[0, 1, 2, 3].map(i => {
                    const isActive = i === screen;
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => setScreen(i)}
                            activeOpacity={0.7}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: isActive
                                        ? currentTheme.primaryColor
                                        : currentTheme.borderColor,
                                    width: isActive ? 22 : 6,
                                },
                            ]}
                        />
                    );
                })}
            </View>

            {/* Screen Content */}
            <View style={styles.contentWrapper}>{renderScreen()}</View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingTop: 12,
        paddingBottom: 4,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
    contentWrapper: {
        flex: 1,
    },
});
