import React, { Component } from "react";
import {
    ImageBackground, View, Image, TouchableOpacity,
    BackHandler, Alert, Linking, ScrollView, NativeEventEmitter,
    DeviceEventEmitter, Platform, RefreshControl, Dimensions, SafeAreaView, NativeModules, Text, TouchableHighlight
} from "react-native";
import { Container, Form, Content, Input, Button, Right, Radio, center, ListItem, Left, Header, Item, Picker, Body, Root } from 'native-base';
import * as productActions from 'actions/productActions'
import { connect } from 'react-redux';
import FlatListCustom from "components/flatListCustom";
import { Constants } from "values/constants";
import { localizes } from "locales/i18n";
import BaseView from "containers/base/baseView";
import HeaderView from "containers/common/headerView";
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import Utils from 'utils/utils'
import ic_search_white from "images/ic_search_white.png"
import ic_cancel_white from "images/ic_cancel_white.png"
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import DateUtil from "utils/dateUtil";
import TextInputCustom from "components/textInputCustom";
import ic_calendar_grey from "images/ic_calendar_grey.png";
import { Fonts } from "values/fonts";
import { TextInputMask } from "react-native-masked-text";

const { ModuleWithEmitter } = NativeModules;
const screen = Dimensions.get("window");
const IS_ANDROID = Platform.OS === 'android';
const eventEmitter = new NativeEventEmitter(ModuleWithEmitter);
const LIST_VIEW = 1;

class TabInfoView extends BaseView {

    constructor(props) {
        super(props)
        this.item = this.props.info
        this.state = {
            visibleSearch: false,
            enableLoadMore: false,
            isLoadingMore: false,
            enableRefresh: true,
            refreshing: false,
            phone: !Utils.isNull(this.item) ? this.item.phone : null,
            email: !Utils.isNull(this.item) ? this.item.email : null,
            fullName: !Utils.isNull(this.item) ? this.item.name : null,
            dayOfBirth: DateUtil.convertFromFormatToFormat(!Utils.isNull(this.item) ? this.item.birthDate : null, DateUtil.FORMAT_DATE, DateUtil.FORMAT_DATE_TIME_ZONE),
            address: !Utils.isNull(this.item) ? this.item.address : null
        };
        this.filter = {
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
        };
        this.listVehicle = [];
        this.handleRefresh = this.handleRefresh.bind(this);
    }

