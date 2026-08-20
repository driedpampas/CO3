import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    PanResponder,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DEFAULT_THEME_COLOR, PRESET_THEME_COLORS } from '../../utils/themes';

function hsvToRgb(h, s, v) {
    const hh = (h % 360) / 60;
    const i = Math.floor(hh);
    const f = hh - i;
    const p = v * (1 - s);
    const q = v * (1 - s * f);
    const t = v * (1 - s * (1 - f));
    let r = 0;
    let g = 0;
    let b = 0;
    switch (i % 6) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        case 5:
            r = v;
            g = p;
            b = q;
            break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}

function rgbToHex(r, g, b) {
    const toHex = n =>
        Math.max(0, Math.min(255, Math.round(n)))
            .toString(16)
            .padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex) {
    let clean = (hex || '').replace('#', '').trim();
    if (clean.length === 3) {
        clean = clean
            .split('')
            .map(c => c + c)
            .join('');
    }
    if (clean.length !== 6) return { r: 153, g: 0, b: 1 };
    const num = parseInt(clean, 16);
    if (Number.isNaN(num)) return { r: 153, g: 0, b: 1 };
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

function rgbToHsv(r, g, b) {
    const rr = r / 255;
    const gg = g / 255;
    const bb = b / 255;
    const max = Math.max(rr, gg, bb);
    const min = Math.min(rr, gg, bb);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    if (max !== min) {
        switch (max) {
            case rr:
                h = (gg - bb) / d + (gg < bb ? 6 : 0);
                break;
            case gg:
                h = (bb - rr) / d + 2;
                break;
            case bb:
                h = (rr - gg) / d + 4;
                break;
        }
        h /= 6;
    }
    return { h: h * 360, s, v };
}

function hexToHsv(hex) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHsv(r, g, b);
}

