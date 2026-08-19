import glyphMap from 'react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json';
import createIconSet from './rn-vector-icons-create-icon-set.jsx';

const iconSet = createIconSet(
    glyphMap,
    'MaterialCommunityIcons',
    'MaterialCommunityIcons.ttf',
);

export default iconSet;
export const Button = iconSet.Button;
export const getImageSource = iconSet.getImageSource;
export const getImageSourceSync = iconSet.getImageSourceSync;
