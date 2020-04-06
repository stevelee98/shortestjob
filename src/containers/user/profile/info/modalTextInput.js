import React, { Component } from "react";
import {
    ImageBackground, View, StatusBar, Image, TouchableWithoutFeedback,
    BackHandler, Alert, WebView, Linking, RefreshControl, StyleSheet, Slider,
    TextInput, Dimensions, FlatList, TouchableHighlight, Keyboard
} from "react-native";
import {
    Container, Header, Title, Left, Icon, Right, Button,
    Body, Content, Text, Card, CardItem, Form
} from "native-base";
import { Colors } from "values/colors";
import { Constants } from "values/constants";

import commonStyles from "styles/commonStyles";
import BaseView from "containers/base/baseView"
import ModalDropdown from 'components/dropdown';
import I18n, { localizes } from "locales/i18n";
import StringUtil from "utils/stringUtil";
import { Fonts } from "values/fonts";
import { months } from "moment";
import FlatListCustom from "components/flatListCustom";
import Modal from 'react-native-modalbox';
import moment from 'moment';
import DateUtil from "utils/dateUtil";

const screen = Dimensions.get("window");

export default class ModalTextInput extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            input: null,
            key: null
        };
    }

    componentDidUpdate = (prevProps, prevState) => {
    }

    componentWillMount = () => {
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    /**
      * Handle data when request
      */
    handleData() { }

    /**
     * Show Modal TextInput
     */
    showModal(textInput, keyInput) {
        this.setState({
            input: textInput,
            key: keyInput
        })
        this.refs.modalTextInput.open();
    }

    /**
     * hide Modal TextInput
     */
    hideModal() {
        this.refs.modalTextInput.close();
    }

    componentWillUpdate(nextProps, nextState) {
    }

    componentWillUnmount = () => {
    }

    render() {
        const { input, key } = this.state;
        return (
            <Modal
                ref={"modalTextInput"}
                animationType={'fade'}
                transparent={true}
                style={{
                    backgroundColor: "#00000000",
                    width: screen.width,
                    height: screen.height,
                }}
                backdrop={true}
                // onClosed={() => {
                //     this.props.onSetValue(input, key)
                //     this.hideModal()
                // }}
                backButtonClose={true}
                position="top"
            >
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <TextInput style={[commonStyles.text, commonStyles.inputText, {
                        paddingVertical: Constants.PADDING_X_LARGE,
                        marginHorizontal: Constants.MARGIN_X_LARGE
                    }]}
                        value={input}
                        onChangeText={
                            input => {
                                this.setState({
                                    input: input
                                })
                            }
                        }
                        onSubmitEditing={() => {
                            this.props.onSetValue(input, key)
                            this.hideModal()
                            Keyboard.dismiss()
                        }}
                        underlineColorAndroid='transparent'
                        returnKeyType={"done"}
                        blurOnSubmit={false}
                        autoFocus={true}
                    />
                </View>
                <View style={{ flex: 1 }}></View>
            </Modal>
        );
    }
}