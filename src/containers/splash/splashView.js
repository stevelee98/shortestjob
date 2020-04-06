import React, { Component } from "react";
import { FlatList, Picker, ScrollView, Dimensions, ImageBackground, View, StatusBar, StyleSheet, Alert, Animated, Easing } from "react-native";
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text, Card, CardItem, Image } from "native-base";
import { Colors } from "values/colors";
import BaseView from "containers/base/baseView";
import StorageUtil from "utils/storageUtil";
import Utils from 'utils/utils';
import { StackActions, NavigationActions } from 'react-navigation';
import statusType from "enum/statusType";
import * as actions from 'actions/userActions';
import { connect } from 'react-redux';
import { ErrorCode } from "config/errorCode";
import { getActionSuccess, ActionEvent } from "actions/actionEvent";
import bannerType from "enum/bannerType";

class SplashView extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
        }
        this.animate = new Animated.Value(1)
    }

    render() {
        const animateStyle = this.animate.interpolate({
            inputRange: [0, 0],
            outputRange: [0.5, 1],
        })
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: `center`,
                    backgroundColor: Colors.COLOR_BACKGROUND
                }}>

                <Animated.Image
                    style={{
                        transform: [{
                            scale: animateStyle
                        }
                        ],
                        resizeMode: 'contain'
                    }}
                    source={require('images/ic_logo_splash.png')}
                />
            </View>
        );
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    handleData() {
        let data = this.props.userInfo
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_CONFIG)) {
                    this.configList = data
                    StorageUtil.storeItem(StorageUtil.MOBILE_CONFIG, this.configList)
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    componentWillMount() {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then((user) => {
            //this callback is executed when your Promise is resolved
            console.log('User in Splash', user)
            this.props.getConfig();
            let goHome = setTimeout(() => {
                this.goHomeScreen();
                clearTimeout(goHome);
            }, 3000);
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error: ' + error);
        });
    }

    componentDidMount() {
        Animated.timing(this.animate,
            {
                toValue: 1.5,
                duration: 2000,
            }
        ).start(() => {
            this.getToken()
        })
    }

    /**
    * Get token
    */
    getToken() {
        // this.props.getUserProfile(9);
        StorageUtil.retrieveItem(StorageUtil.USER_TOKEN).then((token) => {
            //this callback is executed when your Promise is resolved
            global.token = token
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error: ' + error);
        })
    }
}

const mapStateToProps = state => ({
    userInfo: state.home.data,
    isLoading: state.home.isLoading,
    error: state.home.error,
    errorCode: state.home.errorCode,
    action: state.home.action
});

const mapDispatchToProps = {
    ...actions
};

export default connect(mapStateToProps, mapDispatchToProps)(SplashView);