/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text, Button,
    View, TextInput, StatusBar
} from 'react-native';
import { capitalizeFirstLetter } from './src/utils/stringUtil';
import { Provider } from 'react-redux';
import * as actions from './src/actions';
import { connect } from 'react-redux';
import store from './src/store';
import { AppNavigator } from 'containers/navigation';
import { Root } from 'native-base';
import { MenuProvider } from 'react-native-popup-menu';
import { Constants } from 'values/constants';
import KeyboardManager from 'react-native-keyboard-manager';
import StorageUtil from 'utils/storageUtil';
import SplashScreen from 'react-native-splash-screen';
import { Colors } from 'values/colors';

export default class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoadedToken: false
        }
        Platform.OS === 'android' ? null : KeyboardManager.setEnable(false)
    }

    componentWillMount() {
        this.getToken();
    }

    /**
     * Get token
     */
    getToken() {
        StorageUtil.retrieveItem(StorageUtil.USER_TOKEN).then((token) => {
            //this callback is executed when your Promise is resolved
            global.token = token
            this.setState({ isLoadedToken: true });
            SplashScreen.hide();
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error: ' + error);
            //If case load token error then go to home always
            this.setState({ isLoadedToken: true });
            SplashScreen.hide();
        })
    }

    render() {
        StatusBar.setBackgroundColor(Colors.COLOR_PRIMARY, true);
        return (
            <Provider store={store}>
                <Root>
                    {this.state.isLoadedToken ? <MenuProvider customStyles={menuProviderStyles}>
                        <AppNavigator />
                    </MenuProvider> : <View style={{ backgroundColor: 'transparent' }} />}
                </Root>
            </Provider>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
    },
    menuProviderWrapper: {
        // padding: 0,
    },
    backdrop: {
        // backgroundColor: 'red',
        // opacity: 0.5,
    },
});

const menuProviderStyles = {
    // menuProviderWrapper: styles.menuProviderWrapper,
    // backdrop: styles.backdrop,
};

