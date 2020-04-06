import React, { Component } from "react";
// import { ImageBackground, View, StatusBar, Container, Button, H3, Text } from "react-native";
import {
    ImageBackground, View, StatusBar, Image, TouchableOpacity,
    BackHandler, Alert, Linking, StyleSheet, RefreshControl,
    TextInput, Dimensions, ScrollView, Keyboard, Platform, ActivityIndicator,
    FlatList, KeyboardAvoidingView
} from "react-native";
import {
    Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text,
    Card, CardItem, Item, Input, Toast, Root, Col, Form
} from "native-base";
import BaseView from "containers/base/baseView";
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import Utils from 'utils/utils'
import ic_back_white from 'images/ic_back_white.png'
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation'
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import DateUtil from "utils/dateUtil";
import ic_intro from "images/ic_intro.png";
import styles from "./styles";
import ModalDropdown from 'components/dropdown';
import I18n, { localizes } from "locales/i18n";
import { Fonts } from "values/fonts";
import FlatListCustom from 'components/flatListCustom'
import cleaningAndWashingType from "enum/cleaningAndWashingType";
import ServiceType from "enum/serviceType";
import StringUtil from "utils/stringUtil";
// import ic_schedule_primary from 'images/ic_schedule_primary.png'
import { filter } from "rxjs/operators";
import subServiceType from "enum/subServiceType";
import serviceType from "enum/serviceType";
import moment from 'moment';
// import ic_check_box_white from 'images/ic_check_box_white.png'
// import ic_uncheck_box_white from 'images/ic_uncheck_box_white.png'
import GridView from 'components/gridView';
// import ic_arrow_right from 'images/ic_arrow_right.png';
// import ic_bed_room from 'images/ic_bed.png';
// import ic_bathroom from 'images/ic_bathroom.png';
// import ic_next_white from 'images/ic_next_white.png';
import ic_send from 'images/ic_send.png';
import ic_send_image from 'images/ic_send_image.png';
// import screenLincareType from "enum/screenLincareType";
import StorageUtil from 'utils/storageUtil';
import { CalendarScreen } from "components/calendarScreen";
// import SliderCustom from "components/sliderCustom";
import SubServiceType from "enum/subServiceType"
import statusType from "enum/statusType";
import screenType from "enum/screenType";
// import carType from "enum/carType";
import vehicleType from "enum/vehicleType";
import ItemChat from "./ItemChat";
const width = Dimensions.get('window').width
const height = Dimensions.get('window').height
import firebase from 'react-native-firebase';
import ImagePicker from 'react-native-image-crop-picker'
import { async } from "rxjs/internal/scheduler/async";
import KeyboardSpacer from 'react-native-keyboard-spacer';


class TextInputSetState extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            stringSearch: null
        }
        // const { roomId, memberId } = this.props.navigation.state.params;
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    render() {
        return (
            <TextInput
                style={[commonStyles.text, { margin: 0, padding: 0, borderRadius: 0, color: Colors.COLOR_WHITE }]}
                placeholder={"Tìm kiếm"}
                placeholderTextColor={Colors.COLOR_WHITE}
                ref={r => (this.stringSearch = r)}
                value={this.state.stringSearch}
                onChangeText={(text) => {
                    this.setState({
                        stringSearch: text
                    })
                    this.props.onChangeValue(text)
                }}
                keyboardType="default"
                underlineColorAndroid='transparent'
            />
        );
    }
}

export default (TextInputSetState);