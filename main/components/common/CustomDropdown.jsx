import React, { useRef, useState } from 'react';
import {
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import DropdownArrow from './DropdownArrow';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CustomDropdown = ({
    selectedValue,
    onValueChange,
    children,
    style,
    theme,
    placeholder = 'Select an option',
    maxHeight = 300,
    disabled = false,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [dropdownLayout, setDropdownLayout] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const dropdownRef = useRef(null);

    const options = React.Children.map(children, child => {
        if (React.isValidElement(child) && child.props) {
            return {
                label: child.props.label,
                value: child.props.value,
            };
        }
        return null;
    }).filter(Boolean);

    const selectedOption = options.find(option => option.value === selectedValue);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    const handlePress = () => {
        if (disabled) return;

        dropdownRef.current?.measure((x, y, width, height, pageX, pageY) => {
            setDropdownLayout({
                x: pageX,
                y: pageY,
                width: width,
                height: height,
            });
            setIsVisible(true);
        });
    };

    const handleOptionPress = value => {
        onValueChange(value);
        setIsVisible(false);
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    const getModalStyle = () => {
        const { x, y, width, height } = dropdownLayout;
        const modalTop = y + height + 2;
        const modalLeft = x;

        const itemHeight = 48;
        const actualContentHeight = Math.min(options.length * itemHeight, maxHeight);

        const adjustedTop =
            modalTop + actualContentHeight > screenHeight ? y - actualContentHeight - 2 : modalTop;
        const adjustedLeft = modalLeft + width > screenWidth ? screenWidth - width - 12 : modalLeft;

        return {
            position: 'absolute',
            top: Math.max(10, adjustedTop),
            left: Math.max(10, adjustedLeft),
            width: Math.max(width, 140),
            maxHeight: maxHeight,
        };
    };

    const arrowColor = theme?.iconColor || theme?.secondaryTextColor || theme?.textColor || '#666';

    return (
        <>
            <TouchableOpacity
                ref={dropdownRef}
                style={[
                    styles.dropdown,
                    {
                        backgroundColor: theme?.inputBackground || '#fff',
                        borderColor: isVisible
                            ? theme?.primaryColor || '#990001'
                            : theme?.borderColor || '#ddd',
                    },
                    style,
                    disabled && styles.disabled,
                ]}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.dropdownText,
                        !selectedOption && styles.placeholderText,
                        {
                            color: selectedOption
                                ? theme?.textColor || '#000'
                                : theme?.placeholderColor || '#999',
                        },
                    ]}
                    numberOfLines={1}
                >
                    {displayText}
                </Text>
                <View style={styles.iconContainer}>
                    <DropdownArrow size={20} color={arrowColor} isOpen={isVisible} />
                </View>
            </TouchableOpacity>

            <Modal
                visible={isVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleClose}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={handleClose}
                >
                    <View
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor:
                                    theme?.cardBackground || theme?.backgroundColor || '#fff',
                                borderColor: theme?.borderColor || '#ddd',
                            },
                            getModalStyle(),
                        ]}
                    >
                        <ScrollView
                            showsVerticalScrollIndicator={true}
                            bounces={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.scrollContainer}
                        >
                            {options.map(option => {
                                const isSelected = selectedValue === option.value;
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.option,
                                            isSelected && {
                                                backgroundColor: theme?.primaryColor
                                                    ? `${theme.primaryColor}18`
                                                    : '#99000118',
                                            },
                                        ]}
                                        onPress={() => handleOptionPress(option.value)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                { color: theme?.textColor || '#000' },
                                                isSelected && [
                                                    styles.selectedOptionText,
                                                    {
                                                        color: theme?.primaryColor || '#990001',
                                                    },
                                                ],
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                        {isSelected && (
                                            <Text
                                                style={[
                                                    styles.checkmark,
                                                    {
                                                        color: theme?.primaryColor || '#990001',
                                                    },
                                                ]}
                                            >
                                                ✓
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

CustomDropdown.Item = ({ label, value }) => null;

const styles = StyleSheet.create({
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 13,
        minHeight: 50,
        borderWidth: 1,
        borderRadius: 8,
    },
    disabled: {
        opacity: 0.5,
    },
    dropdownText: {
        fontSize: 15,
        fontWeight: '400',
        flex: 1,
    },
    placeholderText: {
        fontStyle: 'italic',
    },
    iconContainer: {
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
    },
    modalContent: {
        borderRadius: 8,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            },
        }),
        borderWidth: 1,
    },
    scrollContainer: {
        paddingVertical: 4,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: 48,
    },
    optionText: {
        fontSize: 15,
        flex: 1,
    },
    selectedOptionText: {
        fontWeight: '600',
    },
    checkmark: {
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default CustomDropdown;
