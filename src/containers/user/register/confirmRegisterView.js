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
import statusType from "enum/statusType";
import DateUtil from "utils/dateUtil";
import { CalendarScreen } from "components/calendarScreen";
import TextInputCustom from "components/textInputCustom";
import ic_logo_large from "images/ic_logo_large.png";
import moment from "moment";
import ic_lock_grey from "images/ic_lock_grey.png";
import ic_unlock_grey from "images/ic_unlock_grey.png";
import { TextInputMask } from "react-native-masked-text";

const deviceHeight = Dimensions.get("window").height;
const MARGIN_BETWEEN_ITEM = 0;

class ConfirmRegisterView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            telephoneNumber: this.props.navigation.state.params.phone,
            fullName: "",
            dayOfBirth: "",
            password: "",
            repeatPassword: "",
            images: null,
            image: null,
            path: "",
            pickerSelection: "Default",
            pickerDisplayed: false,
            hidePassword: true,
            hidePasswordConfirm: true,
            enableScrollViewScroll: true
        };
        this.today = DateUtil.now();
        this.selectedType = null;
        this.isFirstTime = true;
        this.hidePassword = true;
        this.hidePasswordConfirm = true;
    }

    /**
     * Login
     */
    login() {
        console.log(capitalizeFirstLetter("login"));
        // Actions.homeView();
        // this.props.navigation.navigate('drawerStack')
        this.props.navigation.navigate("Login");
    }

    /**
     * Register
     */
    register() {
        console.log(localizes("login.login_button"));
        this.props.navigation.navigate("Register");
    }

    /**
     * Validate and sign up
     */
    validateAndSignUp() {
        const { fullName, password, telephoneNumber, repeatPassword, dayOfBirth } = this.state;
        let type = [];
        let certificatePath = [];
        if (this.state.images != null) {
            for (let i = 0; i < this.state.images.length; i++) {
                certificatePath.push(this.state.images[i].uri);
            }
        }
        type.push(this.selectedType);
        const res = telephoneNumber.charAt(0);
        if (Utils.isNull(fullName)) {
            this.showMessage(localizes("register.vali_fill_fullname"));
            this.fullName.focus();
        } else if (StringUtil.validSpecialCharacter(fullName)) {
            this.showMessage("Name does not contain special characters");
            this.fullName.focus();
        } else if (Utils.isNull(telephoneNumber)) {
            this.showMessage(localizes("register.vali_phone"));
            this.telephoneNumber.focus();
        } else if (telephoneNumber.length < 10 || telephoneNumber.length > 11 || res != "0") {
            this.showMessage(localizes("register.errorPhone"));
            this.telephoneNumber.focus();
        } else if (!Utils.validatePhone(telephoneNumber)) {
            this.showMessage(localizes("register.errorPhone"));
        } else if (Utils.isNull(dayOfBirth)) {
            this.showMessage(localizes("register.vali_fill_dayOfBirth"));
            // this.dayOfBirth.focus();
        } else if (!Utils.validateDate(dayOfBirth)) {
            this.showMessage(localizes("register.vali_dayOfBirth"));
            // this.dayOfBirth.focus();
        } else if (Utils.isNull(password)) {
            this.showMessage(localizes("register.vali_fill_password"));
            this.password.focus();
        } else if (Utils.validateSpacesPass(password)) {
            this.showMessage(localizes("register.vali_pass_right"));
            this.password.focus();
        } else if (password.length < 6 || password.length >= 33) {
            this.showMessage(localizes("confirmPassword.vali_character_password"));
            this.password.focus();
        } else if (Utils.isNull(repeatPassword)) {
            this.showMessage(localizes("register.vali_fill_repeat_password"));
            this.confirmPassword.focus();
        } else if (password != repeatPassword) {
            this.showMessage(localizes("register.vali_confirm_password"));
            this.confirmPassword.focus();
        } else {
            let signUpData = {
                name: this.state.fullName,
                phone: this.state.telephoneNumber,
                birthDate: DateUtil.convertFromFormatToFormat(moment(this.state.dayOfBirth, "DD-MM-YYYY").add(1, "days"), DateUtil.FORMAT_DATE, DateUtil.FORMAT_DATE_TIME_ZONE),
                status: statusType.ACTIVE,
                password: this.state.password,
                userType: userType.CUSTOMER
            };
            this.props.signUp(signUpData);
        }
        this._container.scrollTo({ x: 0, y: 0, animated: true });
    }

    focusInput(text) {
        if (this.isFirstTime) return true;
        return text !== "";
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.SIGN_UP)) {
                    StorageUtil.storeItem(StorageUtil.USER_PROFILE, data);
                    this.showMessage(localizes("register.register_success"));
                    setTimeout(() => {
                        StorageUtil.storeItem(StorageUtil.USER_PROFILE, data);
                        //Save token login
                        StorageUtil.storeItem(StorageUtil.USER_TOKEN, data.token);
                        StorageUtil.storeItem(StorageUtil.FIREBASE_TOKEN, data.firebaseToken);
                        global.token = data.token;
                        global.firebaseToken = data.firebaseToken;
                        this.props.notifyLoginSuccess();
                        this.goHomeScreen(); //Register successfully => Main
                        // this.props.navigation.navigate("RegisterPartner", {
                        //     refreshProfile: null,
                        //     data: null,
                        //     titlePartner: localizes('registerPartner.note')
                        // })
                        // put info user for firebase:
                        // this.putUserInfoToFirebase(data.id, data.name, data.avatarPath)
                        this.refreshToken();
                        this.signInWithCustomToken(data.id);
                    }, 1000);
                }
            } else if (this.props.errorCode == ErrorCode.USER_EXIST_TRY_LOGIN_FAIL) {
                this.showMessage(localizes("userProfileView.existMobile"));
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
                            title: 'Đăng ký',
                            visibleStage: false,
                            titleStyle: { color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightHeader
                        })}
                    </Header>
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        style={{ flex: 1 }}
                        keyboardShouldPersistTaps="handled"
                        ref={r => (this._container = r)}
                        scrollEnabled={this.state.enableScrollViewScroll}
                    >
                        <View style={{ flexGrow: 1 }}>
                            <View style={[commonStyles.viewCenter, { marginVertical: Constants.MARGIN_LARGE }]}>
                                <View style={[commonStyles.viewCenter, {
                                    width: 100,
                                    height: 100,
                                    backgroundColor: Colors.COLOR_PRIMARY_DARK,
                                    borderRadius: 50
                                }]}>
                                    <Image source={ic_logo_large} />
                                </View>
                            </View>
                            {/* Input form */}
                            <Form style={{ flex: 1, marginTop: Constants.MARGIN_X_LARGE, paddingVertical: Constants.PADDING_LARGE }}>
                                <View style={{ paddingHorizontal: Constants.PADDING_X_LARGE, marginBottom: Constants.MARGIN_LARGE }}>
                                    <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_MEDIUM, textAlign: "center" }]}>{localizes("register.noteRegister")}</Text>
                                </View>
                                {/* Full name */}
                                <TextInputCustom
                                    title={localizes("register.contactName")}
                                    refInput={input => (this.fullName = input)}
                                    isInputNormal={true}
                                    placeholder={localizes("userInfoView.fillFullName")}
                                    value={this.state.fullName}
                                    onChangeText={fullName => this.setState({ fullName })}
                                    onSubmitEditing={() => {
                                        this.dayOfBirth.focus();
                                        this._container.scrollTo({ x: 0, y: 50, animated: true });
                                    }}
                                    returnKeyType={"next"}
                                    {...(this.focusInput(this.state.fullName) ? { autoFocus: true } : null)}
                                    inputNormalStyle={{
                                        paddingVertical: Constants.PADDING_LARGE
                                    }}
                                />
                                {/* Day Of Birth */}
                                <View style={{ backgroundColor: Colors.COLOR_WHITE }}>
                                    <Text style={{
                                        fontSize: Fonts.FONT_SIZE_X_SMALL,
                                        marginLeft: Constants.MARGIN_X_LARGE,
                                        marginTop: Constants.MARGIN_12,
                                        color: Colors.COLOR_TEXT,
                                        marginBottom: 0,
                                        backgroundColor: Colors.COLOR_WHITE
                                    }}>
                                        {localizes("register.dayOfBirth")}
                                    </Text>
                                    <TextInputMask
                                        style={{
                                            color: Colors.COLOR_TEXT,
                                            fontSize: Fonts.FONT_SIZE_X_MEDIUM,
                                            height: 46,
                                            // width: "100%",
                                            marginHorizontal: Constants.MARGIN_LARGE + 4,
                                            backgroundColor: Colors.COLOR_WHITE,
                                            borderBottomWidth: 1, borderBottomColor: Colors.COLOR_BACKGROUND,
                                            // marginLeft: Constants.MARGIN_X_LARGE
                                        }}
                                        // title={localizes("register.dayOfBirth")}
                                        refInput={input => (this.dayOfBirth = input)}
                                        isInputNormal={true}
                                        placeholder={localizes("userInfoView.fillDayOfBirth")}
                                        value={this.state.dayOfBirth}
                                        onChangeText={dayOfBirth => this.setState({ dayOfBirth })}
                                        onSubmitEditing={() => {
                                            // this.password.focus();
                                            this._container.scrollTo({ x: 0, y: 100, animated: true });
                                        }}
                                        hrEnable={true}
                                        keyboardType="phone-pad"
                                        returnKeyType={"next"}
                                        blurOnSubmit={false} //focus textinput
                                        onFocus={() => this.showCalendarDate()}
                                        // inputNormalStyle={{
                                        //     paddingVertical: Constants.PADDING_LARGE
                                        // }}
                                        type={'datetime'}
                                        options={{
                                            format: 'DD/MM/YYYY'
                                        }}
                                    />
                                </View>
                                {/*Password*/}
                                <View style={{ justifyContent: "center", position: "relative" }}>
                                    <TextInputCustom
                                        title={localizes("register.password")}
                                        refInput={input => {
                                            this.password = input;
                                        }}
                                        isInputNormal={true}
                                        placeholder={localizes("register.enterPassword")}
                                        value={this.state.password}
                                        onChangeText={password => this.setState({ password })}
                                        onSubmitEditing={() => {
                                            this.password.focus();
                                            this._container.scrollTo({ x: 0, y: 150, animated: true });
                                        }}
                                        returnKeyType={"next"}
                                        blurOnSubmit={false}
                                        numberOfLines={1}
                                        secureTextEntry={this.state.hidePassword}
                                        inputNormalStyle={{
                                            paddingVertical: Constants.PADDING_LARGE,
                                            paddingRight: Constants.PICKER_HEIGHT,
                                        }}
                                    />
                                    <TouchableHighlight
                                        onPress={this.managePasswordVisibility}
                                        style={[
                                            commonStyles.shadowOffset,
                                            {
                                                position: "absolute",
                                                padding: Constants.PADDING_LARGE,
                                                paddingTop: Constants.PADDING_XX_LARGE + Constants.PADDING,
                                                right: Constants.PADDING_LARGE
                                            }
                                        ]}
                                        underlayColor="transparent"
                                    >
                                        <Image
                                            style={{ opacity: 0.5 }}
                                            source={this.state.hidePassword ? ic_lock_grey : ic_unlock_grey} />
                                    </TouchableHighlight>
                                </View>
                                {/* Confirm password */}
                                <View style={{ justifyContent: "center", position: "relative" }}>
                                    <TextInputCustom
                                        title={localizes("register.titleConfirmPass")}
                                        refInput={input => {
                                            this.confirmPassword = input;
                                        }}
                                        isInputNormal={true}
                                        placeholder={localizes("register.confirmPass")}
                                        value={this.state.repeatPassword}
                                        onChangeText={repeatPassword => this.setState({ repeatPassword })}
                                        onSubmitEditing={Keyboard.dismiss}
                                        returnKeyType={"next"}
                                        blurOnSubmit={false}
                                        numberOfLines={1}
                                        secureTextEntry={this.state.hidePasswordConfirm}
                                        inputNormalStyle={{
                                            paddingVertical: Constants.PADDING_LARGE,
                                            paddingRight: Constants.PICKER_HEIGHT,
                                        }}
                                        hrEnable={false}
                                    />
                                    <TouchableHighlight
                                        onPress={this.manageConfirmPasswordVisibility}
                                        style={[
                                            commonStyles.shadowOffset,
                                            {
                                                position: "absolute",
                                                padding: Constants.PADDING_LARGE,
                                                paddingTop: Constants.PADDING_XX_LARGE + Constants.PADDING,
                                                right: Constants.PADDING_LARGE
                                            }
                                        ]}
                                        underlayColor="transparent"
                                    >
                                        <Image
                                            style={{ opacity: 0.5 }}
                                            source={this.state.hidePasswordConfirm ? ic_lock_grey : ic_unlock_grey} />
                                    </TouchableHighlight>
                                </View>
                                {/* </View> */}
                                {/* Register */}
                                <View style={{ flex: 1, justifyContent: "flex-end", paddingBottom: Constants.PADDING_X_LARGE * 3 }}>
                                    {this.renderCommonButton(
                                        localizes("register.register_button"),
                                        { color: Colors.COLOR_WHITE },
                                        { marginHorizontal: Constants.MARGIN_X_LARGE },
                                        () => {
                                            this.onPressCommonButton();
                                        }
                                    )}
                                </View>
                            </Form>
                        </View>
                    </ScrollView>
                    <CalendarScreen
                        maximumDate={new Date(new Date().setDate(DateUtil.now().getDate() - 1))}
                        dateCurrent={this.today}
                        chooseDate={this.chooseDate.bind(this)}
                        ref={ref => (this.showCalendar = ref)}
                    />
                    {this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    /**
     * Show calendar date
     */
    showCalendarDate() {
        this.showCalendar.showDateTimePicker();
    }

    /**
     * Date press
     */
    chooseDate(day) {
        this.setState({
            dayOfBirth: DateUtil.convertFromFormatToFormat(day, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE)
        });
    }

    /**
     * Manage Password Visibility
     */
    managePasswordVisibility = () => {
        // function used to change password visibility
        let last = this.state.password;
        this.setState({ hidePassword: !this.state.hidePassword, password: "" });
        setTimeout(() => {
            this.setState({ password: last });
        }, 0);
    };

    /**
     * Manage Confirm Password Visibility
     */
    manageConfirmPasswordVisibility = () => {
        // function used to change password visibility
        let last = this.state.confirmPassword;
        this.setState({ hidePasswordConfirm: !this.state.hidePasswordConfirm, confirmPassword: "" });
        setTimeout(() => {
            this.setState({ confirmPassword: last });
        }, 0);
    };

    /**
     * Register
     */
    onPressCommonButton() {
        this.validateAndSignUp();
    }
}

const styless = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    welcome: {
        fontSize: 20,
        textAlign: "center",
        margin: 10
    },
    instructions: {
        fontSize: 12,
        textAlign: "center",
        color: "#888",
        marginTop: 5,
        backgroundColor: "transparent"
    },
    data: {
        padding: 15,
        marginTop: 10,
        backgroundColor: "#000",
        borderColor: "#888",
        borderWidth: 1 / PixelRatio.get(),
        color: "#777"
    }
});

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
)(ConfirmRegisterView);
