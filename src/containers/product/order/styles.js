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
    totalMoney: {
        ...commonStyles.shadowOffset,
        height: Constants.HEIGHT_BUTTON,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.COLOR_WHITE,
        borderRadius: Constants.CORNER_RADIUS,
        paddingHorizontal: Constants.PADDING_X_LARGE,
        marginHorizontal: Constants.MARGIN_X_LARGE
    }
};