import React, { PureComponent } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export const DEFAULT_ICON_SIZE = 12;
export const DEFAULT_ICON_COLOR = 'black';

export default function createIconSet(
    glyphMap,
    fontFamily,
    fontFile,
    fontStyle,
) {
    const fontBasename = fontFile
        ? fontFile.replace(/\.(otf|ttf)$/, '')
        : fontFamily;

    class Icon extends PureComponent {
        static defaultProps = {
            size: DEFAULT_ICON_SIZE,
            allowFontScaling: false,
        };

        render() {
            const { name, size, color, style, children, ...props } = this.props;
            let glyph = name ? glyphMap[name] || '?' : '';
            if (typeof glyph === 'number') {
                glyph = String.fromCodePoint(glyph);
            }

            const styleDefaults = {
                fontSize: size,
                color,
            };

            const styleOverrides = {
                fontFamily: fontBasename,
                fontWeight: 'normal',
                fontStyle: 'normal',
            };

            props.style = [styleDefaults, style, styleOverrides, fontStyle || {}];

            return (
                <Text selectable={false} {...props}>
                    {glyph}
                    {children}
                </Text>
            );
        }
    }

    const Button = ({
        name,
        size = 20,
        color = 'white',
        backgroundColor = '#007AFF',
        borderRadius = 5,
        style,
        children,
        onPress,
        ...props
    }) => (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.button, { backgroundColor, borderRadius }, style]}
            {...props}
        >
            {name ? <Icon name={name} size={size} color={color} /> : null}
            {typeof children === 'string' ? (
                <Text style={[styles.text, { color }]}>{children}</Text>
            ) : (
                children
            )}
        </TouchableOpacity>
    );

    Icon.Button = Button;
    Icon.getRawGlyphMap = () => glyphMap;
    Icon.getFontFamily = () => fontBasename;
    Icon.loadFont = () => Promise.resolve();
    Icon.hasIcon = (name) => Object.prototype.hasOwnProperty.call(glyphMap, name);
    Icon.getImageSource = async () => ({ uri: '' });
    Icon.getImageSourceSync = () => ({ uri: '' });

    return Icon;
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    text: {
        fontSize: 16,
        marginLeft: 8,
    },
});
