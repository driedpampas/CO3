import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const THUMB_SIZE_UNCHECKED = 16;
const THUMB_SIZE_CHECKED = 24;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE_CHECKED - 8;

export default function Material3Switch({
    value = false,
    onValueChange,
    disabled = false,
    theme,
    style,
}) {
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 200,
            easing: Easing.bezier(0.2, 0, 0, 1),
            useNativeDriver: false,
        }).start();
    }, [value, animatedValue]);

    const handlePress = () => {
        if (!disabled && onValueChange) {
            onValueChange(!value);
        }
    };

    const primaryColor = theme?.primaryColor || '#7c3aed';
    const borderColor = theme?.borderColor || '#767577';
    const inputBackground = theme?.inputBackground || '#e0e0e0';
    const secondaryTextColor = theme?.secondaryTextColor || '#767577';

    const trackBackgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [inputBackground, primaryColor],
    });

    const trackBorderColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [borderColor, primaryColor],
    });

    const thumbTranslateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [4, THUMB_TRAVEL + 4],
    });

    const thumbSize = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [THUMB_SIZE_UNCHECKED, THUMB_SIZE_CHECKED],
    });

    const thumbColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [secondaryTextColor, '#ffffff'],
    });

    return (
        <Pressable
            onPress={handlePress}
            disabled={disabled}
            accessibilityRole="switch"
            accessibilityState={{ checked: value, disabled }}
            style={[styles.container, disabled && styles.disabled, style]}
        >
            <Animated.View
                style={[
                    styles.track,
                    {
                        backgroundColor: trackBackgroundColor,
                        borderColor: trackBorderColor,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            width: thumbSize,
                            height: thumbSize,
                            borderRadius: Animated.divide(thumbSize, 2),
                            backgroundColor: thumbColor,
                            transform: [{ translateX: thumbTranslateX }],
                        },
                    ]}
                />
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        justifyContent: 'center',
    },
    track: {
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        borderWidth: 2,
        justifyContent: 'center',
    },
    thumb: {
        position: 'absolute',
    },
    disabled: {
        opacity: 0.5,
    },
});
