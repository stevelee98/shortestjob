'use strict';
import React, { Component } from 'react';
import { Dimensions, View, TextInput, Image, StyleSheet, Text, ImageBackground, Platform, TouchableOpacity, Keyboard, ToastAndroid, ScrollView, Modal,BackHandler,WebView } from 'react-native';
import { Container, Form, Content, Input, Button, Right, Radio, center, ListItem, Left, Header, Item, Picker,Body, Root } from 'native-base';
import ButtonComp from 'components/button';
import { capitalizeFirstLetter } from 'utils/stringUtil';
import styles from './styles';
import { localizes } from 'locales/i18n';
import BaseView from 'containers/base/baseView';
import commonStyles from 'styles/commonStyles';
import I18n from 'react-native-i18n';
import { Colors } from 'values/colors';
import { Fonts } from 'values/fonts';
import { CheckBox } from 'react-native-elements'
import { Constants } from 'values/constants'
import { Icon } from 'react-native-elements';
import index from '../../../reducers';
import Utils from 'utils/utils';
import ic_back_white from 'images/ic_back_white.png'
import ModalDropdown from 'components/modalDropdown'
import Autocomplete from 'components/autocomplete';
import { connect } from 'react-redux';
import StorageUtil from 'utils/storageUtil';
import { ErrorCode } from 'config/errorCode';
import { getActionSuccess, ActionEvent } from 'actions/actionEvent';
import * as actions from 'actions/userActions'
import GenderType from 'enum/genderType';
import ic_logo_tumlum from 'images/ic_lock_white.png'
import StringUtil from "utils/stringUtil";

