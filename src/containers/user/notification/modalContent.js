import React, { Component } from "react";
import {
    ImageBackground, View, StatusBar, Image, TouchableWithoutFeedback, BackHandler, Alert, ScrollView,
    WebView, Linking, RefreshControl, StyleSheet, Slider, TextInput, Dimensions, FlatList, TouchableHighlight, TouchableOpacity
} from "react-native";
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text, Card, CardItem, Form } from "native-base";
import { Colors } from "values/colors";
import { Constants } from "values/constants";

import commonStyles from "styles/commonStyles";
import BaseView from "containers/base/baseView"
import TextInputCustom from "components/textInputCustom";
import ModalDropdown from 'components/dropdown';
import I18n, { localizes } from "locales/i18n";
import StringUtil from "utils/stringUtil";
import { Fonts } from "values/fonts";
import { months } from "moment";
import ServiecType from 'enum/serviceType';
import FlatListCustom from "components/flatListCustom";
const screen = Dimensions.get("window");
import Modal from 'react-native-modalbox';
import moment from 'moment';
import DateUtil from "utils/dateUtil";
import Hr from "components/hr";
import { StackActions, NavigationActions } from "react-navigation";
import Utils from "utils/utils";
import screenType from "enum/screenType";

export default class ModalContent extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            contentValue: null,
            titleValue: null,
            item: null
        };
        this.idSelling = null;
    }

    componentDidUpdate = (prevProps, prevState) => {
    }

    componentWillMount = () => {
        this.getSourceUrlPath();
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
     * Show Modal Week
     */
    showModal(contentValue, titleValue, item) {
        this.setState({
            titleValue: titleValue,
            contentValue: contentValue,
            item: item
        })
        this.refs.modalContent.open();
    }

    /**
     * hide Modal Week
     */
    hideModal() {
        this.refs.modalContent.close();
    }

    componentWillUpdate(nextProps, nextState) {
    }

    componentWillUnmount = () => {
    }

    render() {
        return (
            <Modal
                ref={"modalContent"}
                style={{
                    backgroundColor: "#00000000",
                    width: screen.width,
                    height: screen.height,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                backdrop={true}
                onClosed={() => {
                    this.hideModal()
                }}
                backButtonClose={true}
                swipeToClose={false}
            >
            
                <View style={[commonStyles.shadowOffset, {
                    borderRadius: Constants.CORNER_RADIUS,
                    width: screen.width - Constants.MARGIN_X_LARGE * 2,
                    height: screen.height / 2,
                    backgroundColor: Colors.COLOR_WHITE,
                    alignItems: 'center',
                }]} >
                    <Text style={[commonStyles.textBold, { margin: Constants.MARGIN_X_LARGE }]} >{this.state.titleValue}</Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={[commonStyles.text, { flex: 1, margin: Constants.MARGIN_X_LARGE }]} >{this.state.contentValue}</Text>
                        {!Utils.isNull(this.state.item) ?
                            !Utils.isNull(this.state.item.sellingItemId) ?
                                <View style={{ alignItems: 'center' }}>
                                    <TouchableOpacity style={{ alignItems: 'center' }}
                                        onPress={() => {
                                            this.props.navigation.navigate("SellingVehicleDetail", {
                                                vehicleId: this.state.item.sellingItemId,
                                                urlPathResource: this.resourceUrlPathResize.textValue,
                                                screenType: screenType.FROM_NOTIFICATION
                                            });
                                            this.hideModal()
                                        }}>
                                        <Text style={[commonStyles.text, { margin: 0, color: Colors.COLOR_HIGH_LIGHT }]} >
                                            Xem chi tiết
                                    </Text>
                                    </TouchableOpacity>
                                </View>
                                : null : null}
                    </ScrollView>

                    <View
                        // style={{ position: 'absolute', bottom: 0, left: 0, right: 0, margin: Constants.MARGIN_X_LARGE }}
                        style={{
                            width: "100%",
                            backgroundColor: Colors.COLOR_WHITE,
                            borderRadius: Constants.CORNER_RADIUS
                        }}
                    >
                        <Hr style={{}} color={Colors.COLOR_BACKGROUND} />
                        <TouchableOpacity
                            onPress={() => this.hideModal()}
                        >
                            <Text style={[commonStyles.text, {
                                marginVertical: Constants.MARGIN_X_LARGE,
                                textAlign: "center",
                                color: Colors.COLOR_PRIMARY
                            }]} >{localizes("close")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }
}