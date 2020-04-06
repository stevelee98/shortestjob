"use strict";
import React, { Component } from "react";
import { View, TextInput, Image, StyleSheet, Text, ImageBackground, TouchableOpacity, TouchableHighlight, Keyboard, ScrollView } from "react-native";
import { Container, Form, Content, Item, Input, Button, Right, Icon, Header, Root, Left, Body, Title, Toast } from "native-base";
import ButtonComp from "components/button";
import StringUtil from "utils/stringUtil";
import styles from "./styles";
import { localizes } from "locales/i18n";
import BaseView from "containers/base/baseView";
import * as actions from "actions/userActions";
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
import GenderType from "enum/genderType";
import { StackActions } from "react-navigation";
import ic_facebook from "images/ic_facebook.png";
import ic_google_plus from "images/ic_google_plus.png";
import statusType from "enum/statusType";
import screenType from "enum/screenType";
import TextInputCustom from "components/textInputCustom";
import ic_logo_large from "images/ic_logo_large.png";

class ConfirmPasswordView extends BaseView {
    constructor() {
        super();
        this.state = {
            hideNewPassword: true,
            hideRetypePassword: true,
            newPass: "",
            retypePass: ""
        };
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
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS && data == true) {
                if (this.props.action == getActionSuccess(ActionEvent.CHANGE_PASS)) {
                    if (data) {
                        this.showMessage(localizes("setting.change_pass_success"));
                        this.props.navigation.goBack();
                        this.props.navigation.navigate("Login");
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    // On press change password
    onPressUpdatePass = () => {
        let { newPass, retypePass } = this.state;
        const { phone } = this.props.navigation.state.params;
        if (newPass == "") {
            this.showMessage(localizes("confirmPassword.enterNewPass"));
            this.newPass.focus();
            return false;
        } else if (newPass !== retypePass) {
            this.showMessage(localizes("register.vali_confirm_password"));
            this.retypePass.focus();
            return false;
        } else if (newPass.length < 5 || newPass.length >= 33) {
            this.showMessage(localizes("confirmPassword.vali_character_password"));
            this.newPass.focus();
            return false;
        } else if (retypePass == "") {
            this.showMessage(localizes("confirmPassword.vali_fill_repeat_password"));
            this.retypePass.focus();
            return false;
        } else if (Utils.validateSpacesPass(newPass)) {
            this.showMessage(localizes("register.vali_pass_right"));
            this.newPass.focus();
            return false;
        } else {
            this.props.changePass("", newPass, phone, screenType.FROM_FORGET_PASSWORD);
            return true;
        }
    };

    render() {
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header, { backgroundColor: Colors.COLOR_PRIMARY }]}>
                        {this.renderHeaderView({
                            title: localizes("forgot_password.confirmPass"),
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
                            <Form
                                style={{
                                    flex: 1,
                                    marginTop: Constants.MARGIN_X_LARGE
                                }}
                            >
                                <View style={{ padding: Constants.PADDING_X_LARGE }}>
                                    <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_MEDIUM, marginHorizontal: Constants.MARGIN_XX_LARGE, textAlign: "center" }]}>
                                        {localizes("forgot_password.noteChangePassword")}
                                    </Text>
                                </View>
                                {/* Password */}
                                <View style={{ justifyContent: "center", position: "relative" }}>
                                    <TextInputCustom
                                        title={localizes("setting.input_new_password")}
                                        refInput={ref => (this.newPass = ref)}
                                        isInputNormal={true}
                                        placeholder={localizes("forgot_password.input_newPass")}
                                        value={this.state.newPass}
                                        secureTextEntry={this.state.hideNewPassword}
                                        onChangeText={newPass => {
                                            this.setState({
                                                newPass
                                            });
                                        }}
                                        onSelectionChange={({ nativeEvent: { selection } }) => {
                                            console.log(this.className, selection);
                                        }}
                                        returnKeyType={"next"}
                                        onSubmitEditing={() => {
                                            this.retypePass.focus();
                                        }}
                                        inputNormalStyle={{
                                            paddingVertical: Constants.PADDING_LARGE,
                                            paddingRight: Constants.PICKER_HEIGHT,
                                        }}
                                    />
                                    <TouchableHighlight
                                        onPress={() => {
                                            this.setState({ hideNewPassword: !this.state.hideNewPassword });
                                        }}
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
                                            source={this.state.hideNewPassword ? ic_lock_grey : ic_unlock_grey} />
                                    </TouchableHighlight>
                                </View>
                                {/* Confirm password */}
                                <View style={{ justifyContent: "center", position: "relative" }}>
                                    <TextInputCustom
                                        title={localizes("forgot_password.confirmPass")}
                                        refInput={ref => (this.retypePass = ref)}
                                        isInputNormal={true}
                                        placeholder={localizes("forgot_password.confirmPass")}
                                        value={this.state.retypePass}
                                        secureTextEntry={this.state.hideRetypePassword}
                                        onChangeText={retypePass => {
                                            this.setState({
                                                retypePass
                                            });
                                        }}
                                        onSelectionChange={({ nativeEvent: { selection } }) => {
                                            console.log(this.className, selection);
                                        }}
                                        returnKeyType={"done"}
                                        onSubmitEditing={() => {
                                            Keyboard.dismiss();
                                        }}
                                        inputNormalStyle={{
                                            paddingVertical: Constants.PADDING_LARGE,
                                            paddingRight: Constants.PICKER_HEIGHT,
                                        }}
                                        hrEnable={false}
                                    />
                                    <TouchableHighlight
                                        onPress={() => {
                                            this.setState({ hideRetypePassword: !this.state.hideRetypePassword });
                                        }}
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
                                            style={{
                                                flex: 1,
                                                flexDirection: "column",
                                                justifyContent: "flex-end",
                                                resizeMode: "contain",
                                                opacity: 0.5
                                            }}
                                            source={this.state.hideRetypePassword ? ic_lock_grey : ic_unlock_grey} />
                                    </TouchableHighlight>
                                </View>
                                <View style={{ flex: 1, justifyContent: "flex-end", marginVertical: Constants.MARGIN_X_LARGE }}>
                                    {/* Button change password */}
                                    {this.renderCommonButton(
                                        localizes("forgot_password.btnChangePass"),
                                        { color: Colors.COLOR_WHITE },
                                        { marginHorizontal: Constants.MARGIN_X_LARGE },
                                        () => {
                                            this.onPressUpdatePass();
                                        }
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
}

const mapStateToProps = state => ({
    data: state.changePass.data,
    action: state.changePass.action,
    isLoading: state.changePass.isLoading,
    error: state.changePass.error,
    errorCode: state.changePass.errorCode
});

export default connect(
    mapStateToProps,
    actions
)(ConfirmPasswordView);
