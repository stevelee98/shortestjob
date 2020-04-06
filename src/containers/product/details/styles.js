import React from "react-native";
import { Colors } from "values/colors";
import { Constants } from 'values/constants';
import { Fonts } from "values/fonts";
import { CheckBox } from "native-base";
import commonStyles from "styles/commonStyles";
const { Dimensions, Platform } = React;
const { StyleSheet } = React;
const SIZE_BOX = window.width / 2.5;
const SIZE_LOGO = 28;

export default {
    container: {
        backgroundColor: Colors.COLOR_BACKGROUND
    },
    viewChild: {
        ...commonStyles.shadowOffset,
        ...commonStyles.marginForShadow,
        borderRadius: Constants.CORNER_RADIUS,
        backgroundColor: Colors.COLOR_WHITE,
        padding: Constants.MARGIN_X_LARGE
    },
    contentOne: {
        ...commonStyles.shadowOffset,
        ...commonStyles.marginForShadow,
        backgroundColor: Colors.COLOR_WHITE,
        padding: Constants.PADDING_X_LARGE,
        borderRadius: Constants.CORNER_RADIUS
    },
    titleDetail: { margin: 0, marginRight: Constants.MARGIN_LARGE },
    contentDetail: { margin: 0, flex: 1, textAlign: 'right' }
};