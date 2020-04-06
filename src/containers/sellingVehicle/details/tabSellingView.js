import React, { Component } from "react";
import {
    ImageBackground, View, Image, TouchableOpacity,
    BackHandler, Alert, Linking, ScrollView, NativeEventEmitter,
    DeviceEventEmitter, Platform, RefreshControl, Dimensions, SafeAreaView, NativeModules, Text
} from "react-native";
import { Container, Form, Content, Input, Button, Right, Radio, center, ListItem, Left, Header, Item, Picker, Body, Root } from 'native-base';
import * as userActions from 'actions/userActions'
import { connect } from 'react-redux';
import FlatListCustom from "components/flatListCustom";
import { Constants } from "values/constants";
import { localizes } from "locales/i18n";
import BaseView from "containers/base/baseView";
import HeaderView from "containers/common/headerView";
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import Utils from 'utils/utils'
import ic_search_white from "images/ic_search_white.png"
import ic_cancel_white from "images/ic_cancel_white.png"
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import DateUtil from "utils/dateUtil";
import ItemNewsSellingVehicle from "containers/sellingVehicle/items/itemNewsSellingVehicle";
import StorageUtil from "utils/storageUtil";
import statusType from "enum/statusType";

const { ModuleWithEmitter } = NativeModules;
const screen = Dimensions.get("window");
const IS_ANDROID = Platform.OS === 'android';
const eventEmitter = new NativeEventEmitter(ModuleWithEmitter);
const LIST_VIEW = 1;

class TabSellingView extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            visibleSearch: false,
            enableLoadMore: false,
            isLoadingMore: false,
            enableRefresh: true,
            refreshing: false,
        };
        this.filter = {
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
            sellerId: null
        };
        this.data = [];
        this.dataTemp = [];
        this.handleRefresh = this.handleRefresh.bind(this);
        this.type = {
            LIKE: 0,
            EDIT: 1,
            DELETE: 2
        }
        this.userInfo = [];
    }

    componentDidMount() {
        const { navigation } = this.props;
        this.filter.sellerId = this.props.sellerId;
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            //this callback is executed when your Promise is resolved
            if (!Utils.isNull(user) && user.status == statusType.ACTIVE) {
                this.userInfo = user;
            }
        })
            .catch(error => {
                //this callback is executed when your Promise is rejected
                this.saveException(error, 'componentDidMount')
            });
        this.props.getSellingBySeller(this.filter);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                this.state.refreshing = false;
                this.state.isLoadingMore = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_SELLING_BY_SELLER)) {
                    if (data.data.length < Constants.PAGE_SIZE) {
                        this.state.enableLoadMore = false;
                    } else {
                        this.state.enableLoadMore = true;
                    }
                    if (data.data.length > 0) {
                        data.data.forEach((item, index) => {
                            this.dataTemp.push({ ...item });
                        });
                        this.data = this.dataTemp;
                    } else {
                        this.data = [];
                    }
                    this.isLoadMore = true;
                    this.showNoData = true;
                    console.log('Approved', this.data)
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    /**
         * Get more
         */
    getVehicleMore = () => {
        this.state.isLoadingMore = true;
        this.filter.paging.page += 1;
        // this.props.getVehicleContact(this.filter)
    }

    //onRefreshing
    handleRefresh() {
        this.dataTemp = [];
        this.state.enableLoadMore = false;
        this.state.refreshing = true;
        this.filter.paging.page = 0;
        this.filter.sellerId = this.props.sellerId;
        this.props.getSellingBySeller(this.filter);
    }
    render() {
        console.log("resourceUrlPathResize111", this.props.resourceUrlPathResize)
        const { stringSearch } = this.state
        return (
            <View style={{ flex: 1 }}>
                <FlatListCustom
                    keyExtractor={item => item.code}
                    contentContainerStyle={{
                        paddingVertical: Constants.PADDING_LARGE
                    }}
                    style={{
                        flex: 1,
                        backgroundColor: Colors.COLOR_BACKGROUND
                    }}
                    horizontal={false}
                    data={this.data}
                    itemPerCol={1}
                    renderItem={this.renderItem.bind(this)}
                    showsVerticalScrollIndicator={false}
                    enableRefresh={this.state.enableRefresh}
                    refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.handleRefresh} />}
                    enableLoadMore={this.state.enableLoadMore}
                    // onLoadMore={() => {
                    //     this.getMoreMyPost();
                    // }}
                    isShowEmpty={this.showNoData}
                    isShowImageEmpty={true}
                    textForEmpty={'Không có tin nào'}
                    styleEmpty={{
                        marginTop: Constants.MARGIN_LARGE
                    }}
                />
            </View>
        );
    }

    /**
        * Render item Rejected
        * @param {*} item
        * @param {*} index
        * @param {*} parentIndex
        * @param {*} indexInParent
        */
    renderItem(item, index, parentIndex, indexInParent) {
        return (
            <ItemNewsSellingVehicle
                data={this.data}
                item={item}
                index={index}
                onPress={this.onClickItem}
                resource={this.props.resourceUrlPathResize}
                isGridView={false}
                handleRefresh={this.handleRefresh}
                type={0}
                user={this.props.user}
                callBackTab={this.handleRefresh}
            />
        );
    }

    /**
     * On click item
     */
    onClickItem = (item) => {
        // if (!Utils.isNull(this.userInfo)) {
        this.props.navigation.push("SellingVehicleDetail", {
            vehicleId: item.id,
            urlPathResource: this.props.resourceUrlPathResize,
            callBack: (type) => {
                if (type == this.type.LIKE) {
                    item.isFavorite = !item.isFavorite
                    this.setState({ isOk: true })
                } else if (type == this.type.EDIT || type == this.type.DELETE) {
                    // this.handleRequest
                    this.handleRefresh()
                }
            }
        });
        // } else { this.showLoginView(); }
    }

}

const mapStateToProps = state => ({
    data: state.tabSelling.data,
    isLoading: state.tabSelling.isLoading,
    error: state.tabSelling.error,
    errorCode: state.tabSelling.errorCode,
    action: state.tabSelling.action
});

const mapDispatchToProps = {
    ...userActions
};

export default connect(mapStateToProps, mapDispatchToProps)(TabSellingView);
