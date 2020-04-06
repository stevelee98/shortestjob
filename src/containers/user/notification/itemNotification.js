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
import notificationType from 'enum/notificationType';
import styles from "./styles";
import img_h2 from "images/img_h2.png";
import img_order from "images/img_order.png";
import img_promotion from "images/img_promotion.png";
import { CheckBox } from 'react-native-elements';
import ImageLoader from "components/imageLoader";

const imageOrder = img_order
const imageH2 = img_h2
const imagePromotion = img_promotion
const WAITING_BACKGROUND = 'rgb(252,232,225)'

class ItemNotification extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isCheck: false
        }
        this.W_H_IMAGE = 45
        this.W_H_SEEN = 10
        this.RADIUS = 5
    }

    componentWillReceiveProps(nextProps) {
        if (this.props != nextProps) {
            this.props = nextProps
        }
    }

    render() {
        const {
            item,
            index,
            deleteObj,
            onPressItem,
            onLongPressItem,
            resourceUrlPathResize
        } = this.props
        let parseItem = {
            title: item.title,
            content: item.content,
            date: item.createdAt,
            isSeen: item.seen,
            image: item.image,
            type: item.type,
            isGroup: item.isGroup,
            isTemp: item.isTemp
        }
        let imageUser = !Utils.isNull(item.createdBy) && !Utils.isNull(item.createdBy.avatarPath) ? item.createdBy.avatarPath.indexOf('http') != -1 ? item.createdBy.avatarPath : resourceUrlPathResize + "=" + item.createdBy.avatarPath : "";
        const uriImage = this.getUriImage(parseItem.type, imageUser);
        const numberRow = !parseItem.isGroup ? 3 : 1;
        return (
            <TouchableOpacity
                activeOpacity={.5}
                style = {{
                    marginVertical: Constants.MARGIN_LARGE,
                    padding: Constants.PADDING_X_LARGE,
                    backgroundColor: Colors.COLOR_WHITE
                }}
                onLongPress={() => {
                    if (!deleteObj.enable) {
                        onLongPressItem();
                        this.onCheck();
                    }
                }}
                onPress={() => deleteObj.enable ? this.onCheck() : onPressItem()}
                delayLongPress={500}
            >
                <View style={[commonStyles.viewHorizontal, { alignItems: 'center' }]}>
                    {/* image market */}
                    <View style={{
                        position: 'relative',
                        alignItems: 'center',
                        marginRight: Constants.MARGIN_X_LARGE
                    }} >
                        { uriImage === imageUser ? <ImageLoader
                            resizeModeType={'cover'}
                            resizeAtt={{ type: 'resize', width: this.W_H_IMAGE }}
                            path={uriImage}
                            style={{
                                width: this.W_H_IMAGE,
                                height: this.W_H_IMAGE,
                                borderRadius: this.W_H_IMAGE / 2
                            }}
                        /> :
                        <Image
                            source={uriImage}
                            style={{ width: this.W_H_IMAGE, height: this.W_H_IMAGE }}
                            resizeMode={"cover"}
                        /> }
                        {
                            !parseItem.isSeen ?
                                <View style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    backgroundColor: Colors.COLOR_RED_LIGHT,
                                    height: this.W_H_SEEN,
                                    width: this.W_H_SEEN,
                                    borderRadius: this.RADIUS
                                }} />
                                : null
                        }
                    </View>

                    <View style={{ flex: 1 }} >
                        {/* title */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }} >
                            {/* title */}
                            <Text style={[!parseItem.isGroup
                                ? commonStyles.text
                                : commonStyles.text, { flex: 1, padding: 0, margin: 0 }]}>{parseItem.title}</Text>
                            {
                                !parseItem.isGroup ?
                                    // about time
                                    <Text style={[commonStyles.text, {
                                        fontSize: Fonts.FONT_SIZE_X_SMALL + 1,
                                        padding: 0,
                                        margin: 0,
                                        marginTop: Constants.MARGIN,
                                        opacity: 0.5
                                    }]}>
                                        {DateUtil.timeAgo(parseItem.date)}
                                    </Text>
                                    : null
                            }
                        </View>
                        {/* content */}

                        <Text numberOfLines={numberRow}
                            ellipsizeMode={'tail'}
                            style={[!parseItem.isSeen ? commonStyles.textBold : commonStyles.text, {
                                padding: 0, margin: 0,
                                color: parseItem.isTemp ? Colors.COLOR_GRAY : Colors.COLOR_TEXT,
                                fontSize: parseItem.isTemp ? Fonts.FONT_SIZE_X_SMALL : Fonts.FONT_SIZE_MEDIUM
                            }]} >{parseItem.content}</Text>
                    </View>
                    {deleteObj.enable ? this.renderCheckBox(parseItem) : null}
                </View>
            </TouchableOpacity>
        )
    }

    /**
     * Get uri image
     * @param {*} type 
     */
    getUriImage(type, imageUser) {
        switch(type) {
            case notificationType.COMMON_NOTIFICATION:
                return imageH2;
            case notificationType.COMMERCIAL_NOTIFICATION:
                return imagePromotion;
            case notificationType.ORDER_NOTIFICATION:
                return imageOrder;
            case notificationType.COMMENT_NOTIFICATION:
            case notificationType.FEEDBACK_COMMENT_NOTIFICATION:
                return imageUser;
            default: 
                return imageH2;
        }
    }

    /**
     * Render check box
     */
    renderCheckBox(parseItem) {
        const { item, index } = this.props;
        return (
            <CheckBox
                key={index}
                checkedColor={Colors.COLOR_PRIMARY}
                iconRight
                checked={item.isCheck}
                containerStyle={styles.checkBox}
                onPress={this.onCheck}
            />
        )
    }

    /**
     * On check
     */
    onCheck = () => {
        const { item } = this.props;
        item.isCheck = !item.isCheck;
        this.props.onChecked(item);
        this.setState({ isCheck: !this.state.isCheck })
    }

}

export default ItemNotification;