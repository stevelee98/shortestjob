import React, { Component } from 'react';
import {
    View, Text, ImageBackground, TouchableOpacity, TextInput, Image, Keyboard,
    RefreshControl, BackHandler
} from 'react-native';
import BaseView from 'containers/base/baseView';
import styles from './styles';
import ic_search_white from 'images/ic_search_white.png';
import ic_home_white from 'images/ic_home_white.png';
import ic_back_white from 'images/ic_back_white.png';
import ic_cart_grey from 'images/ic_cart_grey.png';
import { Colors } from 'values/colors';
import { Content, Header, Container, Root } from 'native-base';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
import { localizes } from 'locales/i18n';
import FlatListCustom from 'components/flatListCustom';
import * as productActions from 'actions/productActions'
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import Utils from 'utils/utils';
import ItemOrder from './itemOrder';
import orderStatus from 'enum/orderStatus';
import screenType from 'enum/screenType';

const GRID_VIEW = 2

class OrdersView extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            inputSearch: null,
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            isLoadMore: true
        };
        this.orders = []
        this.filter = {
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            }
        }
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        this.getSourceUrlPath()
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
                    this.orders = []
                }
                if (this.props.action == getActionSuccess(ActionEvent.GET_ORDERS_OF_PRODUCT)) {
                    if (!Utils.isNull(data.data)) {
                        if (data.data.length < Constants.PAGE_SIZE) {
                            this.setState({
                                enableLoadMore: false
                            })
                        } else {
                            this.setState({
                                enableLoadMore: true
                            })
                        }
                        if (data.data.length > 0) {
                            data.data.forEach((item, index) => {
                                this.orders.push({ ...item })
                            });
                        }
                        this.isLoadMore = true
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    componentDidMount() {
        this.props.getOrdersOfProduct(this.filter, screenType.FROM_ORDERS)
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

    render() {
        const { enableRefresh, refreshing, enableLoadMore } = this.state
        return (
            <Container style={styles.container}>
                <Root>
                    {/* {Header home view} */}
                    <Header style={{ backgroundColor: Colors.COLOR_BACKGROUND, borderBottomWidth: 0 }}>
                        {this.renderHeaderView({
                            visibleStage: false,
                            title: "DANH SÁCH ĐƠN HÀNG",
                            titleStyle: {},
                            renderRightMenu: this.renderRightMenu
                        })}
                    </Header>
                    <FlatListCustom
                        contentContainerStyle={{
                            paddingTop: Constants.MARGIN_LARGE,
                            paddingBottom: Constants.PADDING_X_LARGE
                        }}
                        style={{ flex: 1 }}
                        keyExtractor={(item) => item.id}
                        horizontal={false}
                        data={this.orders}
                        itemPerCol={1}
                        renderItem={this.renderItemOrder.bind(this)}
                        showsVerticalScrollIndicator={false}
                        enableRefresh={enableRefresh}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        enableLoadMore={this.state.enableLoadMore}
                        onLoadMore={() => {
                            this.loadMore()
                        }}
                    />
                    {!refreshing & !enableLoadMore ? this.showLoadingBar(this.props.isLoading) : null}
                </Root>
            </Container>
        );
    }

    /**
     * Handle refresh
     */
    handleRefresh = () => {
        this.setState({
            refreshing: true
        })
        this.filter.paging.page = 0
        this.props.getOrdersOfProduct(this.filter, screenType.FROM_ORDERS)
    }

    /**
     * Load more
     */
    loadMore = () => {
        if (this.isLoadMore) {
            this.isLoadMore = false
            this.filter.paging.page += 1
            this.props.getOrdersOfProduct(this.filter, screenType.FROM_ORDERS)
        }
    }

    /**
     * Render item
     * @param {*} item
     * @param {*} index
     * @param {*} parentIndex
     * @param {*} indexInParent
     */
    renderItemOrder(item, index, parentIndex, indexInParent) {
        let orderName = ""
        let indexDetail = -1
        if (!Utils.isNull(item.orderDetails)) {
            item.orderDetails.forEach(detail => {
                indexDetail += 1
                if (!Utils.isNull(detail.product)) {
                    if (indexDetail != item.orderDetails.length - 1) {
                        orderName += detail.product.name + ", "
                    } else {
                        orderName += detail.product.name
                    }
                }
            })
        }
        return (
            <ItemOrder
                length={this.orders.length}
                item={item}
                index={index}
                orderName={orderName}
                onPressItemOrder={() => {
                    this.props.navigation.navigate('OrderProduct', {
                        screen: screenType.FROM_ORDERS,
                        order: item
                    })
                }}
                horizontal={false}
            />
        );
    }
}

const mapStateToProps = state => ({
    data: state.orders.data,
    isLoading: state.orders.isLoading,
    error: state.orders.error,
    errorCode: state.orders.errorCode,
    action: state.orders.action,
    screen: state.orders.screen
});

const mapDispatchToProps = {
    ...productActions
};

export default connect(mapStateToProps, mapDispatchToProps)(OrdersView);