class MakeSuggestionsView extends BaseView{
    constructor(props){
        super(props)
        this.state = {
            enableScrollViewScroll: true,
            email:'',
            fullName:'',
            content:'',
            mobile:'',
            userId:'',
            user: null,
            reCaptcha: StringUtil.randomString(6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'),
            enter_captcha:''
        }
    }

    componentWillMount() {
        this.getProfile();
        BackHandler.addEventListener('hardwareBackPress',this.handlerBackButton)
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    handlerBackButton(){
        this.props.navigation.pop(1);
        return true;
    }

    handleData() {
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.MAKE_SUGGESTIONS)) {
                    this.showMessage(localizes('makeSuggestion.sendInformation'))
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    /**
     * Get profile
     */
    getProfile = ()=> {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then((user) => {
            //this callback is executed when your Promise is resolved
            console.log('user', user)
            if (!Utils.isNull(user)) {
                this.setState({
                    user: user,
                    email:user.email,
                    fullName:user.name,
                    mobile:user.mobilePhone,
                    userId:user.id          
                });
            }
            console.log(this.state.userId)
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error: ' + error);
        });
    }

    onPressCommonButton = ()=> {
        const {email, fullName, content,mobile,enter_captcha} = this.state
        if(fullName.trim() == "" || fullName == null){
            this.showMessage(localizes('register.vali_fill_fullname'))         
        } else if(email.trim() == "" || email == null){
            this.showMessage(localizes('register.vali_fill_email'))
        } else if(!Utils.validateEmail(email)){
            this.showMessage(localizes('register.vali_email'))
        } else if(mobile == null || mobile.trim() == ""){
            this.showMessage(localizes('register.vali_phone'))
        } else if(!mobile.replace(/[^0-9]/g,"")){
                this.showMessage(localizes('userProfileView.enter_num'))
        } else if(content.trim() == ""){
            this.showMessage(localizes('makeSuggestion.fillContent'))
        } else if(enter_captcha.length == 0){
            this.showMessage(localizes('makeSuggestion.pleaseEnterCaptcha'))
        }else if(enter_captcha != this.state.reCaptcha){
            this.showMessage(localizes('makeSuggestion.notMatchCapcha'))
        }else {
            let dataPost = {
                name:fullName,
                email:email,
                phone:mobile,
                message:content,
                userId:this.state.userId
            }
            this.props.makeSuggestions(dataPost)
            this.setState({
                content:'',
                enter_captcha:'',
                reCaptcha:StringUtil.randomString(6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')
            })
            Keyboard.dismiss()
        }
    }

    render(){
        return(
            
            <Container>
            <Root>
                <Header style={[{ backgroundColor: Colors.COLOR_PRIMARY, borderBottomWidth: 0 }]}>
                    {this.renderHeaderView({
                        visibleStage: false,
                        title: localizes("makeSuggestion.suggestionBox")
                    })}
                </Header>

                <View style={{ flex: 1, backgroundColor: "#fff" }}
                    onStartShouldSetResponderCapture={() => {
                        this.setState({ enableScrollViewScroll: true });
                    }}
                >
                    <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }}
                        contentContainerStyle={{ flexGrow: 1, backgroundColor: "#fff" }}
                        scrollEnabled={this.state.enableScrollViewScroll}
                    >
                        <Text style={{...commonStyles.text,fontSize:Fonts.FONT_SIZE_LARGE,textAlign:'center',marginTop:Constants.MARGIN_LARGE,marginBottom:Constants.MARGIN_LARGE}}>{localizes('makeSuggestion.anyQuestion')}</Text>
                        <Form style={[{ marginLeft: 20, marginRight: 20, backgroundColor: "#fff" }]}>
                            {/* Full name */}
                            <Item style={styles.itemInputStyle}>
                                <Input style={styles.inputFullname} 
                                onChangeText = {
                                    (text)=>{
                                        this.setState({
                                            fullName:text
                                        })
                                    }
                                }
                                onSubmitEditing={() => {
                                    this.email._root.focus();
                                }}
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                value={this.state.fullName}
                                placeholderTextColor={Colors.COLOR_TEXT_HOLDER} 
                                placeholder={localizes("register.input_fullname")} />
                            </Item>
                            {/* {Email} */}
                            <Item style={styles.itemInputStyle}>
                                <Input style={[styles.inputEmail]}
                                onChangeText = {
                                    (text)=>{
                                        this.setState({
                                            email:text
                                        })
                                    }
                                }
                                ref={component => (this.email = component)}
                                onSubmitEditing={() => {
                                    this.phone._root.focus();
                                }}
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                value={this.state.email}
                                placeholderTextColor={Colors.COLOR_TEXT_HOLDER} 
                                placeholder={localizes("register.input_email")} />
                            </Item>
                            {/* {Phone} */}
                            <Item style={styles.itemInputStyle}>
                                <Input style={styles.inputTelephone}
                                onChangeText = {
                                    (text)=>{
                                        this.setState({
                                            mobile:text
                                        })
                                    }
                                }
                                ref={(input)=>{this.phone = input}}
                                onSubmitEditing={() => {
                                    this.content._root.focus();
                                }}
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                value={this.state.mobile}
                                placeholderTextColor={Colors.COLOR_TEXT_HOLDER} keyboardType="numeric" 
                                placeholder={localizes("register.input_phone_number")} />
                            </Item>
                            {/* {Content} */}
                            <Item style={[styles.itemInputStyle]}>
                                <Input style={[styles.inputContent,{height: 40}]}
                                onChangeText = {
                                    (text)=>{
                                        this.setState({
                                            content:text
                                        })
                                    }
                                }
                                ref={(input)=>{this.content = input}}
                                // onSubmitEditing={()=>{this.content.focus()}}
                                value={this.state.content}
                                 placeholderTextColor={Colors.COLOR_TEXT_HOLDER}
                                 placeholder={localizes('makeSuggestion.content')}
                                 multiline = {true}
                                 underlineColorAndroid='rgba(0,0,0,0)'
                                numberOfLines = {3}/>
                            </Item>   
                            <Item style={[styles.itemInputStyle]}>
                                <Input
                                    style={[styles.inputCaptcha,{flex:1}]}
                                    onChangeText = {
                                        (text)=>{
                                            this.setState({
                                                enter_captcha:text
                                            })
                                        }
                                    }
                                    placeholder={localizes('makeSuggestion.enterCapcha')}
                                    value={this.state.enter_captcha}
                                >
                                </Input>
                                <TouchableOpacity
                                    onPress={
                                        ()=> {
                                            this.setState({
                                                reCaptcha:StringUtil.randomString(6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')
                                            })
                                        }
                                        
                                    }
                                    style={{flex:1}}
                                >
                                    <Text style={{textAlign:'center',fontSize:8*2.5,fontStyle:'italic',textAlignVertical:'bottom'}}>{this.state.reCaptcha}</Text>
                                </TouchableOpacity>  
                            </Item>
                            
                            {/* Register */}
                            {this.renderCommonButton(
                                localizes("makeSuggestion.send"),
                                { color: "#fff" },
                                {
                                    ...styles.buttonLogin,
                                    marginTop: Constants.MARGIN_LARGE
                                }, 
                                () => this.onPressCommonButton()
                            )}
                        </Form>
                        {/* <View>
                            <Image source={ic_logo_tumlum} style={{width:15, height:15,paddingRight:20,paddingLeft:20}}></Image>
                        </View> */}
                    </ScrollView> 
                </View>
                {this.showLoadingBar(this.props.isLoading)}
                </Root>
                {/* {this.showLoadingBar(this.props.isLoading)} */}
            </Container> 
        )
    }
}

const mapStateToProps = state => ({
    data: state.makeSuggestions.data,
    isLoading: state.makeSuggestions.isLoading,
    error: state.makeSuggestions.error,
    errorCode: state.makeSuggestions.errorCode,
    action: state.makeSuggestions.action
});

export default connect(mapStateToProps, actions)(MakeSuggestionsView)