"use strict";
import React, { Component } from "react";
import { View, TextInput, Dimensions, Image, StyleSheet, Text, ImageBackground, Keyboard, ToastAndroid, TouchableOpacity, BackHandler } from "react-native";
import { Container, Form, Content, Item, Input, Button, Right, Radio, center, ListItem, Left, Root, Header, Body } from "native-base";
import ButtonComp from "components/button";
import { capitalizeFirstLetter } from "utils/stringUtil";
import styles from "./styles";
import { localizes } from "locales/i18n";
import BaseView from "containers/base/baseView";
import { Colors } from "values/colors";
import I18n from "react-native-i18n";
import commonStyles from "styles/commonStyles";
import { Fonts } from "values/fonts";
import ic_lock_white from "images/ic_lock_white.png";
import { Constants } from "values/constants";
import { Icon, colors } from "react-native-elements";
import ic_back_white from "images/ic_back_white.png";
import Utils from "utils/utils";
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import StorageUtil from "utils/storageUtil";
import ScreenType from "enum/screenType";
import DateUtil from "utils/dateUtil";
import statusType from "enum/statusType";
import ic_logo_large from "images/ic_logo_large.png";
import BackgroundShadow from "components/backgroundShadow";

const widthTextOTP = Dimensions.get("window").width / 8;
const heightTextOTP = Dimensions.get("window").height / 8;

