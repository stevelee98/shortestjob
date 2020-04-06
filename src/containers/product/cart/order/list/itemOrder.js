import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import BaseView from 'containers/base/baseView';
import { Colors } from 'values/colors';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import { Fonts } from 'values/fonts';
import { Constants } from 'values/constants';
import StringUtil from 'utils/stringUtil';
import Utils from 'utils/utils';
import ImageLoader from 'components/imageLoader';
import orderStatus from 'enum/orderStatus';
import deliveryStatus from 'enum/deliveryStatus';

const window = Dimensions.get('window');

const SIZE_BOX = window.width / 2.5;
const WIDTH_IMAGE = "100%";
const HEIGHT_IMAGE = "100%";
const LINE_TITLE = 1;
const SIZE_LOGO = 28;

export default class ItemOrder extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    /**
     * Render order status
     * @param {*} delivery
     */
    renderOrderStatus(delivery) {
        let deliveryStatusView = null
        switch (delivery) {
            case deliveryStatus.WAITING_FOR_APPROVAL:
                deliveryStatusView =
                    <View style={{ marginTop: Constants.MARGIN_LARGE }}>
                        <Text style={[commonStyles.text, { margin: 0, color: Colors.COLOR_PRIMARY }]}>Chờ xác nhận</Text>
                    </View>
                break;
            case deliveryStatus.ON_THE_WAY:
                deliveryStatusView =
                    <View style={[commonStyles.viewHorizontal, { flex: 0, marginTop: Constants.MARGIN_LARGE }]}>
                        <Text style={[commonStyles.text, { margin: 0, marginRight: Constants.MARGIN_LARGE, textDecorationLine: 'line-through', textDecorationStyle: 'solid' }]}>Chờ xác nhận</Text>
                        <Text style={[commonStyles.text, { margin: 0, color: Colors.COLOR_PRIMARY }]}>Đang giao hàng</Text>
                    </View>
                break;
            case deliveryStatus.DELIVERY_SUCCESS:
                deliveryStatusView =
                    <View style={[{ marginTop: Constants.MARGIN_LARGE }]}>
                        <View style={[commonStyles.viewHorizontal, { flex: 0 }]}>
                            <Text style={[commonStyles.text, { margin: 0, marginRight: Constants.MARGIN_LARGE, textDecorationLine: 'line-through', textDecorationStyle: 'solid' }]}>Chờ xác nhận</Text>
                            <Text style={[commonStyles.text, { margin: 0, marginRight: Constants.MARGIN_LARGE, textDecorationLine: 'line-through', textDecorationStyle: 'solid' }]}>Đang giao hàng</Text>
                        </View>
                        <Text style={[commonStyles.text, { margin: 0, marginTop: Constants.MARGIN_LARGE, color: Colors.COLOR_PRIMARY }]}>Giao hàng thành công</Text>
                    </View>
                break;
            case deliveryStatus.CUSTOMER_REFUSED_TO_RECEIVE:
                deliveryStatusView =
                    <View style={{ marginTop: Constants.MARGIN_LARGE }}>
                        <Text style={[commonStyles.text, {
                            margin: 0, color: Colors.COLOR_RED
                        }]}>Đã hủy</Text>
                    </View>
                break;
        }
        return deliveryStatusView;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props != nextProps) {
            this.props == nextProps
        }
    }

    render() {
        const { item, index, onPressItemOrder, length, orderName, horizontal } = this.props;
        let parseItem = {
            orderCode: item.code,
            orderStatus: item.orderStatus,
            createdAt: item.createdAt,
            paymentReceived: item.paymentReceived,
            paymentStatus: item.paymentStatus,
            deliveryStatus: item.deliveryStatus
        }
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                style={[commonStyles.shadowOffset, {
                    width: horizontal ? (window.width - Constants.MARGIN_XX_LARGE) / 1.5 : null,
                    marginLeft: horizontal ? index == 0 ? Constants.MARGIN_X_LARGE : Constants.MARGIN_LARGE : Constants.MARGIN_X_LARGE,
                    marginRight: horizontal ? index == length - 1 ? Constants.MARGIN_X_LARGE : Constants.MARGIN_LARGE : Constants.MARGIN_X_LARGE,
                    borderRadius: Constants.CORNER_RADIUS,
                    marginTop: Constants.MARGIN,
                    marginBottom: Constants.MARGIN_LARGE,
                    paddingHorizontal: Constants.PADDING_24,
                    paddingVertical: Constants.PADDING_X_LARGE,
                    backgroundColor: Colors.COLOR_WHITE
                }]}
                onPress={() => onPressItemOrder()}>
                <Text numberOfLines={2} ellipsizeMode={"tail"} style={[commonStyles.text, { margin: 0, height: 40 }]}>{orderName}</Text>
                <Text style={[commonStyles.text, { margin: 0, marginTop: Constants.MARGIN_LARGE }]}>#{parseItem.orderCode}</Text>
                <Text style={[commonStyles.text, { margin: 0, marginTop: Constants.MARGIN_LARGE }]}>
                    {DateUtil.convertFromFormatToFormat(parseItem.createdAt, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_TIME)}
                    , {DateUtil.convertFromFormatToFormat(parseItem.createdAt, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE)}
                </Text>
                {
                    // this.renderOrderStatus(parseItem.deliveryStatus)
                    parseItem.orderStatus == orderStatus.CONFIRMED
                        ? this.renderOrderStatus(parseItem.deliveryStatus)
                        : (parseItem.orderStatus == orderStatus.CANCELED_BY_ADMIN
                            || parseItem.orderStatus == orderStatus.CANCELED_BY_USER)
                            ? <Text style={[commonStyles.text, {
                                margin: 0, marginTop: Constants.MARGIN_LARGE, color: Colors.COLOR_RED
                            }]}>Đã hủy</Text>
                            : <Text style={[commonStyles.text, {
                                margin: 0, marginTop: Constants.MARGIN_LARGE, color: Colors.COLOR_PRIMARY
                            }]}>Chờ xác nhận</Text>
                }
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    boxView: {
        ...commonStyles.shadowOffset,
        flex: 1,
        borderRadius: Constants.CORNER_RADIUS,
        backgroundColor: Colors.COLOR_WHITE,
        alignItems: 'center',
        marginBottom: Constants.MARGIN_LARGE + Constants.MARGIN
    },
    boxGrid: {
        ...commonStyles.shadowOffset,
        flex: 1,
        backgroundColor: Colors.COLOR_WHITE,
        borderRadius: Constants.CORNER_RADIUS,
        marginBottom: Constants.MARGIN_LARGE + Constants.MARGIN
    },
    image: {
        width: WIDTH_IMAGE,
        height: HEIGHT_IMAGE
    },
    boxData: {
        ...commonStyles.viewCenter,
        flex: 1,
        paddingHorizontal: Constants.MARGIN_X_LARGE,
        marginBottom: Constants.MARGIN_LARGE * 3
    },
    text: {
        ...commonStyles.text,
        color: Colors.COLOR_TEXT,
        margin: 0

    },
    logo: {
        justifyContent: 'flex-end',
        width: SIZE_LOGO,
        height: SIZE_LOGO
    }
});
