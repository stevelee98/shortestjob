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
    },
    viewChild: {
        // ...commonStyles.shadowOffset,
        // ...commonStyles.marginForShadow,
        // borderRadius: Constants.CORNER_RADIUS,
        // marginHorizontal: Constants.MARGIN_X_LARGE,
        backgroundColor: Colors.COLOR_WHITE,
        padding: Constants.MARGIN_X_LARGE
    },
    logo: {
        width: SIZE_LOGO,
        height: SIZE_LOGO,
    },
    buttonContact: {
        ...commonStyles.viewCenter,
        flex: 1,
        backgroundColor: Colors.COLOR_PRIMARY,
        padding: Constants.PADDING,
        flexDirection: 'row',
    },
    inputSpecial: {
        flex: 1,
        borderBottomRightRadius: 0,
        borderTopRightRadius: 0,
        margin: 0,
    },
    textArea:{
        ...commonStyles.text,
        fontSize: Fonts.FONT_SIZE_X_SMALL,
    }
};