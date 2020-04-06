import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity, Image, BackHandler,
    RefreshControl, ScrollView, Dimensions, TextInput
} from 'react-native';
import BaseView from 'containers/base/baseView';
import styles from './styles';
import { Container, Root, Header, Content } from 'native-base';
import { Colors } from 'values/colors';
import ic_home_white from 'images/ic_home_white.png';
import FlatListCustom from 'components/flatListCustom';
import { Constants } from 'values/constants';
import StringUtil from 'utils/stringUtil';
import * as productActions from 'actions/productActions';
import * as paymentActions from 'actions/paymentActions';
import * as commonActions from 'actions/commonActions';
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import StorageUtil from 'utils/storageUtil';
import commonStyles from 'styles/commonStyles';
import ItemOrderProduct from './itemOrderProduct';
import orderStatus from 'enum/orderStatus';
import { Fonts } from 'values/fonts';
import screenType from 'enum/screenType';
import Utils from 'utils/utils';
import DateUtil from 'utils/dateUtil';
import paymentMethodType from 'enum/paymentMethodType';
import DialogCustom from 'components/dialogCustom';
import deliveryStatus from 'enum/deliveryStatus';
import paymentStatus from 'enum/paymentStatus';

const screen = Dimensions.get("window");

class OrderProductView extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            inputNote: null,
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            progressMaxSize: 0,
            isAlertCancel: false,
            isAlertCancelSuccess: false,
            isAlertPaymentSuccess: false,
            receiverName: null,
            receiverPhone: null,
            deliveryAddress: null,
            paymentMethod: paymentMethodType.COD
        };
        const { screen } = this.props.navigation.state.params
        this.order = null
        this.shippingFee = 0
        this.screenType = screen
        this.total = 0
        this.quantityCart = 0
        if (this.screenType == screenType.FROM_ORDERS) {
            this.order = this.props.navigation.state.params.order
            this.shippingFee = !Utils.isNull(this.order) ? this.order.shippingFee : 0
            this.total = !Utils.isNull(this.order) ? this.order.price + this.shippingFee : 0
        }
        this.userInfo = null
        this.userAddress = null
        this.carts = []
        this.productInOrder = []
        this.paymentReceived = ""
        this.isDisable = true
        this.isRenderCommonButton = true
        this.isPaymentPayooSuccess = false
        this.responsePayooComplete = null
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.getSourceUrlPath()
        this.getCart()
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            //this callback is executed when your Promise is resolved
            if (!Utils.isNull(user)) {
                this.userInfo = user
                if (!Utils.isNull(user.userAddresses)) {
                    user.userAddresses.forEach(item => {
                        if (item.isDefault == true) {
                            this.state.receiverName = item.name
                            this.state.receiverPhone = item.phone
                            this.state.deliveryAddress = item.address
                        }
                    })
                }
            }
        }).catch(error => {
            //this callback is executed when your Promise is rejected
            this.saveException(error, 'componentWillMount')
        });
    }

    componentDidMount() {
        if (this.screenType == screenType.FROM_ORDERS) {
            if (!Utils.isNull(this.order)) {
                this.props.getDetailOfOrder(this.order.id)
            }
        }
    }


    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.state.refreshing) {
                    this.state.refreshing = false
                    this.carts = []
                    this.productInOrder = []
                }
                if (this.props.action == getActionSuccess(ActionEvent.ORDER_PRODUCT)) {
                    if (!Utils.isNull(data)) {
                        StorageUtil.deleteItem(StorageUtil.CART)
                        this.getCart()
                        this.props.navigation.pop()
                        this.props.navigation.push("OrderProduct", {
                            screen: screenType.FROM_ORDERS,
                            order: data
                        })
                        this.getOrdersOfProduct()
                    }
                } else if (this.props.action == ActionEvent.GET_ALL_CART) {
                    this.carts = data.carts
                    this.quantityCart = data.quantity
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_DETAIL_OF_ORDER)) {
                    if (!Utils.isNull(data)) {
                        this.productInOrder = data
                        console.log("Product In Order: ", this.productInOrder)
                        this.quantityCart = 0
                        this.productInOrder.forEach(item => {
                            this.quantityCart += item.quantity
                        });
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.CANCEL_ORDER_PRODUCT)) {
                    if (!Utils.isNull(data)) {
                        this.setState({ isAlertCancelSuccess: true })
                        this.order = data
                        this.getOrdersOfProduct()
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.SAVE_INFO_PAYMENT)) {
                    if (!Utils.isNull(data)) {
                        this.order = data
                        if (this.isPaymentPayooSuccess) {
                            let filter = {
                                payload: this.responsePayooComplete.replace('ResponseData', '').replace(/\);$/, '')
                            }
                            this.props.savePaymentPayooDetail(filter)
                            this.setState({ isAlertPaymentSuccess: true })
                        }
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    /**
     * Get orders of product
     */
    getOrdersOfProduct() {
        this.props.getOrdersOfProduct({
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            }
        }, screenType.FROM_USER_PROFILE)
    }

    /**
     * Call back confirm buy product
     */
    callBackConfirmBuyProduct = (responsePayooComplete, paymentPayooGroupType) => {
        this.responsePayooComplete = responsePayooComplete
        this.paymentPayooGroupType = paymentPayooGroupType
        this.isPaymentPayooSuccess = true
        this.confirmBuyProduct()
    }

    /**
     * Confirm Buy Product
     */
    confirmBuyProduct = () => {
        if (this.isPaymentPayooSuccess) {
            let filter = {
                orderId: this.order.id,
                paymentPayooGroupType: this.paymentPayooGroupType
            }
            this.props.saveInfoPayment(filter)
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    /**
     * Render UI right menu
     */
    renderRightMenu = () => {
        return (
            <TouchableOpacity
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    right: 0,
                    marginRight: Constants.PADDING_12,
                }}
                onPress={() => { }}>
                <Image
                    opacity={0}
                    source={ic_cart_grey}
                    resizeMode={'contain'} />
            </TouchableOpacity>
        )
    }

    /**
     * Render order status
     * @param {*} delivery
     */
    renderOrderStatus(delivery) {
        let viewOrderStatus = null
        switch (delivery) {
            case deliveryStatus.WAITING_FOR_APPROVAL:
                viewOrderStatus =
                    <View style={[commonStyles.viewCenter, { marginTop: Constants.MARGIN_LARGE }]}>
                        <Text style={[commonStyles.text, { margin: 0, color: Colors.COLOR_PRIMARY }]}>Chờ xác nhận</Text>
                    </View>
                break;
            case deliveryStatus.ON_THE_WAY:
                viewOrderStatus =
                    <View style={[commonStyles.viewCenter, { marginTop: Constants.MARGIN_LARGE }]}>
                        <Text style={[commonStyles.text, { margin: 0, marginRight: Constants.MARGIN_LARGE, textDecorationLine: 'line-through', textDecorationStyle: 'solid' }]}>Chờ xác nhận</Text>
                        <Text style={[commonStyles.text, { margin: 0, color: Colors.COLOR_PRIMARY }]}>Đang giao hàng</Text>
                    </View>
                break;
            case deliveryStatus.DELIVERY_SUCCESS:
                viewOrderStatus =
                    <View style={[commonStyles.viewCenter, { marginTop: Constants.MARGIN_LARGE }]}>
                        <Text style={[commonStyles.text, { margin: 0, textDecorationLine: 'line-through', textDecorationStyle: 'solid' }]}>Chờ xác nhận</Text>
                        <Text style={[commonStyles.text, { margin: 0, textDecorationLine: 'line-through', textDecorationStyle: 'solid' }]}>Đang giao hàng</Text>
                        <Text style={[commonStyles.text, { margin: 0, color: Colors.COLOR_PRIMARY }]}>Giao hàng thành công</Text>
                    </View>
                break;
            case deliveryStatus.CUSTOMER_REFUSED_TO_RECEIVE:
                viewOrderStatus =
                    <View style={{ marginTop: Constants.MARGIN_LARGE }}>
                        <Text style={[commonStyles.text, {
                            margin: 0, color: Colors.COLOR_RED
                        }]}>Đã hủy</Text>
                    </View>
                break;
        }
        return viewOrderStatus;
    }

    /**
     * Render ui orderStatusType 
     */
    renderInformationOrder() {
        return (
            <View style={[commonStyles.shadowOffset, {
                borderRadius: Constants.CORNER_RADIUS,
                marginHorizontal: Constants.MARGIN_X_LARGE,
                marginBottom: Constants.PADDING_X_LARGE
            }]}>
                <View style={{ height: screen.height * 0.13 }}></View>
                <View style={[{
                    backgroundColor: Colors.COLOR_WHITE,
                    borderBottomLeftRadius: Constants.CORNER_RADIUS,
                    borderBottomRightRadius: Constants.CORNER_RADIUS,
                    padding: Constants.MARGIN_X_LARGE
                }]}>
                    <View style={[commonStyles.viewCenter]}>
                        {!Utils.isNull(this.order)
                            ? this.order.orderStatus == orderStatus.CONFIRMED
                                ? this.renderOrderStatus(this.order.deliveryStatus)
                                : (this.order.orderStatus == orderStatus.CANCELED_BY_ADMIN
                                    || this.order.orderStatus == orderStatus.CANCELED_BY_USER)
                                    ? <Text style={[commonStyles.text, {
                                        margin: 0, marginTop: Constants.MARGIN_LARGE, color: Colors.COLOR_RED
                                    }]}>Đã hủy</Text>
                                    : <Text style={[commonStyles.text, { margin: 0, marginTop: Constants.MARGIN_LARGE, color: Colors.COLOR_PRIMARY }]}>Chờ xác nhận</Text>
                            : null
                        }
                    </View>
                </View>
                <View style={[commonStyles.shadowOffset, {
                    backgroundColor: Colors.COLOR_WHITE,
                    borderRadius: Constants.CORNER_RADIUS,
                    padding: Constants.MARGIN_X_LARGE,
                    height: screen.height * 0.14,
                    width: '100%',
                    top: 0,
                    left: 0,
                    position: 'absolute',
                }]}>
                    <View style={[commonStyles.viewHorizontal, { justifyContent: 'space-between', flex: 0 }]}>
                        <Text style={[commonStyles.text, { margin: 0 }]}>Mã đơn hàng</Text>
                        <Text style={[commonStyles.text, { margin: 0 }]}>{
                            !Utils.isNull(this.order)
                                ? "#" + this.order.code
                                : "-"
                        }</Text>
                    </View>
                    <View style={[commonStyles.viewHorizontal, { justifyContent: 'space-between', flex: 0, marginTop: Constants.MARGIN_X_LARGE }]}>
                        <Text style={[commonStyles.text, { margin: 0 }]}>Ngày đặt hàng</Text>
                        <Text style={[commonStyles.text, { margin: 0 }]}>{!Utils.isNull(this.order)
                            ? DateUtil.convertFromFormatToFormat(this.order.createdAt, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE_TIME)
                            : "-"}</Text>
                    </View>
                </View>
            </View>
        )
    }

    /**
     * Render ui note
     */
    renderUINote() {
        return (
            this.screenType == screenType.FROM_CART
                ? <TextInput
                    ref={r => (this.titleRef = r)}
                    value={this.state.inputNote}
                    onChangeText={(text) => {
                        this.setState({ inputNote: text })
                    }}
                    style={[commonStyles.text, commonStyles.shadowOffset, commonStyles.viewCenter, {
                        margin: 0,
                        borderRadius: Constants.CORNER_RADIUS,
                        backgroundColor: Colors.COLOR_WHITE,
                        borderRadius: Constants.CORNER_RADIUS,
                        paddingHorizontal: Constants.PADDING_X_LARGE,
                        marginTop: Constants.MARGIN / 2,
                        height: Constants.HEIGHT_BUTTON
                    }]}
                    underlineColorAndroid='transparent'
                    keyboardType={"default"}
                    placeholder={"Nhập ghi chú"}
                    placeholderTextColor={Colors.COLOR_DRK_GREY}
                    onSubmitEditing={() => {
                    }}
                    returnKeyType={"done"}
                    multiline={true}
                />
                : <View style={[commonStyles.shadowOffset, {
                    justifyContent: 'center',
                    borderRadius: Constants.CORNER_RADIUS,
                    backgroundColor: Colors.COLOR_WHITE,
                    borderRadius: Constants.CORNER_RADIUS,
                    paddingHorizontal: Constants.PADDING_X_LARGE,
                    marginTop: Constants.MARGIN / 2,
                    height: Constants.HEIGHT_BUTTON
                }]}>
                    <Text style={[commonStyles.text]}>{
                        !Utils.isNull(this.order)
                            ? !Utils.isNull(this.order.customerNote)
                                ? this.order.customerNote
                                : "-"
                            : "Không có ghi chú"}</Text>
                </View>
        )
    }

    render() {
        const { enableRefresh, refreshing, progressMaxSize } = this.state
        if (!Utils.isNull(this.order)) {
            if (this.order.deliveryStatus == deliveryStatus.DELIVERY_SUCCESS
                || this.order.deliveryStatus == deliveryStatus.ON_THE_WAY) {
                this.isRenderCommonButton = false
            }
            if (this.order.paymentMethod == paymentMethodType.BANK_TRANSFER) {
                if (this.order.paymentStatus == paymentStatus.WAITING) {
                    this.paymentReceived = " - chờ xác nhận"
                    this.isDisable = true
                } else {
                    this.paymentReceived = " - đã thanh toán"
                    this.isDisable = true
                }
            } else if (this.order.paymentMethod == paymentMethodType.PAYOO) {
                if (this.order.paymentStatus == paymentStatus.WAITING) {
                    this.paymentReceived = " - chưa thanh toán"
                    this.isDisable = false
                } else {
                    this.paymentReceived = " - đã thanh toán"
                    this.isDisable = true
                }
            }
        }
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[{ backgroundColor: Colors.COLOR_BACKGROUND, borderBottomWidth: 0, alignItems: 'center' }]}>
                        {this.renderHeaderView({
                            title: this.screenType == screenType.FROM_ORDERS ? "ĐẶT HÀNG THÀNH CÔNG" : "THANH TOÁN",
                            visibleStage: false,
                            titleStyle: {}
                        })}
                        <TouchableOpacity
                            style={{
                                paddingHorizontal: Constants.PADDING_LARGE
                            }}
                            onPress={() => {
                                this.props.navigation.navigate("Main")
                            }}>
                            <Image source={ic_home_white} />
                        </TouchableOpacity>
                    </Header>
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        showsVerticalScrollIndicator={false}>
                        <View style={{ flex: 1, position: 'relative', marginTop: Constants.MARGIN_LARGE }}>
                            {this.screenType == screenType.FROM_CART ? null : this.renderInformationOrder()}
                            {/* List product */}
                            <FlatListCustom
                                contentContainerStyle={{
                                    paddingVertical: Constants.PADDING
                                }}
                                keyExtractor={(item) => item.id}
                                horizontal={false}
                                data={
                                    this.screenType == screenType.FROM_ORDERS
                                        ? this.productInOrder
                                        : this.carts
                                }
                                itemPerCol={1}
                                renderItem={this.renderItemProduct.bind(this)}
                            />
                            {/* Total Price */}
                            <View style={styles.totalMoney}>
                                <Text style={[commonStyles.text, { flex: 1 }]}>
                                    Tổng số tiền ({this.quantityCart} sản phẩm)
                                    </Text>
                                <Text style={[commonStyles.text, { color: Colors.COLOR_PRIMARY }]}>
                                    {StringUtil.formatStringCashNoUnit(
                                        this.screenType == screenType.FROM_CART
                                            ? this.carts.reduce(this.totalPriceCart, 0)
                                            : !Utils.isNull(this.order)
                                                ? this.order.price
                                                : 0
                                    )}
                                </Text>
                            </View>
                            <View style={{ marginTop: Constants.MARGIN_X_LARGE, marginHorizontal: Constants.MARGIN_X_LARGE }}>
                                {this.renderTitleList(
                                    "Địa chỉ nhận hàng",
                                    "Thay đổi",
                                    () => this.props.navigation.navigate("AddAddress", {
                                        dataAddress: null,
                                        screen: screenType.FROM_ORDERS,
                                        callBack: this.addAddress.bind(this)
                                    })
                                )}
                                <View style={[commonStyles.shadowOffset, {
                                    borderRadius: Constants.CORNER_RADIUS,
                                    position: 'relative'
                                }]}>
                                    <View style={{ height: progressMaxSize - Constants.MARGIN_LARGE }}></View>
                                    <View style={[{
                                        backgroundColor: Colors.COLOR_WHITE,
                                        borderBottomLeftRadius: Constants.CORNER_RADIUS,
                                        borderBottomRightRadius: Constants.CORNER_RADIUS,
                                        padding: Constants.MARGIN_X_LARGE
                                    }]}>
                                        <View style={[commonStyles.viewHorizontal, {
                                            paddingTop: Constants.MARGIN,
                                            flex: 0,
                                            justifyContent: 'space-between',
                                            borderRadius: Constants.CORNER_RADIUS,
                                        }]}>
                                            <Text style={[commonStyles.text, {
                                                margin: 0,
                                            }]}>Phí vận chuyển (3.1km)</Text>
                                            <Text style={[commonStyles.text, {
                                                color: Colors.COLOR_PRIMARY,
                                                margin: 0,
                                            }]}>{StringUtil.formatStringCashNoUnit(this.shippingFee)}</Text>
                                        </View>
                                    </View>
                                    <View
                                        ref={'progressBar'}
                                        onLayout={this.measureProgressBar}
                                        style={[commonStyles.shadowOffset, {
                                            backgroundColor: Colors.COLOR_GREEN_LIGHT,
                                            borderRadius: Constants.CORNER_RADIUS,
                                            padding: Constants.MARGIN_X_LARGE,
                                            width: '100%',
                                            top: 0,
                                            left: 0,
                                            position: 'absolute',
                                        }]}>
                                        <Text style={[commonStyles.text, { margin: 0, color: Colors.COLOR_WHITE }]}>
                                            {this.state.receiverName}
                                        </Text>
                                        <Text style={[commonStyles.text, { margin: 0, color: Colors.COLOR_WHITE }]}>
                                            {this.state.receiverPhone}
                                        </Text>
                                        <Text style={[commonStyles.text, { margin: 0, color: Colors.COLOR_WHITE }]}>
                                            {this.state.deliveryAddress}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ marginTop: Constants.MARGIN_X_LARGE, marginHorizontal: Constants.MARGIN_X_LARGE }}>
                                {this.renderTitleList(
                                    "Phương thức thanh toán",
                                    "Thay đổi",
                                    () => this.props.navigation.navigate("PaymentMethod", {
                                        callBack: this.onClickPaymentMethod.bind(this),
                                        paymentMethod: this.state.paymentMethod,
                                        receiverPhone: this.state.receiverPhone
                                    })
                                )}
                                <TouchableOpacity
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    onPress={() => {
                                        if (this.order.paymentMethod == paymentMethodType.PAYOO) {
                                            this.props.navigation.navigate("PayooPaymentMethod", {
                                                callBack: this.callBackConfirmBuyProduct,
                                                totalPriceVi: this.order.total,
                                                orderCode: this.order.code,
                                                orderName: this.getOrderName(this.order)
                                            })
                                        }
                                    }}
                                    disabled={this.isDisable}
                                    style={[commonStyles.shadowOffset, {
                                        flex: 0,
                                        backgroundColor: Colors.COLOR_GREEN_LIGHT,
                                        justifyContent: 'space-between',
                                        borderRadius: Constants.CORNER_RADIUS,
                                        padding: Constants.PADDING_X_LARGE
                                    }]}>
                                    <Text style={[commonStyles.text, { margin: 0, color: Colors.COLOR_WHITE }]}>
                                        {!Utils.isNull(this.order)
                                            ? this.getPaymentMethod(this.order.paymentMethod)
                                            : this.getPaymentMethod(this.state.paymentMethod)}
                                        {this.paymentReceived}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ marginTop: Constants.MARGIN_X_LARGE, marginHorizontal: Constants.MARGIN_X_LARGE }}>
                                {this.renderTitleList("Ghi chú")}
                                {this.renderUINote()}
                            </View>
                        </View>
                        <View style={{
                            backgroundColor: Colors.COLOR_WHITE,
                            borderTopLeftRadius: Constants.CORNER_RADIUS,
                            borderTopRightRadius: Constants.CORNER_RADIUS,
                            marginTop: Constants.MARGIN_24,
                            padding: Constants.PADDING_X_LARGE,
                        }}>
                            <View style={[commonStyles.viewHorizontal, { flex: 1, justifyContent: 'space-between' }]}>
                                <Text style={[commonStyles.text, {
                                    margin: 0,
                                }]}>Tổng tiền hàng</Text>
                                <Text style={[commonStyles.text, {
                                    margin: 0,
                                }]}>{StringUtil.formatStringCashNoUnit(
                                    this.screenType == screenType.FROM_CART
                                        ? this.carts.reduce(this.totalPriceCart, 0)
                                        : !Utils.isNull(this.order)
                                            ? this.order.price
                                            : 0
                                )}</Text>
                            </View>
                            <View style={[commonStyles.viewHorizontal, { flex: 1, justifyContent: 'space-between', marginTop: Constants.MARGIN_LARGE }]}>
                                <Text style={[commonStyles.text, {
                                    margin: 0,
                                }]}>Tổng tiền phí vận chuyển</Text>
                                <Text style={[commonStyles.text, {
                                    margin: 0,
                                }]}>{StringUtil.formatStringCashNoUnit(this.shippingFee)}</Text>
                            </View>
                            <View style={[commonStyles.viewHorizontal, { flex: 1, justifyContent: 'space-between', marginTop: Constants.MARGIN_LARGE }]}>
                                <Text style={[commonStyles.text, {
                                    margin: 0,
                                }]}>Tổng thanh toán</Text>
                                <Text style={[commonStyles.text, {
                                    margin: 0,
                                    color: Colors.COLOR_PRIMARY
                                }]}>{StringUtil.formatStringCashNoUnit(
                                    this.screenType == screenType.FROM_CART
                                        ? this.carts.reduce(this.totalPriceCart, 0) + this.shippingFee
                                        : this.total)}</Text>
                            </View>
                            {
                                this.isRenderCommonButton
                                    ? this.renderCommonButton(
                                        this.screenType == screenType.FROM_CART
                                            ?
                                            // this.state.paymentMethod == paymentMethodType.PAYOO
                                            //     ? "ĐẶT HÀNG VÀ THANH TOÁN"
                                            // : 
                                            "ĐẶT HÀNG"
                                            : "HỦY ĐƠN HÀNG",
                                        { color: Utils.isNull(this.order) ? Colors.COLOR_WHITE : Colors.COLOR_RED },
                                        { marginVertical: 0, marginHorizontal: 0, backgroundColor: Utils.isNull(this.order) ? Colors.COLOR_PRIMARY : Colors.COLOR_WHITE },
                                        () => !this.props.isLoading ? this.orderProduct() : null,
                                        false,
                                        { marginVertical: 0, marginTop: Constants.MARGIN_X_LARGE }
                                    )
                                    : null
                            }
                        </View>
                    </ScrollView>
                    {this.showLoadingBar(this.props.isLoading)}
                    {!Utils.isNull(this.order) ? this.renderAlertCancelOrder() : null}
                    {!Utils.isNull(this.order) ? this.renderAlertCancelSuccess() : null}
                    {!Utils.isNull(this.order) ? this.renderAlertPaymentSuccess() : null}
                </Root>
            </Container>
        );
    }

    /**
     * Get order name
     */
    getOrderName(order) {
        let orderName = ""
        let indexDetail = -1
        if (!Utils.isNull(order.orderDetails)) {
            order.orderDetails.forEach(detail => {
                indexDetail += 1
                if (!Utils.isNull(detail.product)) {
                    if (indexDetail != order.orderDetails.length - 1) {
                        orderName += detail.product.name + ", "
                    } else {
                        orderName += detail.product.name
                    }
                }
            })
        }
        return orderName;
    }

    /**
     * Get payment method
     */
    getPaymentMethod(type) {
        if (type == paymentMethodType.COD) {
            return paymentMethodType.TEXT_COD
        } else if (type == paymentMethodType.PAYOO) {
            return paymentMethodType.TEXT_PAYOO
        } else if (type == paymentMethodType.BANK_TRANSFER) {
            return paymentMethodType.TEXT_BANK_TRANSFER
        } else {
            return "-"
        }
    }

    /**
     * Add address
     */
    addAddress(receiver) {
        this.setState({
            receiverName: receiver.name,
            receiverPhone: receiver.phone,
            deliveryAddress: receiver.address
        })
    }

    /**
     * Order product
     */
    orderProduct() {
        if (this.screenType == screenType.FROM_CART) {
            let filter = {
                code: StringUtil.randomString(13, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'),
                price: this.carts.reduce(this.totalPriceCart, 0),
                shippingFee: this.shippingFee,
                totalPrice: this.carts.reduce(this.totalPriceCart, 0) + this.shippingFee,
                paymentMethod: this.state.paymentMethod,
                receiverName: this.state.receiverName,
                receiverPhone: this.state.receiverPhone,
                deliveryAddress: this.state.deliveryAddress,
                customerNote: this.state.inputNote,
                products: this.carts
            }
            this.props.orderProduct(filter)
        } else if (this.screenType == screenType.FROM_ORDERS) {
            if (this.order.orderStatus != orderStatus.CANCELED_BY_USER) {
                this.setState({ isAlertCancel: true })
            }
        }
    }

    /**
     * Render title list
     */
    renderTitleList(textLeft, textRight, onPress) {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: Constants.MARGIN
            }}>
                <Text style={[commonStyles.text, {
                    margin: 0,
                    marginHorizontal: Constants.MARGIN_LARGE,
                }]}>{textLeft}</Text>
                <TouchableOpacity
                    disabled={this.screenType == screenType.FROM_CART ? false : true}
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={onPress}
                    block style={[{ marginHorizontal: Constants.MARGIN_LARGE }]} >
                    <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_XX_SMALL }]}>
                        {this.screenType == screenType.FROM_CART ? textRight : ""}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    getInitialState = () => {
        return ({ progressMaxSize: 0 });
    }
    measureProgressBar = () => {
        this.refs.progressBar.measure(this.setWidthProgressMaxSize);
    }
    setWidthProgressMaxSize = (ox, oy, width, height, px, py) => {
        this.setState({ progressMaxSize: height });
    }

    /**
     * On click payment method
     */
    onClickPaymentMethod(paymentMethod) {
        this.setState({
            paymentMethod
        })
    }

    //onRefreshing
    handleRefresh = () => {
        if (this.screenType == screenType.FROM_ORDERS) {
            if (!Utils.isNull(this.order)) {
                this.props.getDetailOfOrder(this.order.id)
            }
        }
    }

    /**
     * Render item
     * @param {*} item
     * @param {*} index
     * @param {*} parentIndex
     * @param {*} indexInParent
     */
    renderItemProduct(item, index, parentIndex, indexInParent) {
        return (
            <ItemOrderProduct
                key={item.id}
                data={this.screenType == screenType.FROM_CART ? this.carts : this.productInOrder}
                fromScreen={this.screenType}
                item={item}
                index={index}
                stylePrice={{ color: Colors.COLOR_TEXT }}
                resource={this.resourceUrlPath.textValue}
            />
        );
    }

    /**
     * Render alert cancel order
     */
    renderAlertCancelOrder() {
        return (
            <DialogCustom
                visible={this.state.isAlertCancel}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={"Hủy đơn hàng"}
                textBtnOne={"Bỏ qua"}
                textBtnTwo={"Hủy"}
                contentText={"Bạn có muốn hủy đơn hàng #" + this.order.code.toUpperCase() + "?"}
                onTouchOutside={() => { this.setState({ isAlertCancel: false }) }}
                onPressX={() => { this.setState({ isAlertCancel: false }) }}
                onPressBtnOne={() => {
                    this.setState({ isAlertCancel: false })
                }}
                onPressBtnPositive={() => {
                    this.setState({ isAlertCancel: false })
                    this.props.cancelOrderProduct({ orderId: this.order.id })
                }}
            />
        )
    }

    /**
     * Render cancel success
     */
    renderAlertCancelSuccess() {
        return (
            <DialogCustom
                visible={this.state.isAlertCancelSuccess}
                isVisibleTitle={true}
                isVisibleOneButton={true}
                isVisibleContentText={true}
                contentTitle={"Thông báo"}
                textBtn={"Ok"}
                contentText={"Đơn hàng #" + this.order.code.toUpperCase() + " đã được hủy thành công."}
                onPressBtn={() => {
                    this.setState({ isAlertCancelSuccess: false });
                    this.onBack()
                }}
            />
        );
    }

    /**
     * Render payment success
     */
    renderAlertPaymentSuccess() {
        return (
            <DialogCustom
                visible={this.state.isAlertPaymentSuccess}
                isVisibleTitle={true}
                isVisibleOneButton={true}
                isVisibleContentText={true}
                contentTitle={"Thông báo"}
                textBtn={"Ok"}
                contentText={"Thanh toán thành công."}
                onPressBtn={() => {
                    this.setState({ isAlertPaymentSuccess: false });
                }}
            />
        );
    }
}

const mapStateToProps = state => ({
    data: state.orderProduct.data,
    isLoading: state.orderProduct.isLoading,
    error: state.orderProduct.error,
    errorCode: state.orderProduct.errorCode,
    action: state.orderProduct.action
});

const mapDispatchToProps = {
    ...productActions,
    ...paymentActions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(OrderProductView);
