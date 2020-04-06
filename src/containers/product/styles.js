import React from "react-native";
import { Colors } from "values/colors";
import { Constants } from 'values/constants';
import { Fonts } from "values/fonts";
import { CheckBox } from "native-base";
import commonStyles from "styles/commonStyles";

const { Dimensions, Platform } = React;
const { StyleSheet } = React;
const window = Dimensions.get('window');

export default {
    container: {
        width: null,
        height: null,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: Colors.COLOR_BACKGROUND
    },
    fixedHeader: {
        backgroundColor: 'transparent',
        position: 'absolute',
        overflow: 'hidden',
        bottom: 0,
        right: 0,
        left: 0,
        top: 0
    }
};