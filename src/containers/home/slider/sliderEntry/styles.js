import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';

const IS_IOS = Platform.OS === 'ios';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

function wp(percentage) {
    const value = (percentage * viewportWidth) / 100;
    return Math.round(value);
}

const slideWidth = wp(75);
const slideHeight = slideWidth / 16 * 9;
const itemHorizontalMargin = wp(2);

export const sliderWidth = viewportWidth;
export const itemWidth = slideWidth + itemHorizontalMargin;

const entryBorderRadius = Constants.CORNER_RADIUS;

export default StyleSheet.create({
    slideInnerContainer: {
        width: itemWidth,
        height: slideHeight + itemHorizontalMargin,
        paddingHorizontal: itemHorizontalMargin
    },
    imageContainer: {
        flex: 1,
        borderRadius: entryBorderRadius,
        marginTop: Constants.MARGIN_LARGE,
        marginBottom: Constants.MARGIN_LARGE
    },
    image: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: entryBorderRadius,
        borderTopRightRadius: entryBorderRadius,
        borderBottomLeftRadius: entryBorderRadius,
        borderBottomRightRadius: entryBorderRadius
    },
    // image's border radius is buggy on iOS; let's hack it!
    radiusMask: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: entryBorderRadius,
        backgroundColor: 'white'
    },
    radiusMaskEven: {
        backgroundColor: Colors.COLOR_BLACK,
    },
    textContainer: {
        justifyContent: 'center',
        paddingTop: 20 - entryBorderRadius,
        paddingBottom: 20,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderBottomLeftRadius: entryBorderRadius,
        borderBottomRightRadius: entryBorderRadius
    },
    textContainerEven: {
        backgroundColor: Colors.COLOR_BLACK,
    },
    title: {
        color: Colors.COLOR_BLACK,
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 0.5
    },
    titleEven: {
        color: 'white'
    },
    subtitle: {
        marginTop: 6,
        color: Colors.COLOR_GRAY,
        fontSize: 12,
        fontStyle: 'italic'
    },
    subtitleEven: {
        color: 'rgba(255, 255, 255, 0.7)'
    }
});
