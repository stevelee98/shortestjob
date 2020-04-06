
import React, { Component } from 'react';
import { View, Image, BackHandler, Platform, TouchableOpacity } from 'react-native';
import { Container, Header, Content, Badge, Text, Icon } from 'native-base';
import BaseView from 'containers/base/baseView';
import { Colors } from 'values/colors';
import { Fonts } from 'values/fonts';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
import StorageUtil from 'utils/storageUtil';
import firebase from 'react-native-firebase';
import Utils from 'utils/utils';
import StringUtil from 'utils/stringUtil';

class ChatUnseenIcon extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            unseen: 0
        };
        this.heightStatusBar = (Platform.OS === 'ios') ? Constants.STATUS_BAR_HEIGHT : 10;
    }

    componentDidMount() {
        this.handleUnseen()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps != this.props) {
            this.handleUnseen()
        }
    }

    /**
     * Handle number unseen
     */
    handleUnseen() {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            if (!Utils.isNull(user)) {
                try {
                    firebase.database().ref(`chats_by_user/u${user.id}/number_of_unseen_messages`)
                        .on('value', (unseen) => {
                            if (Utils.isNull(unseen.val())) {
                                this.setState({
                                    unseen: 0
                                })
                            } else {
                                this.setState({
                                    unseen: unseen.val()
                                })
                            }
                        })
                } catch (error) {
                    console.log("ERROR GET UNSEEN BASEVIEW: ", error)
                }
            } else {
                this.setState({
                    unseen: 0
                })
            }
        }).catch(error => {
            //this callback is executed when your Promise is rejected
            console.log("Promise is rejected with error: " + error);
        });
    }

    render() {
        const { bottom, right } = this.props;
        const WIDTH = Utils.getLength(parseInt(this.state.unseen)) < 2 ? 20 : 28
        const HEIGHT = 20
        const RIGHT = this.state.unseen > 10 ? right - 4 : right
        const BOTTOM = bottom
        return (
            this.state.unseen > 0
                ?
                <View style={[commonStyles.viewCenter, {
                    position: 'absolute',
                    right: RIGHT,
                    bottom: BOTTOM,
                    height: HEIGHT,
                    width: WIDTH,
                    backgroundColor: Colors.COLOR_RED,
                    borderRadius: HEIGHT / 2,
                    borderColor: Colors.COLOR_WHITE,
                    borderWidth: 1,
                }]}>
                    <Text style={[commonStyles.textSmall, {
                        color: 'white',
                        margin: 0
                    }]}>{this.state.unseen}</Text>
                </View>
                : null
        );
    }
}

export default (ChatUnseenIcon)