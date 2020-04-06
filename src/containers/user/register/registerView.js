"use strict";
import React, { Component } from "react";
import {
    Dimensions,
    View,
    TextInput,
    Image,
    StyleSheet,
    Text,
    PixelRatio,
    ImageBackground,
    Platform,
    TouchableHighlight,
    TouchableOpacity,
    Keyboard,
    ToastAndroid,
    ScrollView,
    Modal,
    BackHandler
} from "react-native";
import { Container, Form, Content, Input, Button, Right, Radio, center, ListItem, Left, Header, Item, Picker, Body, Root } from "native-base";
import ButtonComp from "components/button";
import { capitalizeFirstLetter } from "utils/stringUtil";
import styles from "./styles";
import { localizes } from "locales/i18n";
import BaseView from "containers/base/baseView";
import commonStyles from "styles/commonStyles";
import I18n from "react-native-i18n";
import { Colors } from "values/colors";
import { Fonts } from "values/fonts";
import { CheckBox } from "react-native-elements";
import { Constants } from "values/constants";
import { Icon } from "react-native-elements";
import index from "../../../reducers";
import Utils from "utils/utils";
import ic_back_white from "images/ic_back_white.png";
import ic_lock_white from "images/ic_lock_white.png";
import ic_unlock_white from "images/ic_unlock_white.png";
import ModalDropdown from "components/modalDropdown";
import Autocomplete from "components/autocomplete";
import { connect } from "react-redux";
import StorageUtil from "utils/storageUtil";
import { ErrorCode } from "config/errorCode";
import { getActionSuccess, ActionEvent } from "actions/actionEvent";
import * as actions from "actions/userActions";
import GenderType from "enum/genderType";
import StringUtil from "utils/stringUtil";
import ImagePicker from "react-native-image-crop-picker";
import roleType from "enum/roleType";
import userType from "enum/userType";
import screenType from "enum/screenType";
import TextInputCustom from "components/textInputCustom";
import ic_logo_large from "images/ic_logo_large.png";
import OTPType from "enum/otpType";

const deviceHeight = Dimensions.get("window").height;
const MARGIN_BETWEEN_ITEM = 0;

class RegisterView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            telephoneNumber: "",
            isSignUp: false
        };
        this.isFirstTime = true;
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    /**
     * Validate and sign up
     */
    validateAndSignUp() {
        const { telephoneNumber } = this.state;
        const res = telephoneNumber.charAt(0);

        if (telephoneNumber == "") {
            this.showMessage(localizes("register.vali_phone"));
            this.telephoneNumber.focus();
        } else if (telephoneNumber.length < 10 || telephoneNumber.length > 11 || res != "0") {
            this.showMessage(localizes("register.errorPhone"));
            this.telephoneNumber.focus();
        } else if (!Utils.validatePhone(telephoneNumber)) {
            this.showMessage(localizes("register.errorPhone"));
            this.telephoneNumber.focus();
        } else {
            let signUpData = {
                phone: telephoneNumber
            };
            this.props.signUp(signUpData);
            this.setState({
                isSignUp: true
            });
        }
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.SIGN_UP)) {
                    // this.showMessage(localizes("register.register_success"))
                    if (this.state.isSignUp) {
                        this.props.navigation.navigate("OTP", {
                            screenType: screenType.FROM_REGISTER,
                            phone: this.state.telephoneNumber,
                            sendType: OTPType.REGISTER
                        });
                        this.setState({
                            isSignUp: false
                        });
                    }
                }
            } else if (this.props.errorCode == ErrorCode.USER_EXIST_TRY_LOGIN_FAIL) {
                this.showMessage(localizes("userProfileView.existMobile"));
            } else if (this.props.errorCode == ErrorCode.USER_HAS_BEEN_BLOCKED) {
                this.showMessage(localizes("login.account_block"));
            } else {
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

    render() {
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header, { backgroundColor: Colors.COLOR_PRIMARY }]}>
                        {this.renderHeaderView({
                            title: localizes("register.register_title"),
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
                            <Form style={{ flex: 1, marginTop: Constants.MARGIN_X_LARGE }}>
                                {/*PhoneNumber*/}
                                <TextInputCustom
                                    title={localizes("register.phone")}
                                    inputNormalStyle={{
                                        paddingVertical: Constants.PADDING_LARGE
                                    }}
                                    refInput={input => {
                                        this.telephoneNumber = input;
                                    }}
                                    isInputNormal={true}
                                    placeholder={localizes("register.inputPhone")}
                                    value={this.state.telephoneNumber}
                                    onChangeText={telephoneNumber => {
                                        this.setState({
                                            telephoneNumber: telephoneNumber
                                        });
                                    }}
                                    onSubmitEditing={() => {
                                        Keyboard.dismiss();
                                    }}
                                    keyboardType="numeric"
                                    returnKeyType={"done"}
                                    blurOnSubmit={false}
                                    numberOfLines={1}
                                    hrEnable={false}
                                />

                                {/* </View> */}
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: "flex-end",
                                        marginVertical: Constants.MARGIN_X_LARGE
                                    }}
                                >
                                    <View
                                        style={{
                                            justifyContent: "center",
                                            alignItems: "center",
                                            flexDirection: "row"
                                        }}
                                    >
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: "flex-start",
                                                alignItems: "flex-start"
                                            }}
                                            onPress={() => {
                                                this.props.navigation.navigate("Login");
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    commonStyles.text,
                                                    {
                                                        textAlign: "center",
                                                        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
                                                        margin: 0,
                                                        color: Colors.COLOR_PRIMARY
                                                    }
                                                ]}
                                            >
                                                {localizes("register.alreadyAcc")}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    {/* Register */}
                                    {this.renderCommonButton(
                                        localizes("register.sendCode"),
                                        { color: Colors.COLOR_WHITE },
                                        { marginHorizontal: Constants.MARGIN_X_LARGE },
                                        () => { this.onPressRegister() }
                                    )}
                                </View>
                            </Form>
                        </View>
                    </Content>
                    {this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    /**
     * Register
     */
    onPressRegister() {
        this.validateAndSignUp();
    }
}

const mapStateToProps = state => ({
    data: state.signUp.data,
    isLoading: state.signUp.isLoading,
    error: state.signUp.error,
    errorCode: state.signUp.errorCode,
    action: state.signUp.action
});

export default connect(
    mapStateToProps,
    actions
)(RegisterView);
