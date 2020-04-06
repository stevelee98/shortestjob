import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, TouchableOpacity, TouchableWithoutFeedback, View, Image, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { withNavigation } from "react-navigation";
import { Colors } from 'values/colors';
import ic_camera_white from "images/ic_camera_white.png";
import { Fonts } from 'values/fonts';
import styles from '../styles';
import BaseView from 'containers/base/baseView';
import firebase from 'react-native-firebase';
import Utils from 'utils/utils';
import global from 'utils/global';
import StorageUtil from 'utils/storageUtil';
import statusType from 'enum/statusType';
import membershipStatus from 'enum/membershipStatus';
import { Constants } from 'values/constants';
import vehicleCardStatus from 'enum/vehicleCardStatus';
import StringUtil from 'utils/stringUtil';
import commonStyles from 'styles/commonStyles';
import screenType from "enum/screenType.js";

const ANIMATION_DURATION = 300;

class PostButton extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            useCard: true
        }
    }

    activation = new Animated.Value(0);

    state = {
        measured: false,
        active: false
    };

    actionPressed = () => {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            //this callback is executed when your Promise is resolved
            console.log("user", user);
            if (!Utils.isNull(user) && user.status == membershipStatus.ACTIVE) {
                this.props.navigation.navigate("PostNews", { screenType: screenType.FROM_HOME_VIEW })
            } else {
                this.showLoginView({
                    routeName: "PostNews",
                    params: { screenType: screenType.FROM_HOME_VIEW }
                })
            }
        }).catch(error => {

        });
    }

    render() {
        const activationRotate = this.activation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '135deg']
        });

        const activationScale = this.activation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 1.25, 1]
        });

        return (
            <View
                pointerEvents="box-none"
                style={Styles.container}
            >
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => this.actionPressed()}
                >
                    <Animated.View style={[Styles.toggleButton, {
                        transform: [
                            { rotate: activationRotate },
                            { scale: activationScale }
                        ]
                    }]}>
                        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: Constants.MARGIN_12 }}>
                            <View style={[styles.post, { marginTop: Constants.MARGIN + 3 }]}>
                                <Image resizeMode={'contain'} source={ic_camera_white} />
                            </View>
                            <Text style={[{
                                color: Colors.COLOR_PRIMARY,
                                textAlign: 'center',
                                fontSize: Fonts.FONT_SIZE_X_SMALL,
                                marginTop: Constants.MARGIN
                            }]}>Đăng tin</Text>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </View>
        );
    }
}

const Styles = {
    container: {
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    toggleButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 80
    },
    toggleIcon: {
        fontSize: 30,
        color: 'white'
    },
    actionsWrapper: {
        position: 'absolute',
        bottom: 0
    },
    actionContainer: {
        position: 'absolute'
    },
    actionContent: {
        flex: 1,
        width: 30,
        height: 30,
        borderRadius: 15
    }
};

const CodeButtonContainer = withNavigation(PostButton);

export { CodeButtonContainer as PostButton };