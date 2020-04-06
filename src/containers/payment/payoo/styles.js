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
    itemIcon: {
        flex: 1,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: Colors.COLOR_PRIMARY,
        marginRight: Constants.MARGIN,
        marginLeft: Constants.MARGIN,
        marginBottom: Constants.MARGIN_LARGE,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.COLOR_WHITE
    }
};