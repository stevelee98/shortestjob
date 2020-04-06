"use strict";
import React, { Component } from "react";
import {
    View,
    TextInput,
    Image,
    StyleSheet,
    Text,
    ImageBackground,
    Alert,
    TouchableHighlight,
    TouchableOpacity,
    ToastAndroid,
    Platform,
    Keyboard,
    BackHandler
} from "react-native";
import { Container, Form, Content, Item, Input, Button, Right, ListItem, Radio, Left, Icon, Header, Root, Toast } from "native-base";
import styles from "./styles";
import { localizes } from "locales/i18n";
import BaseView from "containers/base/baseView";
import commonStyles from "styles/commonStyles";
import I18n from "react-native-i18n";
import { Colors } from "values/colors";
import * as actions from "actions/userActions";
import { connect } from "react-redux";
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import StorageUtil from "utils/storageUtil";
import { Constants } from "values/constants";
import Utils from "utils/utils";
import ic_lock_white from "images/ic_lock_white.png";
import { Fonts } from "values/fonts";
import ic_unlock_white from "images/ic_unlock_white.png";
import { StackActions, NavigationActions } from "react-navigation";
import TextInputCustom from "components/textInputCustom";
import DialogCustom from "components/dialogCustom";
import ic_lock_grey from "images/ic_lock_grey.png";
import ic_unlock_grey from "images/ic_unlock_grey.png";

