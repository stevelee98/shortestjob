'use strict';
import React, { Component } from 'react';
import { View, TextInput, Image, StyleSheet, Text, ImageBackground, Alert, TouchableHighlight, TouchableOpacity, ToastAndroid, Platform, Keyboard, BackHandler } from 'react-native';
import { Container, Form, Content, Item, Input, Button, Right, ListItem, Radio, Left, Icon, Header } from 'native-base';
import ButtonComp from 'components/button';
import { capitalizeFirstLetter } from 'utils/stringUtil';
import styles from './styles';
import { localizes } from 'locales/i18n';
import BaseView from 'containers/base/baseView';
import commonStyles from 'styles/commonStyles';
import Dialog from 'components/dialog';
import I18n from 'react-native-i18n';
import { Colors } from 'values/colors'
import * as actions from 'actions/userActions';
import { connect } from 'react-redux';
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import StorageUtil from 'utils/storageUtil';
import { Constants } from 'values/constants';
import Utils from "utils/utils";
import ic_lock_white from 'images/ic_lock_white.png';
import ic_unlock_white from 'images/ic_unlock_white.png';
import ic_change_pass from 'images/ic_lock_grey.png';
import { StackActions, NavigationActions } from 'react-navigation';
import { LoginManager } from 'react-native-fbsdk';
import { GoogleSignin } from 'react-native-google-signin';

const resetAction = StackActions.reset({
    index: 1,
    actions: [
        NavigationActions.navigate({ routeName: 'Main' }),
        NavigationActions.navigate({ routeName: 'Login' })
    ],

});

