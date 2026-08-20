import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function DropdownArrow({ size = 20, color = '#666', isOpen = false, style }) {
    return (
        <View
            style={[
                {
                    transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                style,
            ]}
        >
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M7 10L12 15L17 10"
                    stroke={color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
        </View>
    );
}
