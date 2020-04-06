import React from "react-native";
import { Constants } from 'values/constants'
import { Fonts } from 'values/fonts'
import { Colors } from 'values/colors'
const { StyleSheet } = React;
import { Platform } from "react-native";

export default {
    text: {
        color: Colors.COLOR_TEXT,
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
        margin: Constants.MARGIN,
    },
    textBold: {
        color: Colors.COLOR_TEXT,
        fontFamily: Fonts.FONT_BOLD,
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
        margin: Constants.MARGIN,
        fontWeight: 'bold'
    },
    textItalic: {
        color: Colors.COLOR_TEXT,
        fontFamily: Fonts.FONT_ITALIC,
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
        margin: Constants.MARGIN,
        fontStyle: 'italic',
    },
    textBoldItalic: {
        color: Colors.COLOR_TEXT,
        fontFamily: Fonts.FONT_BOLD_ITALIC,
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
        margin: Constants.MARGIN,
        fontStyle: 'italic',
    },
    title: {
        color: Colors.COLOR_WHITE,
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
        margin: Constants.MARGIN,
    },
    tabStyle: {
        backgroundColor: Colors.COLOR_WHITE
    },
    activeTextStyle: {
        color: Colors.COLOR_WHITE,
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
        margin: Constants.MARGIN,
        fontWeight: 'bold'
    },
    activeTabStyle: {
        backgroundColor: Colors.COLOR_PRIMARY,
    },
    textStyle: {
        color: Colors.COLOR_TEXT,
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
        margin: Constants.MARGIN,
        color: Colors.COLOR_TEXT
    },
    titleTop: {
        color: Colors.COLOR_TEXT,
        margin: 0,
        fontSize: Fonts.FONT_SIZE_X_LARGE,
        marginVertical: Constants.MARGIN_X_LARGE
    },
    marginLeftRight: {
        marginLeft: Constants.MARGIN_X_LARGE,
        marginRight: Constants.MARGIN_X_LARGE,
    },
    textSmall: {
        color: Colors.COLOR_TEXT,
        fontSize: Fonts.FONT_SIZE_SMALL,
        margin: Constants.MARGIN
    },
    textSmallBold: {
        color: Colors.COLOR_TEXT,
        fontSize: Fonts.FONT_SIZE_X_SMALL,
        margin: Constants.MARGIN,
        fontWeight: 'bold'
    },
    textSmallItalic: {
        color: Colors.COLOR_TEXT,
        fontFamily: Fonts.FONT_ITALIC,
        fontSize: Fonts.FONT_SIZE_X_SMALL,
        margin: Constants.MARGIN
    },
    fabBigSize: {
        width: Constants.BIG_CIRCLE,
        height: Constants.BIG_CIRCLE,
        borderRadius: Constants.BIG_CIRCLE,
        backgroundColor: Colors.COLOR_PRIMARY,
        margin: 0,
    },
    viewHorizontal: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    viewSpaceBetween: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    textOrange: {
        color: Colors.COLOR_PRIMARY,
        fontSize: Fonts.FONT_SIZE_MEDIUM,
        margin: Constants.MARGIN,
    },
    textOrangeBold: {
        color: Colors.COLOR_PRIMARY,
        fontFamily: Fonts.FONT_BOLD,
        fontSize: Fonts.FONT_SIZE_MEDIUM,
        margin: Constants.MARGIN,
        fontWeight: 'bold'
    },
    buttonStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Constants.CORNER_RADIUS,
        marginVertical: Constants.MARGIN_X_LARGE,
        backgroundColor: Colors.COLOR_PRIMARY,
        padding: Constants.PADDING_LARGE + 2
    },
    buttonImage: {
        marginBottom: Constants.MARGIN_X_LARGE,
        backgroundColor: Colors.COLOR_PRIMARY,
        borderRadius: Constants.CORNER_RADIUS,
    },
    inputText: {
        paddingVertical: Constants.MARGIN_LARGE,
        paddingHorizontal: Constants.PADDING_X_LARGE,
        backgroundColor: Colors.COLOR_WHITE,
    },
    pickerStyle: {
        flex: 1,
        alignContent: "center",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: '10%',
    },
    shadowOffset: {
        elevation: Constants.ELEVATION,
        shadowOffset: {
            width: Constants.SHADOW_OFFSET_WIDTH,
            height: Constants.SHADOW_OFFSET_HEIGHT
        },
        shadowOpacity: Constants.SHADOW_OPACITY,
        shadowColor: Colors.COLOR_GREY_LIGHT
    },
    viewCenter: {
        justifyContent: "center",
        alignItems: "center",
    },
    touchInputSpecial: {
        flex: 1,
        flexDirection: 'row',
        shadowOffset: {
            width: Constants.SHADOW_OFFSET_WIDTH,
            height: Constants.SHADOW_OFFSET_HEIGHT
        },
        shadowOpacity: Constants.SHADOW_OPACITY,
        shadowColor: Colors.COLOR_GREY_LIGHT,
        borderRadius: Constants.CORNER_RADIUS,
    },
    marginForShadow: {
        marginTop: Constants.MARGIN_LARGE,
        marginBottom: Constants.MARGIN_LARGE,
        marginHorizontal: Constants.MARGIN_X_LARGE
    },
    header: {
        backgroundColor: Colors.COLOR_PRIMARY,
        borderBottomWidth: 0,
        alignItems: 'center'
    }
};