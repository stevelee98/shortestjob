import React, { Component } from 'react';
import { View, Text, ImageBackground, ScrollView, RefreshControl, TouchableOpacity, Image, TextInput, Keyboard, Dimensions, BackHandler } from "react-native";
import BaseView from 'containers/base/baseView';
import * as actions from "actions/vehicleAction";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import FlatListCustom from 'components/flatListCustom';
import { localizes } from 'locales/i18n';
import { ErrorCode } from 'config/errorCode';
import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';
import ItemNewsSellingVehicle from "containers/sellingVehicle/items/itemNewsSellingVehicle";
import itemSellingVehicleType from 'enum/itemSellingVehicleType';

const screen = Dimensions.get("window");

class FlatListReject extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false
        };
        this.dataRejected = [];
        this.dataRejectedTemp = [];
        const { navigation, numScreen } = this.props;
        this.numScreen = numScreen
        this.filter = {
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
            numScreen: this.numScreen
        };
        this.isLoadMore = true;
        this.navigation = navigation
    }

    componentWillMount() {
        this.getSourceUrlPath();
        this.props.getSellingMyPostRejected(this.filter);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    // handle request
    handleRequest(user) {
        this.props.getSellingMyPostRejected(this.filter);
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_SELLING_MY_POST_REJECTED)) {
                    if (data.data.length < Constants.PAGE_SIZE) {
                        this.state.enableLoadMore = false;
                    } else {
                        this.state.enableLoadMore = true;
                    }
                    if (data.data.length > 0) {
                        data.data.forEach((item, index) => {
                            this.dataRejectedTemp.push({ ...item, itemType: itemSellingVehicleType.ITEM_SELLING_VEHICLE });
                        });
                        this.dataRejected = this.dataRejectedTemp;
                    } else {
                        this.dataRejected = [];
                    }
                    this.isLoadMore = true;
                    this.showNoData = true;
                    console.log('Rejected1', this.dataRejected)
                }
            }
            else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    /**
    * Render item Rejected
    * @param {*} item
    * @param {*} index
    * @param {*} parentIndex
    * @param {*} indexInParent
    */
    renderItemSellingRejected(item, index, parentIndex, indexInParent) {
        return (
            <ItemNewsSellingVehicle
                data={this.dataRejected}
                item={item}
                isGridView={false}
                index={index}
                onPress={this.onClickItem}
                resource={this.resourceUrlPathResize.textValue}
                user={this.userInfo}
                handleRefresh={this.handleRefresh}
            />
        );
    }

    /**
     * On click item
     */
    onClickItem = (item) => {
        this.props.navigation.navigate("SellingVehicleDetail", {
            vehicleId: item.id,
            urlPathResource: this.resourceUrlPathResize.textValue,
            callBack: () => {
                this.handleRefresh();
            },
            sellerId: item.seller.id
            // screenType: screenType.FROM_SELLING_VEHICLE_GENERAL
        });
    }

    //onRefreshing
    handleRefresh = () => {
        this.dataRejectedTemp = [];
        this.setState({
            refreshing: false
        });
        this.filter.paging.page = 0;
        this.props.getSellingMyPostRejected(this.filter)
    };

    /**
     * Get more testing
     */
    getMoreMyPost = () => {
        if (this.isLoadMore) {
            this.isLoadMore = false;
            this.filter.paging.page += 1;
            this.props.getSellingMyPostRejected(this.filter)
        }
    };

    render() {
        return (
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
                data={this.dataRejected}
                itemPerCol={1}
                renderItem={this.renderItemSellingRejected.bind(this)}
                showsVerticalScrollIndicator={false}
                enableRefresh={this.state.enableRefresh}
                refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.handleRefresh} />}
                enableLoadMore={this.state.enableLoadMore}
                onLoadMore={() => {
                    this.getMoreMyPost();
                }}
                isShowEmpty={this.showNoData}
                isShowImageEmpty={true}
                textForEmpty={localizes('myPost.noData')}
                styleEmpty={{
                    marginTop: Constants.MARGIN_LARGE
                }}
            />
        );
    }
}
const mapStateToProps = state => ({
    data: state.myPost.data,
    isLoading: state.myPost.isLoading,
    error: state.myPost.error,
    errorCode: state.myPost.errorCode,
    action: state.myPost.action
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FlatListReject);
