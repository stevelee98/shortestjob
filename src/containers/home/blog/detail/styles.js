import React from "react-native";
import { Colors } from "values/colors";
import { Constants } from 'values/constants'
import commonStyles from 'styles/commonStyles'
const { Dimensions, Platform } = React;
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get('window').width;
const { StyleSheet } = React;

export default styles = {
    container: {
        width: null,
        height: null,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: Colors.COLOR_BACKGROUND
    },
    textInput: {
        ...commonStyles.text,
        colors: Colors.COLOR_WHITE
    },
    main: {
        backgroundColor: Colors.COLOR_WHITE,
        borderBottomColor: Colors.COLOR_BACKGROUND, borderBottomWidth: 1,
        paddingVertical: Constants.PADDING_LARGE,
        paddingHorizontal: Constants.PADDING_X_LARGE,
        marginVertical: Constants.MARGIN_LARGE
    }
}