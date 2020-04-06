'use strict';
import React, { Component } from 'react';
import {
    ImageBackground, View, StatusBar, TextInput,
    ScrollView, TouchableOpacity, Modal, Image, Dimensions, FlatList, ActivityIndicator, Alert
} from "react-native";
import {
    Root, Form, Textarea, Container, Header, Title, Left, Icon, Right,
    Button, Body, Content, Text, Card, CardItem,
    Fab, Footer, Input, Item, Toast, ActionSheet,
} from "native-base";
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import { Fonts } from "values/fonts";
import { localizes } from 'locales/i18n';
import BaseView from 'containers/base/baseView';
import DateUtil from 'utils/dateUtil';
import Utils from 'utils/utils';
import ImageLoader from 'components/imageLoader';
import ic_cancel_black from 'images/ic_cancel_black.png';
const WAITING_BACKGROUND = 'rgb(252,232,225)'
const width = Dimensions.get('window').width
const height = Dimensions.get('window').height
var HEIGHT_IMAGES = width * 0.4
var HEIGHT_WIDTH_CANCEL = 16
const POSITION_LOAD = HEIGHT_IMAGES / 2 - Constants.MARGIN * 2

class ItemImage extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            isLoad: true
        }
    }

    render() {
        const {
            item,
            index,
            array,
            onPressX
        } = this.props
        let parseItem = {
            image: item.image
        }
        return (
            <View style={[{
                ...commonStyles.shadowOffset,
                borderRadius: Constants.CORNER_RADIUS,
                backgroundColor: Colors.COLOR_WHITE,
                position: 'relative',
                marginLeft: index == 0 ? Constants.MARGIN_X_LARGE : Constants.MARGIN_LARGE,
                marginRight: index == array.length - 1 ? Constants.MARGIN_X_LARGE : Constants.MARGIN_LARGE,
                marginBottom: Constants.MARGIN_12,
                marginHorizontal: Constants.MARGIN_LARGE,
                marginTop: Constants.MARGIN
            }]} >
                <TouchableOpacity
                    style={{ borderRadius: Constants.CORNER_RADIUS, }}
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => { }} >
                    <Image
                        style={[{
                            width: HEIGHT_IMAGES, height: HEIGHT_IMAGES,
                            borderRadius: Constants.CORNER_RADIUS,
                        }]}
                        resizeMode={"cover"}
                        source={{ uri: parseItem.image }}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => { onPressX(item) }}
                    style={{
                        position: 'absolute',
                        top: Constants.MARGIN_LARGE,
                        right: Constants.MARGIN_LARGE,
                        backgroundColor: Colors.COLOR_DRK_GREY,
                        borderRadius: HEIGHT_WIDTH_CANCEL / 2,
                        padding: Constants.PADDING
                    }} >
                    <Image
                        resizeMode={"center"}
                        source={ic_cancel_black}
                        style={[{
                            height: HEIGHT_WIDTH_CANCEL,
                            width: HEIGHT_WIDTH_CANCEL,
                            borderRadius: HEIGHT_WIDTH_CANCEL / 2
                        }]} />
                </TouchableOpacity>
            </View>
        )
    }
}
export default ItemImage