import React, { Component } from 'react';
import { View, Image, BackHandler } from 'react-native';
import { Container, Header, Content, Badge, Text, Icon } from 'native-base';
import BaseView from 'containers/base/baseView';
import global from 'utils/global'
import { Colors } from 'values/colors';
import { Fonts } from 'values/fonts';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
//Icon message
import ic_message_black from "images/ic_message_black.png";
import ic_message_white from "images/ic_message_white.png";
import Utils from 'utils/utils';
import ChatUnseenIcon from './chatUnseenIcon';

const WIDTH = 28
const HEIGHT = 20

class ChatButton extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    /**
     * Handler back button
     */
    handlerBackButton = () => {
        const { focused, navigation } = this.props;
        console.log(this.className, 'back pressed')
        if (focused && navigation) {
            console.log("NOTIFICATION")
            this.props.navigation.navigate('Home')
        } else {
            return false
        }
        return true
    }

    render() {
        const { focused, navigation } = this.props;
        if (focused) {
            console.log("RENDER NOTIFICATION BUTTON", navigation)
            this.className = navigation.state.routeName
        }
        return (
            <View>
                <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                        resizeMode={'contain'}
                        style={{ tintColor: focused ? Colors.COLOR_PRIMARY : Colors.COLOR_DRK_GREY }}
                        source={focused ? ic_message_black : ic_message_white}
                        tintColor={focused ? Colors.COLOR_PRIMARY : Colors.COLOR_DRK_GREY}
                    />
                    <Text style={[{
                        color: focused ? Colors.COLOR_PRIMARY : Colors.COLOR_DRK_GREY,
                        textAlign: 'center',
                        fontSize: Fonts.FONT_SIZE_X_SMALL
                    }]}>Tin nhắn</Text>
                </View>
                <ChatUnseenIcon top={0} right={0} />
            </View>
        );
    }
}

export default ChatButton;
