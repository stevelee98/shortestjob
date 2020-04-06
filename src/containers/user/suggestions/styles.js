import React from "react-native";
import { Constants } from 'values/constants';
import { Colors } from 'values/colors';
import { Fonts } from 'values/fonts'
import commonStyles from 'styles/commonStyles';

const { StyleSheet } = React;
const HEIGHT_INPUT = 30
export default {
    textSmall: {
       // color: Colors.COLOR_TEXT,
       // fontFamily: Fonts.FONT_NORMAL,
      //  fontSize: Fonts.FONT_SIZE_X_SMALL,
        marginLeft: Constants.MARGIN,
        marginRight: Constants.MARGIN,
        marginBottom: Constants.MARGIN,
        marginTop: Constants.MARGIN,
    },
    text: {
        color: Colors.COLOR_TEXT,
        fontFamily: Fonts.FONT_NORMAL,
        fontSize: Fonts.FONT_SIZE_MEDIUM,
        //   marginLeft: Constants.MARGIN,
        //  marginRight: Constants.MARGIN,
        marginBottom: Constants.MARGIN,
        marginTop: Constants.MARGIN,
    },
    container: {
        width: null,
        height: null,
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#F5FCFF'
    },
    
    buttonLogin: {
        marginBottom: 10,
        backgroundColor: Colors.COLOR_PRIMARY,
        borderRadius: 40,
    },
    inputEmail: {
        ...commonStyles.textItalic,
        ...commonStyles.text,
        // textAlign: 'center',
        textAlignVertical: 'bottom',
        padding: 0,  margin:0,
        height: HEIGHT_INPUT,
       
    },
    inputTelephone: {
        ...commonStyles.textItalic,
        ...commonStyles.text,
        // textAlign: 'center',
        textAlignVertical: 'bottom',
        padding: 0,  margin:0,
        height: HEIGHT_INPUT,
    },

    inputContent:{
        ...commonStyles.textItalic,
        ...commonStyles.text,
        // textAlign: 'center',
        textAlignVertical: 'bottom',
        padding: 0,  margin:0,
        height: HEIGHT_INPUT,
        width:'100%'
    },

    inputCaptcha:{
        ...commonStyles.textItalic,
        ...commonStyles.text,
        // textAlign: 'center',
        textAlignVertical: 'bottom',
        padding: 0,  margin:0,
        height: HEIGHT_INPUT,
    },

    inputFullname: {
        ...commonStyles.textItalic,
        ...commonStyles.text,
        // textAlign: 'center',
        textAlignVertical: 'bottom',
        padding: 0,  margin:0,
        height: HEIGHT_INPUT,
    },

    inputPassword: {
        ...commonStyles.textItalic,
        ...commonStyles.text,
        // textAlign: 'center',
        textAlignVertical: 'bottom',
        padding: 0,  margin:0,
        height: HEIGHT_INPUT,
    },

    inputConfirmPassword: {
        ...commonStyles.textItalic,
        ...commonStyles.text,
        // textAlign: 'center',
        textAlignVertical: 'bottom',
        padding: 0,  margin:0,
        height: HEIGHT_INPUT,
    },

    images:{
        marginRight: 8,marginBottom:2, alignItems: 'flex-end', justifyContent: 'flex-end', alignSelf: 'flex-end',
       // backgroundColor:'black'
    },

    itemInputStyle: {
        marginBottom: Constants.MARGIN_LARGE,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
    },
};
