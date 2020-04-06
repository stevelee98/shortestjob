import React, { Component } from 'react';
import { SafeAreaView, TouchableOpacity, View, Image, Text, Dimensions, Platform, Keyboard, BackHandler } from "react-native";
import { Constants } from 'values/constants';
import { Colors } from 'values/colors';
import StorageUtil from 'utils/storageUtil';
import global from 'utils/global';
import BaseView from 'containers/base/baseView';
import Utils from 'utils/utils';
import firebase from 'react-native-firebase';
import StringUtil from 'utils/stringUtil';
import styles from './styles';

const screen = Dimensions.get("window");

export default class MagicTabBar extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            styleBar: {
                minHeight: 54,
                opacity: 1
            }
        };
        this.userInfo = null
        this.route = {
            name: "",
            params: {}
        }
    }

    componentDidMount() {
        this.getProfile()
        if (Platform.OS === 'android') {
            this.keyboardEventListeners = [
                Keyboard.addListener('keyboardDidShow', this.handleStyle({ minHeight: 0, opacity: 0 })),
                Keyboard.addListener('keyboardDidHide', this.handleStyle({ minHeight: 54, opacity: 1 }))
            ];
        }
    }

    componentWillUnmount() {
        this.keyboardEventListeners && this.keyboardEventListeners.forEach((eventListener) => eventListener.remove());
    }

    handleStyle = style => () => this.setState({ styleBar: style });

    /**
     * Get profile user
     */
    getProfile() {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then((user) => {
            //this callback is executed when your Promise is resolved
            if (!Utils.isNull(user)) {
                this.userInfo = user
            }
        }).catch((error) => { })
    }

    render() {
        const { styleBar } = this.state;
        const { style, navigation, activeTintColor, inactiveTintColor, renderIcon, jumpTo } = this.props;
        const {
            index,
            routes
        } = navigation.state;
        return (
            <SafeAreaView
                pointerEvents="box-none"
                style={[Styles.container, styleBar]}
                forceInset={{
                    top: 'never',
                    bottom: 'always',
                }}
            >
                <SafeAreaView
                    style={[Styles.fakeBackground, style]}
                    forceInset={{
                        top: 'never',
                        bottom: 'always',
                    }}
                >
                    <View style={{ height: styleBar.minHeight }} />
                </SafeAreaView>
                <View pointerEvents="box-none" style={Styles.content}>
                    {
                        routes.map((route, idx) => {
                            const focused = index === idx;
                            if (!route.params || !route.params.navigationDisabled) {
                                return (
                                    <View style={{ flex: 1 }} key={idx}>
                                        {this.tabIcon(
                                            route,
                                            renderIcon,
                                            focused,
                                            activeTintColor,
                                            inactiveTintColor,
                                            () => (!route.params || !route.params.navigationDisabled) && jumpTo(route.key)
                                        )}
                                    </View>
                                );
                            }

                            const Icon = renderIcon({
                                route,
                                focused,
                                tintColor: focused
                                    ? activeTintColor
                                    : inactiveTintColor
                            });

                            return {
                                ...Icon,
                                key: 'simple'
                            };
                        })
                    }
                </View>
            </SafeAreaView>
        );
    }

    tabIcon = (route, renderIcon, focused, activeTintColor, inactiveTintColor, onPress) => {
        return (
            <TouchableOpacity
                style={Styles.tabStyle}
                onPress={() => !Utils.isNull(this.userInfo)
                    ? onPress && onPress()
                    : route.routeName != "ListChat" && route.routeName != "Notification" && route.routeName != "Profile"
                        ? onPress && onPress()
                        : this.gotoLogin(route)
                }
            >
                {
                    renderIcon({
                        route,
                        focused,
                        tintColor: focused
                            ? activeTintColor
                            : inactiveTintColor
                    })
                }
            </TouchableOpacity>
        )
    }

    /**
     * Go to login screen
     */
    gotoLogin = (route) => {
        this.route.name = route.routeName
        this.props.navigation.navigate("Login", {
            router: this.route
        })
    }
}

const Styles = {
    container: {
        position: 'relative',
        bottom: 0,
        width: '100%',
        justifyContent: 'flex-end'
    },
    fakeBackground: {
        position: 'absolute',
        width: '100%',
        backgroundColor: Colors.COLOR_WHITE
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    tabStyle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
};