class ChangePassword extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            oldPass: "",
            newPass: "",
            confirmPass: "",
            hideOldPassword: true,
            hideNewPassword: true,
            hideNewPasswordConfirm: true,
            isData: false,
            isAlertSuccess: false
        };
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    // Hide & show old password
    manageOldPasswordVisibility = () => {
        // function used to change password visibility
        let last = this.state.oldPass;
        this.setState({
            hideOldPassword: !this.state.hideOldPassword,
            oldPass: ""
        });
        setTimeout(() => {
            this.setState({
                oldPass: last
            });
        }, 0);
    };

    // Hide & show new password
    manageNewPasswordVisibility = () => {
        // function used to change password visibility
        let last = this.state.newPass;
        this.setState({
            hideNewPassword: !this.state.hideNewPassword,
            newPass: ""
        });
        setTimeout(() => {
            this.setState({
                newPass: last
            });
        }, 0);
    };

    // Hide & show confirm new password
    manageNewPasswordConfirmVisibility = () => {
        let last = this.state.confirmPass;
        this.setState({
            hideNewPasswordConfirm: !this.state.hideNewPasswordConfirm,
            confirmPass: ""
        });
        setTimeout(() => {
            this.setState({
                confirmPass: last
            });
        }, 0);
    };

    // On press change password
    onPressCommonButton = () => {
        let { oldPass, newPass, confirmPass } = this.state;
        if (oldPass.length == 0) {
            this.showMessage(localizes("setting.enterOldPass"));
            this.password.focus();
            return false;
        } else if (Utils.isNull(newPass)) {
            this.showMessage(localizes("setting.enterNewPass"));
            this.newPassword.focus();
            return false;
        }else if (Utils.isNull(confirmPass)) {
            this.showMessage(localizes("setting.enterConfPass"));
            this.confirmPassword.focus();
            return false;
        } else if (Utils.validateSpacesPass(newPass)) {
            this.showMessage(localizes("confirmPassword.vali_confirm_password"));
            this.newPassword.focus();
            return false;
        } else if (newPass !== confirmPass) {
            this.showMessage(localizes("register.vali_confirm_password"));
            this.confirmPassword.focus();
            return false;
        } else if (newPass.length < 5 || newPass.length >= 33) {
            this.showMessage(localizes("confirmPassword.vali_character_password"));
            this.newPassword.focus();
            return false;
        } else if (newPass.length == 0) {
            this.showMessage(localizes("setting.enterNewPass"));
            this.newPassword.focus();
            return false;
        } else if (confirmPass.length == 0) {
            this.showMessage(localizes("setting.enterConfPass"));
            this.confirmPassword.focus();
            return false;
        } else {
            this.props.changePass(oldPass, newPass);
            return true;
        }
    };

    handleData() {
        let data = this.props.data;
        console.log("Data pass", data);
        if (data != null && this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.CHANGE_PASS)) {
                    if (data) {
                        this.setState({
                            oldPass: "",
                            newPass: "",
                            confirmPass: "",
                            hideOldPassword: true,
                            hideNewPassword: true,
                            hideNewPasswordConfirm: true,
                            isAlertSuccess: true
                        });
                    } else {
                        this.showMessage(localizes("setting.oldPassFail"));
                        this.password.focus();
                    }
                }
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
                            title: localizes("setting.change_password"),
                            visibleStage: false,
                            titleStyle: { color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightHeader
                        })}
                    </Header>
                    <Content contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
                        <View style={{ flexGrow: 1 }}>
                            {/* {Input form} */}
                            <View
                                style={{
                                    backgroundColor: Colors.COLOR_WHITE,
                                    marginTop: Constants.MARGIN_X_LARGE
                                }}
                            >
                                <View
                                    style={{
                                        justifyContent: "center",
                                        position: "relative"
                                    }}
                                >
                                    <TextInputCustom
                                        title={localizes("setting.input_password")}
                                        refInput={ref => (this.password = ref)}
                                        isInputNormal={true}
                                        placeholder={localizes("setting.enterOldPass")}
                                        value={this.state.oldPass}
                                        secureTextEntry={this.state.hideOldPassword}
                                        onChangeText={text => {
                                            this.setState({
                                                oldPass: text
                                            });
                                        }}
                                        onSubmitEditing={() => {
                                            this.newPassword.focus();
                                        }}
                                        returnKeyType={"next"}
                                        inputNormalStyle={{
                                            paddingVertical: Constants.PADDING_LARGE,
                                            paddingRight: Constants.PICKER_HEIGHT,
                                        }}
                                    />
                                    <TouchableHighlight
                                        onPress={this.manageOldPasswordVisibility}
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
                                            source={this.state.hideOldPassword ? ic_lock_grey : ic_unlock_grey}
                                        />
                                    </TouchableHighlight>
                                </View>
                                {/* New password */}
                                <View
                                    style={{
                                        justifyContent: "center",
                                        position: "relative"
                                    }}
                                >
                                    <TextInputCustom
                                        title={localizes("setting.input_new_password")}
                                        refInput={ref => (this.newPassword = ref)}
                                        isInputNormal={true}
                                        placeholder={localizes("setting.enterNewPass")}
                                        value={this.state.newPass}
                                        underlineColorAndroid="transparent"
                                        secureTextEntry={this.state.hideNewPassword}
                                        onChangeText={text => {
                                            this.setState({
                                                newPass: text
                                            });
                                        }}
                                        onSubmitEditing={() => {
                                            this.confirmPassword.focus();
                                        }}
                                        returnKeyType={"next"}
                                        inputNormalStyle={{
                                            paddingVertical: Constants.PADDING_LARGE,
                                            paddingRight: Constants.PICKER_HEIGHT,
                                        }}
                                    />
                                    <TouchableHighlight
                                        onPress={this.manageNewPasswordVisibility}
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
                                            source={this.state.hideNewPassword ? ic_lock_grey : ic_unlock_grey}
                                        />
                                    </TouchableHighlight>
                                </View>

                                {/* Confirm new password */}
                                <View
                                    style={{
                                        justifyContent: "center",
                                        position: "relative"
                                    }}
                                >
                                    <TextInputCustom
                                        title={localizes("setting.repeat_new_password")}
                                        refInput={ref => (this.confirmPassword = ref)}
                                        borderBottomWidth={0}
                                        isInputNormal={true}
                                        placeholder={localizes("setting.enterConfPass")}
                                        value={this.state.confirmPass}
                                        onSubmitEditing={() => {
                                            Keyboard.dismiss();
                                        }}
                                        underlineColorAndroid="transparent"
                                        secureTextEntry={this.state.hideNewPasswordConfirm}
                                        onChangeText={text => {
                                            this.setState({
                                                confirmPass: text
                                            });
                                        }}
                                        returnKeyType={"done"}
                                        inputNormalStyle={{
                                            paddingVertical: Constants.PADDING_LARGE,
                                            paddingRight: Constants.PICKER_HEIGHT,
                                        }}
                                        hrEnable={false}
                                    />
                                    <TouchableHighlight
                                        onPress={this.manageNewPasswordConfirmVisibility}
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
                                                opacity: 0.5,
                                            }}
                                            source={this.state.hideNewPasswordConfirm ? ic_lock_grey : ic_unlock_grey}
                                        />
                                    </TouchableHighlight>
                                </View>
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: "flex-end",
                                    paddingBottom: Constants.PADDING_X_LARGE
                                }}
                            >
                                {/* Button change password */}
                                {this.renderCommonButton(
                                    localizes("forgot_password.titleChangePassword"),
                                    { color: Colors.COLOR_WHITE },
                                    { marginHorizontal: Constants.MARGIN_X_LARGE },
                                    () => {
                                        this.onPressCommonButton();
                                    },
                                    null
                                    //false, // isBtnLogOut
                                    //true // isBtnRegister
                                )}
                            </View>
                            {this.renderAlertSuccess()}
                        </View>
                    </Content>
                    {this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    /**
     * Render alert success
     */
    renderAlertSuccess() {
        return (
            <DialogCustom
                visible={this.state.isAlertSuccess}
                isVisibleTitle={true}
                isVisibleOneButton={true}
                isVisibleContentText={true}
                contentTitle={"Thông báo"}
                textBtn={"Ok"}
                contentText={localizes("setting.change_pass_success")}
                onPressBtn={() => {
                    this.setState({ isAlertSuccess: false });
                    this.props.navigation.goBack();
                }}
            />
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
)(ChangePassword);