export default function ColorPickerModal({ visible, onClose, currentColor, onApplyColor, theme }) {
    const { t } = useTranslation();

    const [hsv, setHsv] = useState(() => hexToHsv(currentColor || DEFAULT_THEME_COLOR));
    const [hexInput, setHexInput] = useState(currentColor || DEFAULT_THEME_COLOR);
    const [satValLayout, setSatValLayout] = useState({ width: 280, height: 160 });
    const [hueLayout, setHueLayout] = useState({ width: 280, height: 26 });

    const satValRef = useRef(null);
    const hueRef = useRef(null);

    const activeRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
    const activeHex = rgbToHex(activeRgb.r, activeRgb.g, activeRgb.b);
    const pureHueHex = rgbToHex(...Object.values(hsvToRgb(hsv.h, 1, 1)));

    useEffect(() => {
        if (visible) {
            const initial = currentColor || DEFAULT_THEME_COLOR;
            const parsed = hexToHsv(initial);
            setHsv(parsed);
            setHexInput(initial);
        }
    }, [visible, currentColor]);

    const updateFromHsv = useCallback((newHsv, syncInput = true) => {
        setHsv(newHsv);
        const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        if (syncInput) {
            setHexInput(hex);
        }
    }, []);

    const handleSatValTouch = useCallback(
        evt => {
            const { locationX, locationY } = evt.nativeEvent;
            const w = satValLayout.width || 1;
            const h = satValLayout.height || 1;
            const s = Math.max(0, Math.min(1, locationX / w));
            const v = Math.max(0, Math.min(1, 1 - locationY / h));
            updateFromHsv({ ...hsv, s, v });
        },
        [hsv, satValLayout, updateFromHsv],
    );

    const handleHueTouch = useCallback(
        evt => {
            const { locationX } = evt.nativeEvent;
            const w = hueLayout.width || 1;
            const h = Math.max(0, Math.min(359.9, (locationX / w) * 360));
            updateFromHsv({ ...hsv, h });
        },
        [hsv, hueLayout, updateFromHsv],
    );

    const satValPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: evt => handleSatValTouch(evt),
            onPanResponderMove: evt => handleSatValTouch(evt),
        }),
    ).current;

    const huePanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: evt => handleHueTouch(evt),
            onPanResponderMove: evt => handleHueTouch(evt),
        }),
    ).current;

    const handleHexInputChange = text => {
        setHexInput(text);
        let clean = text.trim();
        if (!clean.startsWith('#') && clean.length > 0) {
            clean = `#${clean}`;
        }
        if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
            const parsed = hexToHsv(clean);
            setHsv(parsed);
        }
    };

    const handleResetDefault = () => {
        const parsed = hexToHsv(DEFAULT_THEME_COLOR);
        updateFromHsv(parsed, true);
    };

    const handleApply = () => {
        onApplyColor(activeHex);
        onClose();
    };

    const satValThumbLeft = Math.max(
        0,
        Math.min(satValLayout.width - 16, hsv.s * satValLayout.width - 8),
    );
    const satValThumbTop = Math.max(
        0,
        Math.min(satValLayout.height - 16, (1 - hsv.v) * satValLayout.height - 8),
    );
    const hueThumbLeft = Math.max(
        0,
        Math.min(hueLayout.width - 16, (hsv.h / 360) * hueLayout.width - 8),
    );

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.backdropTouch}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View
                    style={[
                        styles.modalContainer,
                        {
                            backgroundColor:
                                theme?.cardBackground || theme?.backgroundColor || '#ffffff',
                            borderColor: theme?.borderColor || '#e5e5e5',
                        },
                    ]}
                >
                    {/* 2D Saturation-Brightness Canvas */}
                    <View
                        ref={satValRef}
                        style={styles.satValBox}
                        onLayout={e =>
                            setSatValLayout({
                                width: e.nativeEvent.layout.width,
                                height: e.nativeEvent.layout.height,
                            })
                        }
                        {...satValPanResponder.panHandlers}
                    >
                        <Svg width="100%" height="100%">
                            <Defs>
                                <LinearGradient id="satGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                                    <Stop offset="100%" stopColor={pureHueHex} stopOpacity="1" />
                                </LinearGradient>
                                <LinearGradient id="valGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
                                    <Stop offset="100%" stopColor="#000000" stopOpacity="1" />
                                </LinearGradient>
                            </Defs>
                            <Rect x="0" y="0" width="100%" height="100%" fill="url(#satGrad)" />
                            <Rect x="0" y="0" width="100%" height="100%" fill="url(#valGrad)" />
                        </Svg>
                        <View
                            style={[
                                styles.satValThumb,
                                {
                                    left: satValThumbLeft,
                                    top: satValThumbTop,
                                    backgroundColor: activeHex,
                                },
                            ]}
                            pointerEvents="none"
                        />
                    </View>

                    {/* Rainbow Hue Slider Bar */}
                    <View
                        ref={hueRef}
                        style={styles.hueBar}
                        onLayout={e =>
                            setHueLayout({
                                width: e.nativeEvent.layout.width,
                                height: e.nativeEvent.layout.height,
                            })
                        }
                        {...huePanResponder.panHandlers}
                    >
                        <Svg width="100%" height="100%">
                            <Defs>
                                <LinearGradient id="hueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <Stop offset="0%" stopColor="#ff0000" />
                                    <Stop offset="16.7%" stopColor="#ffff00" />
                                    <Stop offset="33.3%" stopColor="#00ff00" />
                                    <Stop offset="50%" stopColor="#00ffff" />
                                    <Stop offset="66.7%" stopColor="#0000ff" />
                                    <Stop offset="83.3%" stopColor="#ff00ff" />
                                    <Stop offset="100%" stopColor="#ff0000" />
                                </LinearGradient>
                            </Defs>
                            <Rect
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                                rx="12"
                                fill="url(#hueGrad)"
                            />
                        </Svg>
                        <View
                            style={[
                                styles.hueThumb,
                                {
                                    left: hueThumbLeft,
                                    backgroundColor: pureHueHex,
                                },
                            ]}
                            pointerEvents="none"
                        />
                    </View>

                    {/* Quick Swatches Row */}
                    <View style={styles.swatchesRow}>
                        {PRESET_THEME_COLORS.map(preset => {
                            const isSelected =
                                activeHex.toLowerCase() === preset.color.toLowerCase();
                            return (
                                <TouchableOpacity
                                    key={preset.color}
                                    style={[
                                        styles.miniSwatch,
                                        { backgroundColor: preset.color },
                                        isSelected && styles.miniSwatchSelected,
                                    ]}
                                    onPress={() => {
                                        const parsed = hexToHsv(preset.color);
                                        updateFromHsv(parsed, true);
                                    }}
                                    activeOpacity={0.7}
                                    accessibilityLabel={preset.name}
                                />
                            );
                        })}
                    </View>

                    {/* Color Preview & Hex Input Row */}
                    <View style={styles.controlsRow}>
                        <View style={[styles.colorPreviewCircle, { backgroundColor: activeHex }]} />
                        <TextInput
                            style={[
                                styles.hexInput,
                                {
                                    backgroundColor: theme?.inputBackground || '#f5f5f5',
                                    borderColor: theme?.borderColor || '#e5e5e5',
                                    color: theme?.textColor || '#171717',
                                },
                            ]}
                            placeholder="#990001"
                            placeholderTextColor={theme?.placeholderColor || '#a3a3a3'}
                            value={hexInput}
                            onChangeText={handleHexInputChange}
                            autoCapitalize="none"
                            autoCorrect={false}
                            maxLength={7}
                        />
                        <TouchableOpacity
                            style={[
                                styles.resetBtn,
                                {
                                    backgroundColor: theme?.buttonBackground || '#f5f5f5',
                                    borderColor: theme?.borderColor || '#e5e5e5',
                                },
                            ]}
                            onPress={handleResetDefault}
                            activeOpacity={0.7}
                        >
                            <Icon
                                name="restore"
                                size={20}
                                color={theme?.secondaryTextColor || '#737373'}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Action Buttons (No Separators) */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={[
                                styles.actionBtn,
                                {
                                    backgroundColor: theme?.buttonBackground || '#f5f5f5',
                                },
                            ]}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.actionBtnText,
                                    {
                                        color: theme?.secondaryTextColor || '#525252',
                                    },
                                ]}
                            >
                                {t('general_cancel', 'Cancel')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: activeHex }]}
                            onPress={handleApply}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.actionBtnText, { color: '#ffffff' }]}>
                                {t('screen_preferences_button_apply_color', 'Apply')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    backdropTouch: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
            },
            android: {
                elevation: 10,
            },
            web: {
                boxShadow: '0 8px 28px rgba(0, 0, 0, 0.25)',
            },
        }),
    },
    satValBox: {
        width: '100%',
        height: 170,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    satValThumb: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ffffff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    hueBar: {
        width: '100%',
        height: 24,
        borderRadius: 12,
        marginTop: 14,
        position: 'relative',
    },
    hueThumb: {
        position: 'absolute',
        top: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ffffff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    swatchesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 14,
        justifyContent: 'center',
    },
    miniSwatch: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    miniSwatchSelected: {
        borderWidth: 2,
        borderColor: '#ffffff',
        transform: [{ scale: 1.15 }],
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 14,
    },
    colorPreviewCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.15)',
    },
    hexInput: {
        flex: 1,
        height: 42,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 12,
        fontSize: 15,
        fontWeight: '500',
    },
    resetBtn: {
        width: 42,
        height: 42,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 16,
    },
    actionBtn: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
