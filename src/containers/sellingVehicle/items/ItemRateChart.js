import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Modal, BackHandler } from 'react-native';
import ic_minus_primary from 'images/ic_minus_primary.png';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
import { Fonts } from 'values/fonts';
import { Colors } from 'values/colors';
import ic_check_white from 'images/ic_check_white.png';
import global from 'utils/global';
import StringUtil from 'utils/stringUtil';
import I18n, { localizes } from 'locales/i18n';
import BaseView from 'containers/base/baseView';
import StorageUtil from 'utils/storageUtil';
import Utils from 'utils/utils';
import statusType from 'enum/statusType';
import FlatListCustom from 'components/flatListCustom';
const width = Dimensions.get('window').width
const height = Dimensions.get('window').height
import GridView from 'components/gridView';
import ImageViewer from 'react-native-image-zoom-viewer';
import DateUtil from 'utils/dateUtil';
const PADDING_BUTTON = Constants.PADDING_X_LARGE - 4
import moment from 'moment';
// import ic_cancel_white from 'images/ic_cancel_white.png';
import firebase from 'react-native-firebase';
import ImageLoader from 'components/imageLoader';
import ic_cancel_white from 'images/ic_cancel_white.png';
import StarRating from 'react-native-star-rating';
import { StackActions, NavigationActions } from "react-navigation";
const messageType = {
    NORMAL_MESSAGE: 1,
    IMAGE_MESSAGE: 2
}
import ic_default_user from 'images/ic_default_user.png';
const SIZE_AVATAR = 48;
const SIZE_LOGO = 32;

class ItemRateChart extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
        };
        const { item, index, maxAmount } = this.props
        this.item = item;
        this.index = index;
        this.height = height * 1.5 / 100;
        this.width = width * 0.5;
        this.maxAmount = maxAmount;
    }

    componentWillReceiveProps = (nextProps) => {
        if (this.props != nextProps) {
            this.props = nextProps
        }
    }


    render() {
        return (
            <View style={[commonStyles.viewHorizontal, {}]}>
                <View style={[commonStyles.viewCenter, {}]}>
                    <Text style={[commonStyles.text, { margin: 0, marginRight: Constants.MARGIN_LARGE, textAlign: 'center' }]}>{this.item.star}</Text>
                </View>
                <View style={{ ...commonStyles.viewCenter }}>
                    <View
                        style={{
                            width: this.width,
                            height: this.height,
                            marginHorizontal: Constants.MARGIN,
                            backgroundColor: "#e9eaed",
                            borderRadius: 19,
                            borderColor: 'transparent',

                        }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={[commonStyles.viewHorizontal, {
                                flex: 0,
                                width: `${(this.props.per * 100)}%`,
                                paddingLeft: `0%`,
                                height: this.height,
                            }]} >
                                <View style={{
                                    flex: 1,
                                    backgroundColor: Colors.COLOR_GOLD,
                                    borderBottomLeftRadius: 15,
                                    borderTopLeftRadius: 15, borderBottomRightRadius: 15,
                                    borderTopRightRadius: 15, height: "100%"
                                }} />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    name: {
        borderTopLeftRadius: Constants.CORNER_RADIUS - 6,
        borderTopRightRadius: Constants.CORNER_RADIUS - 6,
        margin: 0,
        padding: Constants.PADDING_LARGE,
        backgroundColor: Colors.COLOR_WHITE
    },
    image: { backgroundColor: Colors.COLOR_WHITE, borderRadius: Constants.CORNER_RADIUS, borderBottomLeftRadius: 0, borderTopLeftRadius: 0, justifyContent: 'center', alignItems: 'center', paddingRight: Constants.PADDING_X_LARGE },

    buttonSpecial: {
        paddingHorizontal: Constants.PADDING_X_LARGE,
        paddingVertical: Constants.PADDING_LARGE,
    }
});

export default ItemRateChart;