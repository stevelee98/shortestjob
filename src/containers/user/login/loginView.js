"use strict";
import React, { Component } from "react";
import { View, TextInput, Image, StyleSheet, Text, ImageBackground, TouchableOpacity, TouchableHighlight, Keyboard, SafeAreaView, BackHandler } from "react-native";
import { Container, Form, Content, Item, Input, Button, Right, Icon, Header, Root, Left, Body, Title, Toast } from "native-base";
import ButtonComp from "components/button";
import StringUtil from "utils/stringUtil";
import styles from "./styles";
import { localizes } from "locales/i18n";
import BaseView from "containers/base/baseView";
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import commonStyles from "styles/commonStyles";
import { Fonts } from "values/fonts";
import ic_facebook_blue from "images/ic_facebook_blue.png";
import ic_google_red from "images/ic_google_red.png";
import ic_lock_grey from "images/ic_lock_grey.png";
import ic_unlock_grey from "images/ic_unlock_grey.png";
import { Constants } from "values/constants";
import { Colors } from "values/colors";
import ic_back_white from "images/ic_back_white.png";
import { ErrorCode } from "config/errorCode";
import Utils from "utils/utils";
import StorageUtil from "utils/storageUtil";
import { dispatch } from "rxjs/internal/observable/pairs";
import { NavigationActions } from "react-navigation";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { GoogleSignin, GoogleSigninButton, statusCodes } from "react-native-google-signin";
import { AccessToken, LoginManager, GraphRequest, GraphRequestManager, LoginButton } from "react-native-fbsdk";
import GenderType from "enum/genderType";
import { StackActions } from "react-navigation";
import ic_facebook from "images/ic_facebook.png";
import ic_google from "images/ic_google.png";
import statusType from "enum/statusType";
import screenType from "enum/screenType";
import firebase from "react-native-firebase";
import bannerType from "enum/bannerType";
import TextInputCustom from "components/textInputCustom";
import ic_logo_large from "images/ic_logo_large.png";
import { configConstants } from "values/configConstants";
import globalUtils from 'utils/global';
class LoginView extends BaseView {
    constructor() {
        super();
        this.state = {
            hidePassword: true,
            password: "",
            emailOrPhone: "",
            user: null,
            errorSignIn: null
        };
        this.hidePassword = true;
        this.onChangeEmailOrPhone = this.onChangeEmailOrPhone.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    managePasswordVisibility = () => {
        // function used to change password visibility
        let last = this.state.password;
        this.setState({ hidePassword: !this.state.hidePassword, password: "" });
        setTimeout(() => {
            this.setState({ password: last });
        }, 0);
    };

    /**
     * Validate data
     */
    validateData() {
        const { emailOrPhone, password } = this.state;
        if (StringUtil.isNullOrEmpty(emailOrPhone)) {
            this.showMessage(localizes("login.vali_phone"));
            this.emailOrPhone.focus();
            return false;
        } else if (!Utils.validateEmail(emailOrPhone) && !emailOrPhone.replace(/[^0-9]/g, "")) {
            this.showMessage(localizes("login.invalidPhone"));
            return false;
        } else if (StringUtil.isNullOrEmpty(password)) {
            this.showMessage(localizes("register.vali_fill_password"));
            this.password.focus();
            return false;
        }
        return true;
    }
    /**
     * Login
     */
    login() {
        console.log(StringUtil.capitalizeFirstLetter("login"));
        if (this.validateData()) {
            let data = {
                email: Utils.validateEmail(this.state.emailOrPhone) ? this.state.emailOrPhone : "",
                phone: this.state.emailOrPhone,
                password: this.state.password
            };
            this.props.login(data);
        }
    }

    /**
     * ForgotPassword
     */
    forgotPasswordView() {
        console.log(localizes("login.login_button"));
        this.props.navigation.navigate("ForgotPassword", {
            screenType: screenType.FROM_FORGET_PASSWORD,
            dataUser: null
        });
    }

    Splash() {
        this.props.navigation.navigate("Login");
    }

    /**
     * Login via Google
     */
    loginGoogle = async () => {
        try {
            await GoogleSignin.signOut();
            GoogleSignin.signIn()
                .then(dataUser => {
                    console.log("User google: ", dataUser);
                    let data = {
                        userName: dataUser.givenName,
                        email: dataUser.email,
                        phone: "",
                        countryCode: "",
                        avatarPath: dataUser.photo,
                        userType: null,
                        socialId: dataUser.id,
                        gender: GenderType.MALE,
                        token: "",
                        rememberToken: "",
                        name: dataUser.name,
                        birthDate: null,
                        password: ""
                    };
                    this.props.loginGoogle(data);
                })
                .catch(err => {
                    this.saveException(err, "loginGoogle");
                })
                .done();
        } catch (error) {
            this.saveException(error, "loginGoogle");
        }
    };

    /**
     * Login via Facebook
     */
    loginFacebook = async () => {
        console.log("Login facebook");
        try {
            // await GoogleSignin.signOut();
            LoginManager.logInWithReadPermissions(["public_profile", "email"]).then(result => {
                if (result.isCancelled) {
                    return;
                }
                AccessToken.getCurrentAccessToken().then(data => {
                    console.log(data); // output 1:
                    const responseInfoCallback = (error, profile) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("Data facebook: ", profile); // output 2:
                            let data = {
                                //id:parseFloat(dataUser.id),
                                userName: profile.name,
                                email: profile.email,
                                phone: "",
                                countryCode: "",
                                avatarPath: "https://graph.facebook.com/" + profile.id + "/picture?type=normal",
                                userType: null,
                                socialId: profile.id,
                                gender: GenderType.MALE,
                                token: "",
                                rememberToken: "",
                                name: profile.name,
                                birthDate: null,
                                password: ""
                            };
                            this.props.loginFacebook(data);
                        }
                    };
                    const accessToken = data.accessToken;
                    const infoRequest = new GraphRequest(
                        "/me",
                        {
                            accessToken,
                            parameters: {
                                fields: {
                                    string: "name,gender,email"
                                }
                            }
                        },
                        responseInfoCallback
                    );
                    new GraphRequestManager().addRequest(infoRequest).start();
                });
            });
        } catch (e) {
            console.log(e);
        }
    };

    async componentDidMount() {
        //await GoogleSignin.hasPlayServices({ autoResolve: true });
        await GoogleSignin.configure({
            iosClientId: configConstants.KEY_IOS_CLIENT_ID_GOOGLE
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    /**
     * Handle data when request
     */
    handleData() {
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (
                    this.props.action == getActionSuccess(ActionEvent.LOGIN) ||
                    this.props.action == getActionSuccess(ActionEvent.LOGIN_GOOGLE) ||
                    this.props.action == getActionSuccess(ActionEvent.LOGIN_FB)
                ) {
                    let data = this.props.data;
                    console.log("DATA USER: ", data);
                    console.log("STATUS: ", data.status);
                    if (data.status == statusType.ACTIVE) {
                        globalUtils.idUser = data.id;
                        console.log("A000");
                        StorageUtil.storeItem(StorageUtil.USER_PROFILE, data);
                        //Save token login
                        StorageUtil.storeItem(StorageUtil.USER_TOKEN, data.token);
                        StorageUtil.storeItem(StorageUtil.FIREBASE_TOKEN, data.firebaseToken)
                        global.token = data.token;
                        global.firebaseToken = data.firebaseToken;
                        this.props.getUserProfile(data.id);
                        this.props.notifyLoginSuccess();
                        this.props.getNotificationsRequest({
                            userId: data.id,
                            paging: {
                                pageSize: Constants.PAGE_SIZE,
                                page: 0
                            }
                        });
                    }
                    if ((!Utils.isNull(data.fbId) || !Utils.isNull(data.ggId)) && data.status == statusType.DRAFT) {
                        console.log("A111");
                        this.props.navigation.navigate("ForgotPassword", {
                            screenType: screenType.FROM_LOGIN_SOCIAL,
                            dataUser: data,
                            title: 'Cập nhật số điện thoại',
                            scree: screenType.FROM_LOGIN_SOCIAL
                        });
                        this.signOutFB("Facebook");
                        this.signOutGG("Google");
                    } else {
                        console.log("A222");
                        this.signInWithCustomToken(data.id);
                        this.goHomeScreen();
                        this.refreshToken();
                        if (this.props.navigation.state.params) {
                            const { router } = this.props.navigation.state.params;
                            if (!Utils.isNull(router)) {
                                this.props.navigation.navigate(router.name, router.params);
                            }
                        }
                    }
                }
            } else if (this.props.errorCode == ErrorCode.LOGIN_FAIL_USERNAME_PASSWORD_MISMATCH) {
                // this.showMessage(localizes("login.accountNotMatch"));
                this.showMessage("Số điện thoại hoặc mật khẩu không đúng");
                this.password.focus();
            } else if (this.props.errorCode == ErrorCode.INVALID_ACCOUNT) {
                // this.showMessage(localizes("login.phoneNotExist"));
                this.showMessage("Số điện thoại hoặc mật khẩu không đúng");
                this.emailOrPhone.focus();
            } else if (this.props.errorCode == ErrorCode.USER_HAS_BEEN_DELETED) {
                this.showMessage(localizes("login.account_block"));
                this.emailOrPhone.focus();
            } else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    render() {
        console.log("Render login");
        const { user, signInError } = this.state;
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header, { backgroundColor: Colors.COLOR_PRIMARY }]}>
                        {this.renderHeaderView({
                            title: localizes("login.login_title"),
                            visibleStage: false,
                            titleStyle: { color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightHeader
                        })}
                    </Header>

                    <Content contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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

                        <View
                            style={{
                                backgroundColor: Colors.COLOR_WHITE,
                                // marginTop: Constants.MARGIN_X_LARGE
                            }}
                        >
                            {/* Full name */}
                            <TextInputCustom
                                inputNormalStyle={{
                                    paddingVertical: Constants.PADDING_LARGE
                                }}
                                title={localizes("login.phone")}
                                refInput={r => (this.emailOrPhone = r)}
                                isInputNormal={true}
                                placeholder={localizes("login.input_phone")}
                                value={this.state.emailOrPhone}
                                onChangeText={this.onChangeEmailOrPhone}
                                onSubmitEditing={() => {
                                    this.password.focus();
                                }}
                                returnKeyType={"next"}
                                keyboardType="numeric"
                            />
                            {/* Password */}
                            <View
                                style={{
                                    justifyContent: "center",
                                    position: "relative"
                                }}
                            >
                                <TextInputCustom
                                    refInput={ref => (this.password = ref)}
                                    isInputNormal={true}
                                    title={localizes("login.password")}
                                    placeholder={localizes("login.input_password")}
                                    value={this.state.password}
                                    secureTextEntry={this.state.hidePassword}
                                    onChangeText={this.onChangePassword}
                                    onSelectionChange={({ nativeEvent: { selection } }) => {
                                        console.log(this.className, selection);
                                    }}
                                    onSubmitEditing={() => {
                                        Keyboard.dismiss();
                                    }}
                                    returnKeyType={"done"}
                                    inputNormalStyle={{
                                        paddingVertical: Constants.PADDING_LARGE,
                                        paddingRight: Constants.PICKER_HEIGHT,
                                    }}
                                    hrEnable={false}
                                />
                                <TouchableHighlight
                                    onPress={this.managePasswordVisibility}
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
                                            resizeMode: "contain",
                                            opacity: 0.5
                                        }}
                                        source={this.state.hidePassword ? ic_lock_grey : ic_unlock_grey}
                                    />
                                </TouchableHighlight>
                            </View>
                        </View>
                        {/* forgot pass */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <View style={{ flex: 1 }}></View>
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={() => this.forgotPasswordView()}
                                style={{
                                    justifyContent: "flex-end",
                                    flexDirection: "row",
                                    margin: Constants.MARGIN_LARGE,
                                    // backgroundColor: 'red'
                                }}
                                transparent
                            >
                                <Text
                                    style={[
                                        commonStyles.text,
                                        {
                                            color: Colors.COLOR_DRK_GREY,
                                            textAlign: "center"
                                        }
                                    ]}
                                >
                                    {localizes("forgot_password.forgot_password")}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View
                            style={{
                                flex: 1,
                                // justifyContent: "flex-end",
                                // marginVertical: Constants.MARGIN_X_LARGE,
                                // backgroundColor: Colors.COLOR_BLUE
                            }}
                        >
                            <View
                                style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "row",
                                }}
                            >
                                <TouchableOpacity
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    style={{
                                        // flexDirection: "row",
                                        justifyContent: "flex-start",
                                        alignItems: "flex-start"
                                    }}
                                    onPress={() => {
                                        this.props.navigation.navigate("Register");
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
                                        {localizes("login.notAccountYet")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {this.renderCommonButton(
                                localizes("login.login_button"),
                                { color: Colors.COLOR_WHITE },
                                {
                                    backgroundColor: Colors.COLOR_PRIMARY,
                                    marginHorizontal: Constants.MARGIN_X_LARGE
                                },
                                () => {
                                    this.login();
                                },
                                null,
                                false, // isBtnLogOut
                                true // isBtnRegister
                            )}
                            <View style={[commonStyles.viewCenter, { marginBottom: Constants.MARGIN_X_LARGE }]}>
                                <Text style={[commonStyles.text, { margin: 0 }]}>- Hoặc -</Text>
                            </View>
                            {this.renderCommonButton(
                                'ĐĂNG NHẬP VỚI GOOGLE',
                                { color: Colors.COLOR_TEXT },
                                {
                                    backgroundColor: Colors.COLOR_WHITE,
                                    marginHorizontal: Constants.MARGIN_X_LARGE * 3,
                                    borderRadius: Constants.MARGIN,
                                    marginVertical: 0,
                                },
                                () => {
                                    this.loginGoogle();
                                },
                                ic_google,
                                false, // isBtnLogOut
                                true // isBtnRegister
                            )}
                            {this.renderCommonButton(
                                'ĐĂNG NHẬP VỚI FACEBOOK',
                                { color: Colors.COLOR_WHITE },
                                {
                                    backgroundColor: Colors.COLOR_FACEBOOk,
                                    marginHorizontal: Constants.MARGIN_X_LARGE * 3,
                                    borderRadius: Constants.MARGIN
                                },
                                () => {
                                    this.loginFacebook();
                                },
                                ic_facebook,
                                false, // isBtnLogOut
                                true // isBtnRegister
                            )}
                        </View>
                    </Content>
                    {this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    onChangePassword(password) {
        this.setState({
            password
        });
    }

    onChangeEmailOrPhone(emailOrPhone) {
        this.setState({
            emailOrPhone
        });
    }
}

const mapStateToProps = state => ({
    data: state.login.data,
    isLoading: state.login.isLoading,
    error: state.login.error,
    errorCode: state.login.errorCode,
    action: state.login.action
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginView);
