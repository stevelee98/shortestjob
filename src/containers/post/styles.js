import React from "react-native";
import { Colors } from "values/colors";
import { Constants } from 'values/constants';
import { Fonts } from "values/fonts";
import { CheckBox } from "native-base";
import commonStyles from "styles/commonStyles";
const { Dimensions, Platform } = React;
const { StyleSheet } = React;

export default {
    container: {
        width: null,
        height: null,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: Colors.COLOR_BACKGROUND
    },
    headerBody: {
        ...commonStyles.viewHorizontal,
        alignItems: 'center',
    },
    header: {
        justifyContent: 'flex-start', alignItems: 'center', backgroundColor: Colors.COLOR_PRIMARY, paddingLeft: Constants.PADDING_X_LARGE, borderBottomWidth: 0
    }, title: {
        color: 'white'
    },
    input: { flex: 1, margin: 0 },
    item: {
        alignItems: 'center',
        marginVertical: Constants.PADDING_X_LARGE,
        paddingHorizontal: Constants.PADDING_LARGE,
    },
    name: {
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
        margin: 0
    },
    price: {
        fontSize: Fonts.FONT_SIZE_X_LARGE,
        color: Colors.COLOR_PRIMARY,
        margin: 0
    },
    checkBox: {
        backgroundColor: Colors.COLOR_WHITE,
        borderWidth: 0,
        padding: 0,
    },
    listPriceContainer: {
        flex: 1,
        paddingHorizontal: Constants.PADDING_X_LARGE,
        backgroundColor: Colors.COLOR_WHITE,
        padding: Constants.PADDING_X_LARGE * 2
    },
    inputSpecial: {
        flex: 1,
        borderBottomRightRadius: 0,
        borderTopRightRadius: 0,
        margin: 0,
    },
    touchSpecial: {
        ...commonStyles.viewHorizontal,
        marginVertical: Constants.MARGIN_LARGE + Constants.MARGIN,
        marginHorizontal: Constants.MARGIN_X_LARGE,
        ...commonStyles.shadowOffset,
        borderRadius: Constants.CORNER_RADIUS,
    },
    imageSpecial: {
        paddingRight: Constants.PADDING_X_LARGE,
        margin: 0,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Constants.CORNER_RADIUS
    },
    imageRegisterCar: {
        borderRadius: Constants.CORNER_RADIUS,
        backgroundColor: Colors.COLOR_WHITE,
        margin: Constants.MARGIN
    },
    sliders: {
        ...commonStyles.viewCenter,
        margin: Constants.MARGIN_X_LARGE
    },
    stickySection: {
        backgroundColor: Colors.COLOR_RED,
        height: 56,
        width: "100%"
    },
    fixedSection: {
        marginHorizontal: Constants.MARGIN_LARGE + Constants.MARGIN
    },
    parallaxHeader: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'column',
        marginTop: 56
    },
    fixedHeader: {
        backgroundColor: 'transparent',
        position: 'absolute',
        overflow: 'hidden',
        bottom: 0,
        right: 0,
        left: 0,
        top: 0
    },
    hr: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.COLOR_BACKGROUND,
    },
    textTitle: {
        fontSize: 14,
    },
    input: {
        marginHorizontal: Constants.MARGIN_X_LARGE,
        marginBottom: Constants.MARGIN_X_LARGE,
    }
};