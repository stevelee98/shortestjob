"use strict";
import React, { Component } from "react";
import { View, TextInput, Image, StyleSheet, Text, ImageBackground, Keyboard, ToastAndroid, TouchableOpacity, BackHandler } from "react-native";
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
import { Icon } from "react-native-elements";
import ic_back_white from "images/ic_back_white.png";
import Utils from "utils/utils";
import * as actions from "actions/userActions";
import { connect } from "react-redux";
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import StorageUtil from "utils/storageUtil";
import screenType from "enum/screenType";
import TextInputCustom from "components/textInputCustom";
import ic_logo_large from "images/ic_logo_large.png";
import OTPType from "enum/otpType";

class ForgotPasswordView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            phone: ""
        };
        this.dataUser = this.props.navigation.state.params.dataUser;
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
    }

    // Forget password
    onForgotPass = () => {
        var { phone } = this.state;
        const res = phone.charAt(0);
        if (phone == "") {
            this.showMessage(localizes("forgot_password.vali_fill_phone"));
        } else if (phone.length < 10 || phone.length > 11 || res != "0") {
            this.showMessage(localizes("forgot_password.invalidPhone"));
        } else if (!Utils.validatePhone(phone)) {
            this.showMessage(localizes("forgot_password.invalidPhone"));
        } else if (this.props.navigation.state.params.screenType == screenType.FROM_LOGIN_SOCIAL) {
            console.log("user", this.dataUser);
            if (!Utils.isNull(this.dataUser)) {
                this.dataUser.phone = phone;
                let updatePhone = true;
                this.props.forgetPass(phone, updatePhone, this.dataUser.id);
            }
        }
        // else if (this.props.errorCode == ErrorCode.USER_HAS_BEEN_DELETED) {
        //     this.showMessage(localizes("login.account_block"));
        //     // this.emailOrPhone.focus();
        // } 
        else {
            console.log("DA VAO QUEN MAT KHAU");
            let updatePhone = false;
            let id = "";
            this.props.forgetPass(phone, updatePhone, id);
        }
    };

    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.FORGET_PASS)) {
                    this.setState({
                        phone: ""
                    });
                    if (data == true && this.props.navigation.state.params.screenType !== screenType.FROM_LOGIN_SOCIAL) {
                        this.props.navigation.goBack();
                        this.props.navigation.navigate("OTP", {
                            screenType: screenType.FROM_FORGET_PASSWORD,
                            phone: this.state.phone,
                            sendType: OTPType.FORGOT_PASS
                        });
                    } else if (data == true && this.props.navigation.state.params.screenType == screenType.FROM_LOGIN_SOCIAL) {
                        this.props.navigation.goBack();
                        this.props.navigation.navigate("OTP", {
                            screenType: screenType.FROM_LOGIN_SOCIAL,
                            dataUser: this.dataUser,
                            sendType: OTPType.FORGOT_PASS
                        });
                    } else {
                        this.showMessage(localizes("forgot_password.existsPhone"));
                    }
                }
            } else if (this.props.errorCode == ErrorCode.INVALID_ACCOUNT) {
                if (this.props.action == getActionSuccess(ActionEvent.FORGET_PASS)) {
                    // this.showMessage(localizes("forgot_password.phoneNotExist"));
                    this.showMessage('Số điện thoại chưa được đăng ký!');
                }
            }
            else if (this.props.errorCode == ErrorCode.USER_HAS_BEEN_DELETED) {
                this.showMessage(localizes("login.account_block"));
                // this.emailOrPhone.focus();
            }
            else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    render() {
        const { scree, title } = this.props.navigation.state.params;
        console.log("forget pass: ", this.props.navigation.state.params);
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header, { backgroundColor: Colors.COLOR_PRIMARY }]}>
                        {this.renderHeaderView({
                            title: scree == screenType.FROM_LOGIN_SOCIAL ? title : localizes("forgot_password.forgot_password"),
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
                            {/* {Input form} */}
                            <View
                                style={{
                                    flex: 1,
                                    marginTop: Constants.MARGIN_X_LARGE
                                }}
                            >
                                {/* <View style={{ paddingHorizontal: Constants.PADDING_XX_LARGE + Constants.PADDING_X_LARGE }}>
                                    <Text style={[commonStyles.text, {
                                        fontSize: Fonts.FONT_SIZE_MEDIUM,
                                        margin: 0,
                                        marginBottom: Constants.MARGIN_LARGE
                                    }]}>
                                        {localizes('forgot_password.noteForgotPassword')}
                                    </Text>
                                </View> */}
                                {/* Phone number */}
                                {/* <Text style={[commonStyles.text, {
                                    margin: 0,
                                    marginHorizontal: Constants.MARGIN_24,
                                    fontSize: Fonts.FONT_SIZE_MEDIUM
                                }]}>{localizes('forgot_password.phoneNumber')}</Text> */}
                                <TextInputCustom
                                    title={localizes("forgot_password.input_phone")}
                                    refInput={ref => (this.retypePass = ref)}
                                    isInputNormal={true}
                                    placeholder={localizes("forgot_password.phoneNumber")}
                                    onChangeText={phone => {
                                        this.setState({
                                            phone: phone
                                        });
                                    }}
                                    keyboardType="numeric"
                                    value={this.state.phone}
                                    returnKeyType={"done"}
                                    onSubmitEditing={() => {
                                        Keyboard.dismiss();
                                    }}
                                    inputNormalStyle={commonStyles.touchInputSpecial}
                                    hrEnable={false}
                                />
                                <View style={{ flex: 1, justifyContent: "flex-end", marginVertical: Constants.MARGIN_X_LARGE }}>
                                    {this.renderCommonButton(
                                        // null == screenType.FROM_LOGIN_SOCIAL ?
                                        scree == screenType.FROM_LOGIN_SOCIAL ? 'GỬI MÃ KÍCH HOẠT' :
                                            localizes("forgot_password.btnUpdate")
                                        // :
                                        //   localizes("forgot_password.btnSendCode")
                                        ,
                                        { color: Colors.COLOR_WHITE },
                                        { marginHorizontal: Constants.MARGIN_X_LARGE },
                                        () => {
                                            this.onForgotPass();
                                        },
                                        null
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
    data: state.forgetPass.data,
    action: state.forgetPass.action,
    isLoading: state.forgetPass.isLoading,
    error: state.forgetPass.error,
    errorCode: state.forgetPass.errorCode
});
export default connect(
    mapStateToProps,
    actions
)(ForgotPasswordView);
