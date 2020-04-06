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
    boxView: {
        ...commonStyles.shadowOffset,
        ...commonStyles.marginForShadow,
        flex: 1,
        borderRadius: Constants.CORNER_RADIUS,
        backgroundColor: Colors.COLOR_WHITE,
        paddingVertical: Constants.PADDING_LARGE,
        padding: Constants.PADDING_X_LARGE,
        alignItems: 'flex-start'
    },
    boxTitle: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        ...commonStyles.text
    },
    description: {
        ...commonStyles.text,
        fontSize: Fonts.FONT_SIZE_MEDIUM,
    },
    checkBox: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        margin: 0,
        padding: 0
    }
};