class OTPView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            charOne: "",
            charTwo: "",
            charThere: "",
            charFour: "",
            codeOTP: "",
            statusSend: false,
            textButton: localizes("otp.btnConfirm"),
            timeCountDown: 1.5 * 60
        };
        this.auThenTime = 1.5 * 60;
        const { screenType, phone, sendType } = this.props.navigation.state.params;
        this.screenType = screenType;
        this.phone = screenType != ScreenType.FROM_LOGIN_SOCIAL ? phone : this.props.navigation.state.params.dataUser.phone;
        this.sendType = sendType;
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
    }

    // Action button
    onActionOTP = () => {
        const { statusSend, codeOTP, charOne, charTwo, charThere, charFour } = this.state;
        const filter = {
            codeOTP: charOne + charTwo + charThere + charFour
        };
        if (
            statusSend == false &&
            (this.screenType == ScreenType.FROM_FORGET_PASSWORD || this.screenType == ScreenType.FROM_REGISTER || this.screenType == ScreenType.FROM_LOGIN_SOCIAL)
        ) {
            let filter = {
                sendType: this.sendType,
                phone: this.phone
            };
            this.props.sendOTP(filter);
            this.setState({
                statusSend: true,
                textButton: localizes("otp.btnConfirm"),
                timeCountDown: this.auThenTime
            });
        } else {
            StorageUtil.retrieveItem(StorageUtil.OTP_KEY)
                .then(otpKey => {
                    console.log("OTPKey_Back", otpKey.codeOTP);
                    console.log("OTPKey_Font", filter.codeOTP);
                    if (!Utils.isNull(otpKey)) {
                        if (charOne !== "" && charTwo != "" && charThere !== "" && charFour != "") {
                            if (otpKey.codeOTP !== filter.codeOTP) {
                                this.showMessage(localizes("otp.errOTP"));
                            } else {
                                if (this.screenType == ScreenType.FROM_REGISTER) {
                                    this.props.navigation.navigate("ConfirmRegister", {
                                        phone: this.phone,
                                        onBack: this.onBack
                                    });
                                    this.showMessage('Nhập thông tin để hoàn thành đăng ký!');
                                } else if (this.screenType == ScreenType.FROM_LOGIN_SOCIAL) {
                                    const { dataUser } = this.props.navigation.state.params;
                                    const filter = {
                                        codeOTP: charOne + charTwo + charThere + charFour,
                                        phone: dataUser.phone,
                                        isSocial: true,
                                        idSocial: dataUser.id
                                    };
                                    this.props.confirmOTP(filter); // set status for user = 1
                                    this.showMessage(localizes("otp.succesOTP"));
                                    StorageUtil.storeItem(StorageUtil.USER_PROFILE, dataUser);
                                } else if (this.screenType == ScreenType.FROM_FORGET_PASSWORD) {
                                    this.props.navigation.navigate("ConfirmPassword", {
                                        phone: this.phone,
                                        onBack: this.onBack
                                    });
                                }
                            }
                        } else {
                            this.showMessage(localizes("otp.valiCode"));
                        }
                    } else {
                        this.showMessage(localizes("otp.errorSendCode"));
                        this.setState({
                            statusSend: false,
                            textButton: localizes("otp.resendOTP")
                        });
                    }
                })
                .catch(error => {
                    this.saveException(error, "onActionOTP");
                });
        }
    };

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    handleData() {
        const { statusSend, textButton } = this.state;
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.SEND_OTP)) {
                    console.log("SEND_OTP: ", data);
                    if (!Utils.isNull(data)) {
                        StorageUtil.storeItem(StorageUtil.OTP_KEY, data);
                        this.setState({
                            statusSend: true,
                            textButton: localizes("otp.btnConfirm"),
                            timeCountDown: this.auThenTime
                        });
                    } else {
                        console.log("Ma OTP chua duoc gui");
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.CONFIRM_OTP)) {
                    StorageUtil.retrieveItem(StorageUtil.USER_PROFILE)
                        .then(user => {
                            console.log("confirm otp", user);
                            if (!Utils.isNull(user)) {
                                user.status = statusType.ACTIVE;
                                StorageUtil.storeItem(StorageUtil.USER_PROFILE, user);
                                if (this.screenType == ScreenType.FROM_LOGIN_SOCIAL) {
                                    //Save token login
                                    StorageUtil.storeItem(StorageUtil.USER_TOKEN, user.token);
                                    StorageUtil.storeItem(StorageUtil.FIREBASE_TOKEN, user.firebaseToken);
                                    global.token = user.token;
                                    global.firebaseToken = user.firebaseToken;
                                    this.props.notifyLoginSuccess();
                                }
                            }
                            this.signInWithCustomToken(user.id);
                        })
                        .catch(error => {
                            this.saveException(error, "handleData");
                        });
                    this.goHomeScreen();
                    // refresh token:
                    this.refreshToken();
                } else {
                    this.handleError(this.props.errorCode, this.props.error);
                }
            }
        }
    }

    componentDidMount() {
        super.componentDidMount();
        if (this.screenType == ScreenType.FROM_FORGET_PASSWORD || this.screenType == ScreenType.FROM_REGISTER || this.screenType == ScreenType.FROM_LOGIN_SOCIAL) {
            console.log("PHONE:", this.phone);
            let filter = {
                sendType: this.sendType,
                phone: this.phone
            };
            this.props.sendOTP(filter);
            this.setState({
                statusSend: true,
                textButton: localizes("otp.btnConfirm"),
                timeCountDown: this.auThenTime
            });
        }
        this._interval = setInterval(() => {
            if (this.state.timeCountDown > 0) {
                this.setState({
                    timeCountDown: this.state.timeCountDown - 1,
                    textButton: localizes("otp.btnConfirm")
                });
            } else {
                this.setState({
                    statusSend: false,
                    textButton: localizes("otp.resendOTP")
                });
            }
        }, 1000);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
        clearInterval(this._interval);
    }

    render() {
        const { textButton, statusSend, timeCountDown, charOne, charTwo, charThere, charFour } = this.state;
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header, { backgroundColor: Colors.COLOR_PRIMARY }]}>
                        {this.renderHeaderView({
                            title: localizes("otp.title"),
                            visibleStage: false,
                            titleStyle: { color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightHeader
                        })}
                    </Header>
                    <Content contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
                        <View style={{ flexGrow: 1 }}>
                            <View style={[commonStyles.viewCenter, { marginVertical: Constants.MARGIN_XX_LARGE }]}>
                                <View style={[commonStyles.viewCenter, {
                                    width: 100,
                                    height: 100,
                                    backgroundColor: Colors.COLOR_PRIMARY_DARK,
                                    borderRadius: 50
                                }]}>
                                    <Image source={ic_logo_large} />
                                </View>
                            </View>
                            <View style={{ flex: 1, alignItems: "center", flexDirection: "column", justifyContent: "flex-end", paddingHorizontal: Constants.PADDING_XX_LARGE }}>
                                <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_MEDIUM, margin: 0 }]}>
                                    {localizes("otp.noteOTP")}
                                    <Text style={[commonStyles.textBold, { margin: 0 }]}>{this.phone}</Text>
                                </Text>
                                <Text
                                    style={[
                                        commonStyles.text,
                                        {
                                            fontSize: Fonts.FONT_SIZE_MEDIUM,
                                            margin: 0,
                                            marginBottom: Constants.MARGIN_X_LARGE
                                        }
                                    ]}
                                >
                                    {localizes("otp.noteOTPConfirm")}
                                </Text>
                            </View>
                            {/* {Input form} */}
                            <Form
                                style={{
                                    flex: 1,
                                    justifyContent: "center"
                                }}
                            >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: Constants.PADDING_24 }}>
                                    {/* Code 1 */}
                                    <TextInput
                                        borderBottomWidth={1.5}
                                        //borderBottomStyle={{ colors: Colors.COLOR_BACKGROUND }}
                                        style={[commonStyles.text, commonStyles.inputText, styles.styleInput, { width: widthTextOTP, borderBottomColor: Colors.COLOR_DRK_GREY }]}
                                        onChangeText={charOne => {
                                            this.setState({ charOne }, () => (charOne ? this.charTwo.focus() : null));
                                        }}
                                        keyboardType="numeric"
                                        onSubmitEditing={() => { }}
                                        value={charOne}
                                        underlineColorAndroid="transparent"
                                        maxLength={1}
                                        autoFocus={true}
                                        ref={ref => (this.charOne = ref)}
                                    />
                                    {/* Code 2 */}
                                    <TextInput
                                        borderBottomWidth={1.5}
                                        style={[commonStyles.text, commonStyles.inputText, styles.styleInput, { width: widthTextOTP, borderBottomColor: Colors.COLOR_DRK_GREY }]}
                                        onChangeText={charTwo => {
                                            this.setState({ charTwo }, () => (charTwo ? this.charThere.focus() : null));
                                        }}
                                        keyboardType="numeric"
                                        onSubmitEditing={() => {
                                            this.charThere.focus();
                                        }}
                                        value={charTwo}
                                        underlineColorAndroid="transparent"
                                        maxLength={1}
                                        onKeyPress={event =>
                                            event.nativeEvent.key == "Backspace" ? (charTwo ? null : this.setState({ charOne: "" }, () => this.charOne.focus())) : null
                                        }
                                        ref={ref => (this.charTwo = ref)}
                                    />
                                    {/* Code 3 */}
                                    <TextInput
                                        borderBottomWidth={1.5}
                                        style={[commonStyles.text, commonStyles.inputText, styles.styleInput, { width: widthTextOTP, borderBottomColor: Colors.COLOR_DRK_GREY }]}
                                        onChangeText={charThere => {
                                            this.setState({ charThere }, () => (charThere ? this.charFour.focus() : null));
                                        }}
                                        keyboardType="numeric"
                                        onSubmitEditing={() => {
                                            this.charFour.focus();
                                        }}
                                        value={charThere}
                                        underlineColorAndroid="transparent"
                                        maxLength={1}
                                        onKeyPress={event =>
                                            event.nativeEvent.key == "Backspace" ? (charThere ? null : this.setState({ charTwo: "" }, () => this.charTwo.focus())) : null
                                        }
                                        ref={ref => (this.charThere = ref)}
                                    />
                                    {/* Code 4 */}
                                    <TextInput
                                        borderBottomWidth={1.5}
                                        style={[commonStyles.text, commonStyles.inputText, styles.styleInput, { width: widthTextOTP, borderBottomColor: Colors.COLOR_DRK_GREY }]}
                                        onChangeText={charFour => {
                                            this.setState({ charFour }, () => (charFour ? null : null));
                                        }}
                                        keyboardType="numeric"
                                        value={charFour}
                                        underlineColorAndroid="transparent"
                                        maxLength={1}
                                        onKeyPress={event =>
                                            event.nativeEvent.key == "Backspace" ? (charFour ? null : this.setState({ charThere: "" }, () => this.charThere.focus())) : null
                                        }
                                        ref={ref => (this.charFour = ref)}
                                    />
                                </View>
                                <View style={{ alignItems: "center", marginTop: Constants.MARGIN_12 }}>
                                    {timeCountDown != 0 ? (
                                        <View>
                                            <Text
                                                style={[
                                                    commonStyles.text,
                                                    {
                                                        fontSize: Fonts.FONT_SIZE_XX_SMALL,
                                                        color: Colors.COLOR_DRK_GREY,
                                                        marginHorizontal: Constants.PADDING_XX_LARGE
                                                    }
                                                ]}
                                            >
                                                {localizes("otp.auThenTime")}
                                                {DateUtil.parseMillisecondToTime(this.state.timeCountDown * 1000)}
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>
                            </Form>
                            <View style={{ flex: 1, justifyContent: "flex-end", marginVertical: Constants.MARGIN_X_LARGE }}>
                                <View style={{ marginTop: Constants.MARGIN_X_LARGE }}>
                                    {this.renderCommonButton(
                                        textButton,
                                        { color: Colors.COLOR_WHITE },
                                        { marginHorizontal: Constants.MARGIN_X_LARGE },
                                        () => {
                                            this.onActionOTP();
                                        }
                                    )}
                                </View>
                            </View>
                        </View>
                    </Content>
                    {this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }
}
const mapStateToProps = state => ({
    data: state.otp.data,
    action: state.otp.action,
    isLoading: state.otp.isLoading,
    error: state.otp.error,
    errorCode: state.otp.errorCode
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    actions
)(OTPView);
