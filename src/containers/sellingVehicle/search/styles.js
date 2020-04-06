import React from "react-native";
import { Colors } from "values/colors";
import { Constants } from 'values/constants';
import { Fonts } from "values/fonts";
import { CheckBox } from "native-base";
import commonStyles from "styles/commonStyles";
const { Dimensions, Platform } = React;
const { StyleSheet } = React;

const HEIGHT_ITEM = 52

export default {
    container: {
        width: null,
        height: null,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: Colors.COLOR_BACKGROUND
    },
    item: {
        flex: 1,
        height: HEIGHT_ITEM,
        marginHorizontal: Constants.MARGIN_X_LARGE,
        backgroundColor: Colors.COLOR_WHITE,
        flexDirection: 'row',
        alignItems: 'center',
    },
};