    componentDidMount() {
        const { navigation } = this.props;
        // this.props.getVehicleContact(this.filter);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                this.state.refreshing = false;
                this.state.isLoadingMore = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_VEHICLE_CONTACT)) {
                    if (this.filter.paging.page === 0) {

                        this.listVehicle = [];
                    }
                    if (!Utils.isNull(data)) {
                        if (data.data.length > 0) {
                            this.state.enableLoadMore = !(data.data.length < Constants.PAGE_SIZE)
                            data.data.forEach(item => {
                                item.createdAt = DateUtil.convertFromFormatToFormat(item.createdAt, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE)
                                this.listVehicle.push({ ...item });
                            });
                        } else {
                            this.showNoData = true;
                        }
                    }
                    this.showNoData = true;
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    /**
         * Get more
         */
    getVehicleMore = () => {
        this.state.isLoadingMore = true;
        this.filter.paging.page += 1;
        // this.props.getVehicleContact(this.filter)
    }

    //onRefreshing
    handleRefresh() {
        this.state.enableLoadMore = false;
        this.state.refreshing = true;
        this.filter.paging.page = 0;
        // this.props.getVehicleContact(this.filter);
    }
    render() {

        const { stringSearch } = this.state
        return (
            <View style={{ flex: 1 }}>
                <View
                    style={{
                        backgroundColor: Colors.COLOR_WHITE
                    }}
                >
                    {/* Full name */}
                    <TextInputCustom
                        title={localizes("userInfoView.fullName")}
                        inputNormalStyle={{
                            paddingVertical: Constants.PADDING_LARGE
                        }}
                        refInput={input => (this.fullName = input)}
                        isInputNormal={true}
                        placeholder={localizes("userInfoView.fillFullName")}
                        value={this.state.fullName}
                        onChangeText={fullName => this.setState({ fullName })}
                        returnKeyType={"next"}
                        editable={false}
                    />
                    {/* Email */}
                    <TextInputCustom
                        title={localizes("userInfoView.email")}
                        inputNormalStyle={{
                            paddingVertical: Constants.PADDING_LARGE
                        }}
                        refInput={input => (this.email = input)}
                        isInputNormal={true}
                        // placeholder={localizes("userInfoView.emptyEmail")}
                        value={this.state.email}
                        onChangeText={email => this.setState({ email })}
                        returnKeyType={"next"}
                        editable={false}
                    />
                    {/* PhoneNumber */}
                    <TextInputCustom
                        title={localizes("userInfoView.phone")}
                        inputNormalStyle={{
                            paddingVertical: Constants.PADDING_LARGE
                        }}
                        refInput={input => {
                            this.phone = input;
                        }}
                        isInputNormal={true}
                        // placeholder={localizes("userInfoView.fillPhone")}
                        value={this.state.phone}
                        onChangeText={phone =>
                            this.setState({
                                phone: phone
                            })
                        }
                        keyboardType="phone-pad"
                        returnKeyType={"next"}
                        blurOnSubmit={false}
                        numberOfLines={1}
                        editable={false}
                    />
                    {/*Address*/}
                    <TextInputCustom
                        title={localizes("userInfoView.address")}
                        inputNormalStyle={{
                            paddingVertical: Constants.PADDING_LARGE
                        }}
                        refInput={input => {
                            this.address = input;
                        }}
                        isInputNormal={true}
                        placeholder={localizes("userInfoView.fillAddress")}
                        value={this.state.address}
                        onChangeText={address => this.setState({ address })}
                        returnKeyType={"next"}
                        blurOnSubmit={false}
                        editable={false}
                        numberOfLines={1}
                    />
                    {this.renderAddress}
                    {/* Day Of Birth */}
                    <View
                        style={{
                            justifyContent: "center",
                            position: "relative"
                        }}
                    >
                        <Text style={{
                            fontSize: Fonts.FONT_SIZE_X_SMALL,
                            marginLeft: Constants.MARGIN_X_LARGE,
                            marginTop: Constants.MARGIN_12,
                            color: Colors.COLOR_TEXT,
                            marginBottom: 0
                        }}>{localizes("register.dayOfBirth")}</Text>
                        <TextInputMask
                            style={{
                                color: Colors.COLOR_TEXT,
                                fontSize: Fonts.FONT_SIZE_X_MEDIUM,
                                height: 46,
                                width: "100%",
                                marginHorizontal: Constants.MARGIN_LARGE + 4
                            }}
                            ref={input => (this.dayOfBirth = input)}

                            editable={false}
                            placeholder={'--/--/----'}
                            value={this.state.dayOfBirth}
                            onChangeText={dayOfBirth => this.setState({ dayOfBirth })}
                            keyboardType="phone-pad"
                            returnKeyType={"next"}
                            blurOnSubmit={false} //focus textinput
                            // hrEnable={false}
                            type={'datetime'}
                            options={{
                                format: 'DD/MM/YYYY'
                            }}
                        />
                        {/* <TouchableHighlight
                            onPress={() => this.showCalendarDate()}
                            style={[
                                commonStyles.shadowOffset,
                                {
                                    position: "absolute",
                                    padding: Constants.PADDING_LARGE,
                                    right: Constants.PADDING_LARGE,
                                    paddingTop: Constants.PADDING_XX_LARGE + Constants.PADDING
                                }
                            ]}
                            underlayColor="transparent"
                        >
                            <Image
                                style={{
                                    flex: 1,
                                    flexDirection: "column",
                                    justifyContent: "flex-end",
                                    resizeMode: "contain"
                                }}
                                source={ic_calendar_grey}
                            />
                        </TouchableHighlight> */}
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    // data: state.tabVehicle.data,
    // isLoading: state.tabVehicle.isLoading,
    // error: state.tabVehicle.error,
    // errorCode: state.tabVehicle.errorCode,
    // action: state.tabVehicle.action
});

const mapDispatchToProps = {
    ...productActions
};

export default connect(mapStateToProps, mapDispatchToProps)(TabInfoView);