class SettingView extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            isAlertTwo: false,
            isAlertThree: false,
            itemSelected: 'one',
            isAlert: false, /**true if want to show introduction dialog's appearance */
            isEnableCountDown: false,/**Enable countdown time run */
            step: 0, /**0 is "30 Minutes Listening", 1 is "10 Minutes Writing" */
            oldPassView: '',
            newPassView: '',
            confirmPassView: '',
            hideOldPassword: true,
            hideNewPassword: true,
            hideNewPasswordConfirm: true,
            user: null,
        };
        this.hideOldPassword = true
        this.hideNewPassword = true
        this.hideNewPasswordConfirm = true
    };

    manageOldPasswordVisibility = () => {
        // function used to change password visibility
        let last = this.state.oldPassView
        this.setState({ hideOldPassword: !this.state.hideOldPassword, oldPassView: "" });
        setTimeout(() => {
            this.setState({ oldPassView: last })
        }, 0)
    }

    manageNewPasswordVisibility = () => {
        // function used to change password visibility
        let last = this.state.newPassView
        this.setState({ hideNewPassword: !this.state.hideNewPassword, newPassView: "" });
        setTimeout(() => {
            this.setState({ newPassView: last })
        }, 0)
    }

    manageNewPasswordConfirmVisibility = () => {
        let last = this.state.confirmPassView
        this.setState({ hideNewPasswordConfirm: !this.state.hideNewPasswordConfirm, confirmPassView: "" });
        setTimeout(() => {
            this.setState({ confirmPassView: last })
        }, 0)
    }


    changePass = () => {
        const { oldPassView, newPassView, confirmPassView } = this.state;
        if (oldPassView.length == 0) {
            { ToastAndroid.show(localizes('setting.enterOldPass'), ToastAndroid.LONG) }
        } else if (newPassView.length == 0) {
            { ToastAndroid.show(localizes('setting.enterNewPass'), ToastAndroid.LONG) }
        } else if (confirmPassView.length == 0) {
            { ToastAndroid.show(localizes('setting.enterConfPass'), ToastAndroid.LONG) }
        }
        else if (newPassView !== confirmPassView) {
            { ToastAndroid.show(localizes("register.vali_confirm_password"), ToastAndroid.LONG) }
            return false
        } else {
            this.props.changePass(oldPassView, newPassView);
            return true
        }
    }

    changeLaguageDialog = () => (
        <Dialog visible={this.state.isAlertTwo} style={commonStyles.title}
            title={I18n.t('setting').change_laguage}
            onTouchOutside={() => { this.setState({ isAlertTwo: false }) }}
            renderContent={
                () => {
                    return (
                        <View style={styles.horizontalView}>
                            <View style={[styles.viewVi, { borderBottomWidth: 1, borderBottomColor: Colors.COLOR_GREY }]}>
                                <Text style={[commonStyles.text, styles.textVi]}>{I18n.t('setting').vietnamese}</Text>
                                <Radio style={styles.radioCheck}
                                    onPress={
                                        () => {
                                            this.setState({ itemSelected: 'one' })
                                        }
                                    }
                                    selected={this.state.itemSelected == 'one'}
                                    color={Colors.COLOR_ORANGE}
                                    selectedColor={Colors.COLOR_ORANGE} />
                            </View>
                            <View style={styles.viewVi}>
                                <Text style={[commonStyles.text, styles.textVi]}>{I18n.t('setting').english}</Text>
                                <Radio style={styles.radioCheck}
                                    onPress={
                                        () => {
                                            this.setState({ itemSelected: 'two' })
                                        }
                                    }
                                    selected={this.state.itemSelected == 'two'}
                                    color={Colors.COLOR_ORANGE}
                                    selectedColor={Colors.COLOR_ORANGE} />
                            </View>
                            <View style={styles.btnChange}>
                                <TouchableOpacity
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    block style={[{ marginTop: 10, marginBottom: 10, marginRight: 10, backgroundColor: '#fff' }]} info
                                    onPress={
                                        () => {
                                            this.setState({ isAlertTwo: false })
                                        }
                                    }
                                >
                                    <Text
                                        style={[commonStyles.text, { color: Colors.COLOR_PRIMARY }]} >{I18n.t('setting').cancel}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                activeOpacity = {0.9}
                                block style={[{ marginTop: 10, marginBottom: 10, backgroundColor: '#fff' }]} info
                                    onPress={
                                        () => {
                                            if (this.state.itemSelected == 'one') {
                                                I18n.locale = 'vi'
                                                this.setState({
                                                    isAlertTwo: false,
                                                })
                                                this.goHomeScreen()
                                            } else if (this.state.itemSelected == 'two') {
                                                I18n.locale = 'en'
                                                this.setState({
                                                    isAlertTwo: false,
                                                })
                                                this.goHomeScreen()
                                            }
                                        }
                                    }
                                >
                                    <Text
                                        style={[commonStyles.text, { color: Colors.COLOR_PRIMARY }]} >{I18n.t('setting').agree}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }
            }

        >
        </Dialog>
    )

    /**
     * 
     */
    changePasswordDialog = () => (
        <Dialog visible={this.state.isAlert}
            title={I18n.t('setting').change_password}
            onTouchOutside={() => { this.setState({ isAlert: false }) }}
            renderContent={(show) => {
                return (
                    <View style={[styles.horizontalView]}>
                        <View style={styles.square} />
                        <View>
                            <Item style={{ paddingLeft: Constants.PADDING_LARGE, paddingRight: Constants.PADDING_LARGE }}>
                                <Input
                                    secureTextEntry={this.state.hideOldPassword}
                                    placeholder={I18n.t('setting').input_password}
                                    onChangeText={
                                        (text) => {
                                            this.setState({ oldPassView: text })
                                        }
                                    }
                                    onSubmitEditing={() => {
                                        this.newPass._root.focus();
                                    }}
                                    returnKeyType={"next"}
                                    blurOnSubmit={false}
                                    style={[commonStyles.text, commonStyles.text, { textAlignVertical: 'bottom', padding: 0, margin: 0 }]}
                                    value={this.state.oldPassView}
                                />
                                <TouchableHighlight style={{
                                    // padding: Constants.MARGIN_X_LARGE,
                                    margin: Constants.MARGIN_LARGE,
                                    marginBottom: -10,
                                    // alignItems:'flex-end'
                                }} onPress={() => {
                                    this.manageOldPasswordVisibility();
                                }}
                                    underlayColor='transparent'
                                >
                                    <Image style={{ alignItems: 'baseline', alignSelf: 'baseline', resizeMode: 'contain' }} source={this.state.hideOldPassword ? require("images/ic_lock_white.png") : require("images/ic_unlock_white.png")} />
                                </TouchableHighlight>
                            </Item>

                            <Item style={{ paddingLeft: Constants.PADDING_LARGE, paddingRight: Constants.PADDING_LARGE }}>
                                <Input secureTextEntry={this.state.hideNewPassword}
                                    placeholder={I18n.t('setting').input_new_password}
                                    onChangeText={
                                        (text) => {
                                            this.setState({ newPassView: text })
                                        }
                                    }
                                    ref={component => (this.newPass = component)}
                                    onSubmitEditing={() => {
                                        this.confirmPass._root.focus();
                                    }}
                                    returnKeyType={"next"}
                                    blurOnSubmit={false}
                                    style={[commonStyles.text, commonStyles.text, { textAlignVertical: 'bottom', padding: 0, margin: 0 }]}
                                    value={this.state.newPassView}
                                />
                                <TouchableHighlight style={{
                                    // padding: Constants.MARGIN_X_LARGE,
                                    margin: Constants.MARGIN_LARGE,
                                    marginBottom: -10,
                                }} onPress={() => {
                                    this.manageNewPasswordVisibility();
                                }}
                                    underlayColor='transparent'
                                >
                                    <Image style={{ alignItems: 'baseline', alignSelf: 'baseline', resizeMode: 'contain' }} source={this.state.hideNewPassword ? ic_lock_white : ic_unlock_white} />
                                </TouchableHighlight>
                            </Item>

                            <Item style={{ paddingLeft: Constants.PADDING_LARGE, paddingRight: Constants.PADDING_LARGE }}>
                                <Input secureTextEntry={this.state.hideNewPasswordConfirm}
                                    onChangeText={
                                        (text) => {
                                            this.setState({ confirmPassView: text })
                                        }
                                    }
                                    ref={component => (this.confirmPass = component)}
                                    style={[commonStyles.text, commonStyles.text, { textAlignVertical: 'bottom', padding: 0, margin: 0 }]}
                                    value={this.state.confirmPassView}
                                    placeholder={I18n.t('setting').repeat_new_password} />
                                <TouchableHighlight style={{
                                    // padding: Constants.MARGIN_X_LARGE,
                                    margin: Constants.MARGIN_LARGE,
                                    marginBottom: -10,
                                }} onPress={() => {
                                    this.manageNewPasswordConfirmVisibility();
                                }}
                                    underlayColor='transparent'
                                >
                                    <Image style={{ alignItems: 'baseline', alignSelf: 'baseline', resizeMode: 'contain' }} source={this.state.hideNewPasswordConfirm ? ic_lock_white : ic_unlock_white} />
                                </TouchableHighlight>
                            </Item>
                            <View style={styles.btnChange}>
                                <TouchableOpacity 
                                activeOpacity = {0.9}
                                block style={[{ marginTop: 10, marginBottom: 10, marginRight: 10, backgroundColor: '#fff' }]} info
                                    onPress={
                                        () => {
                                            this.setState({
                                                isAlert: false,
                                                oldPassView: '',
                                                newPassView: '',
                                                confirmPassView: '',
                                                hideOldPassword: true,
                                                hideNewPassword: true,
                                                hideNewPasswordConfirm: true,
                                            })
                                        }
                                    }
                                >
                                    <Text
                                        style={[commonStyles.text, { color: Colors.COLOR_PRIMARY }]} >{I18n.t('setting').cancel}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity = {0.9}
                                block style={[{ marginTop: 10, marginBottom: 10, backgroundColor: '#fff' }]} info
                                    onPress={
                                        () => {
                                            this.changePass()
                                            Keyboard.dismiss()
                                        }
                                    }
                                >
                                    <Text
                                        style={[commonStyles.text, { color: Colors.COLOR_PRIMARY }]} >{I18n.t('setting').agree}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {this.showLoadingBar(this.props.isLoading)}
                    </View>)
            }
            }
        >
        </Dialog>
    );

    logoutDialog = () => (
        <Dialog visible={this.state.isAlertThree} style={commonStyles.title}
            title={localizes('slidingMenu.want_out')}
            onTouchOutside={() => { this.setState({ isAlertThree: false }) }}
            renderContent={
                () => {
                    return (
                        <View style={styles.horizontalView}>
                            <View style={styles.btnChange}>
                                <TouchableOpacity activeOpacity = {0.9}
                                block style={[{ marginTop: 10, marginBottom: 10, marginRight: 10, backgroundColor: '#fff' }]} info
                                    onPress={
                                        () => {
                                            this.setState({ isAlertThree: false })
                                        }
                                    }
                                >
                                    <Text
                                        style={[commonStyles.text, { color: Colors.COLOR_PRIMARY }]} >{I18n.t('setting').cancel}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                activeOpacity = {0.9}
                                block style={[{ marginTop: 10, marginBottom: 10, backgroundColor: '#fff' }]} info
                                    onPress={
                                        () => {
                                            StorageUtil.deleteItem(StorageUtil.USER_PROFILE)
                                                .then(user => {
                                                    console.log("user setting", user);
                                                    if (Utils.isNull(user)) {
                                                        this.showMessage(localizes('setting.logoutSuccess'))
                                                        this.setState({ isAlertThree: false })
                                                        //this.goHomeScreen()
                                                        this.props.navigation.dispatch(resetAction)
                                                    } else {
                                                        this.showMessage(localizes('setting.logoutFail'))
                                                    }
                                                })
                                                .catch(error => {
                                                    console.log(error);
                                                });
                                            // sign out fb
                                            // LoginManager.logOut();
                                            // sign out gg
                                            // this.signOut();
                                        }
                                    }
                                >
                                    <Text
                                        style={[commonStyles.text, { color: Colors.COLOR_PRIMARY }]} >{I18n.t('setting').agree}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }
            }

        >
        </Dialog>
    )

    // signOut = async () => {
    //     try {
    //         await GoogleSignin.signOut();
    //     } catch (error){
    //         console.log(error)
    //     }
    // }

    // logOut = () => {
    //     Alert.alert (
    //             localizes('setting.log_out'),
    //         localizes('slidingMenu.want_out'),
    //         [

    //             { text: localizes('cancel'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
    //             { text: 'OK', 
    //                 onPress: () => 
    //                     {
    //                         StorageUtil.deleteItem(StorageUtil.USER_PROFILE)
    //                             .then(user => {
    //                                 console.log("user", user);
    //                                 if (user == undefined) {
    //                                     this.showMessage(localizes('setting.logoutSuccess'))
    //                                     this.props.navigation.push('Main');
    //                                 }
    //                                 else this.showMessage(localizes('setting.logoutFail'))
    //                             })
    //                             .catch(error => {
    //                                 console.log(error);
    //                             });
    //                     }
    //             },
    //         ],
    //         { cancelable: false }
    //     );
    // }

    componentDidMount() {
        this.getProfile()
    }

    getProfile() {
        // this.props.getUserProfile(9);
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE)
            .then(user => {
                //this callback is executed when your Promise is resolved
                console.log("user", user);
                if (!Utils.isNull(user)) {
                    this.setState({
                        user: user
                    });
                }
                // console.log('Hello hihi')
                // console.log(this.state.user.name)
            }).catch(error => {
                //this callback is executed when your Promise is rejected
                console.log("Promise is rejected with error: " + error);
            });
    }

    handleData() {
        let data = this.props.data
        if (data != null && this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS && data == true) {
                if (this.props.action == getActionSuccess(ActionEvent.CHANGE_PASS)) {
                    this.showMessage(localizes("setting.change_pass_success"));
                    this.setState({
                        isAlert: false,
                        oldPassView: '',
                        newPassView: '',
                        confirmPassView: '',
                        hideOldPassword: true,
                        hideNewPassword: true,
                        hideNewPasswordConfirm: true,
                    })
                }
            } else if (this.props.errorCode == ErrorCode.ERROR_SUCCESS && data == false) {
                if (this.props.action == getActionSuccess(ActionEvent.CHANGE_PASS)) {
                    { ToastAndroid.show(localizes('setting.oldPassFail'), ToastAndroid.LONG) }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    componentWillMount = () => {
        const deviceLocale = I18n.locale
        console.log("Ngon ngu", deviceLocale)
        if (deviceLocale == 'vi' || deviceLocale == 'vi-VN') {
            this.setState({
                itemSelected: 'one'
            })
        } else if (deviceLocale == 'en-US' || deviceLocale == 'en' || deviceLocale == 'en-UK') {
            this.setState({
                itemSelected: 'two'
            })
        }
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton)
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    handlerBackButton() {
        this.props.navigation.pop(1);
        return true;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData();
        }
    }

    render() {
        // I18n.locale = 'en' ? this.setState({itemSelected:'two'}) : this.setState({itemSelected:'one'})
        return (
            <Container style={{ backgroundColor: '#fff' }}>
                <Header style={{ backgroundColor: Colors.COLOR_PRIMARY }}>
                    {this.renderHeaderView({
                        title: localizes('slidingMenu.setting'),
                        visibleStage: false,
                    })}
                </Header>
                <Content contentContainerStyle={{ backgroundColor: '#fff' }}>

                    <View>

                        {/* <View style={{
                            flexDirection: 'row', backgroundColor: '#a1ff00', borderBottomColor: '#eeeeee',
                            borderBottomWidth: 1, 
                        }}>
                            <Button iconLeft style={styles.back}
                                block info  >
                                <Icon name='arrow-back' /> */}
                        {/*<Text style={[styles.title, { color: '#000' },]} >{I18n.t('setting').back}</Text>*/}
                        {/* </Button> */}
                        {/* <Text style={[styles.title, { color: '#000', marginTop: 9, marginLeft:12},]} >{I18n.t('setting').back}</Text> */}
                        {/* </View> */}

                        <Button style={[styles.submit, styles.child_submit]}
                            onPress={() => {
                                if (Utils.isNull(this.state.user)) {
                                    this.showLoginView()
                                }
                                else if (!Utils.isNull(this.state.user)) {
                                    this.setState({ isAlert: true })
                                }
                            }}
                            block info iconLeft>
                            <Image source={ic_change_pass} style={styles.icon} />
                            <Text style={[styles.text]} >{localizes('setting.change_password')}</Text>
                        </Button>

                        <Button style={[styles.submit, styles.child_submit]}
                            onPress={() => { this.setState({ isAlertTwo: true }) }}
                            block info iconLeft >
                            <Image source={ic_language} style={[styles.icon]} />
                            <Text style={styles.text}>{localizes('setting.language')}</Text>
                        </Button>

                        <Button style={[styles.submit, styles.child_submit, { borderBottomWidth: 0 }]}
                            onPress={() => { this.setState({ isAlertThree: true }) }}
                            block info iconLeft >
                            <Image source={ic_logout} style={styles.icon} />
                            <Text style={[styles.text]}>{localizes('setting.log_out')}</Text>
                        </Button>

                    </View>
                    {this.changePasswordDialog()}
                    {this.changeLaguageDialog()}
                    {this.logoutDialog()}
                </Content>
            </Container>
        )
    }

}

const mapStateToProps = state => ({
    data: state.changePass.data,
    action: state.changePass.action,
    isLoading: state.changePass.isLoading,
    error: state.changePass.error,
    errorCode: state.changePass.errorCode
});

export default connect(mapStateToProps, actions)(SettingView);

// export default SettingView;