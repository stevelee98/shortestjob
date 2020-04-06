import React from "react-native";
import { Colors } from "values/colors";
import { Constants } from 'values/constants';
import { Fonts } from "values/fonts";
import { CheckBox } from "native-base";
import commonStyles from "styles/commonStyles";
const { Dimensions, Platform } = React;
const { StyleSheet } = React;

const screen = Dimensions.get("window");
const deviceWidth = screen.width;

const WIDTH_ITEM = deviceWidth - Constants.MARGIN_XX_LARGE
const HEIGHT_ITEM = 52

export default {
    button: {
        ...commonStyles.shadowOffset,
        width: WIDTH_ITEM,
        height: HEIGHT_ITEM,
        paddingVertical: Constants.PADDING_X_LARGE,
        borderRadius: Constants.CORNER_RADIUS,
        marginTop: Constants.MARGIN,
        marginBottom: Constants.MARGIN_LARGE + Constants.MARGIN,
        margin: Constants.MARGIN_X_LARGE,
        backgroundColor: Colors.COLOR_WHITE,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    text: {
        ...commonStyles.text,
        margin: 0,
        paddingHorizontal: Constants.PADDING_X_LARGE
    }
};