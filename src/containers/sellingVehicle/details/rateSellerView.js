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
import ItemRate from "../items/ItemRate";
import StarRating from 'react-native-star-rating';
import ModalEvaluate from "./modalEvaluate";
import ItemRateChart from "../items/ItemRateChart";
import { Fonts } from "values/fonts";
import StorageUtil from "utils/storageUtil";

const { ModuleWithEmitter } = NativeModules;
const screen = Dimensions.get("window");
const IS_ANDROID = Platform.OS === 'android';
const eventEmitter = new NativeEventEmitter(ModuleWithEmitter);
const LIST_VIEW = 1;

class RateSellerView extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            isHide: false,
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            isHadRate: true,
            isSeller: true
        };
        const { seller, resourceUrlPath, star, countRate, callBack } = this.props.navigation.state.params;
        this.callBack = callBack;
        this.seller = seller;
        this.resourceUrlPath = resourceUrlPath;
        this.star = star;
        this.countRate = 0;
        this.data = [];
        this.dataTemp = [];
        this.dataRate = [
            { star: 1, amount: 0 },
            { star: 2, amount: 0 },
            { star: 3, amount: 0 },
            { star: 4, amount: 0 },
            { star: 5, amount: 0 }
        ];
        this.dataRateTemp = [];
        this.filter = {
            sellerId: this.seller.id,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            }
        },

            this.amountOfFive = 0;
        this.amountOfFour = 0;
        this.amountOfThree = 0;
        this.amountOfTwo = 0;
        this.amountOfOne = 0;
        this.maxAmount = 0;
        this.idUserRate = [];
    }

    componentDidMount() {
        const { navigation } = this.props;
        this.handleRequest();
        this.getSourceUrlPath();
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            if (!Utils.isNull(user)) {
                if (this.seller.id == user.id) {
                    this.setState({ isSeller: true })
                } else {
                    this.setState({ isSeller: false })
                }
            }
        }).catch(error => {
            this.saveException(error, 'handleData')
        });
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
     * Handle request
     */
    handleRequest() {
        this.props.getRatingSeller(this.filter);
        this.props.getRating(this.seller.id);
        this.props.getSellerInfo(this.seller.id)
    }

    /**
     * On refresh
     */
    handleRefresh = () => {
        this.data = [];
        this.countRate = 0;
        this.dataRate = [
            { star: 1, amount: 0 },
            { star: 2, amount: 0 },
            { star: 3, amount: 0 },
            { star: 4, amount: 0 },
            { star: 5, amount: 0 }
        ];
        this.handleRequest();
    };

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_RATING_SELLER)) {
                    this.state.refreshing = false;
                    if (!Utils.isNull(data.data)) {
                        this.dataTemp = [];
                        this.countRate = data.data.length;

                        if (data.data.length == Constants.PAGE_SIZE) {
                            this.enableLoadMore = true;
                        } else {
                            this.enableLoadMore = false;
                        }
                        data.data.forEach(element => {
                            this.dataTemp.push({ ...element });
                            this.idUserRate.push(element.reviewer.id)
                        });
                        this.data = this.dataTemp;
                        this.showNoData = false;
                        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
                            if (!Utils.isNull(user)) {
                                if (this.idUserRate.indexOf(user.id) == -1) {
                                    this.setState({ isHadRate: false })
                                } else {
                                    this.setState({ isHadRate: true })
                                }
                            }
                        }).catch(error => {
                            this.saveException(error, 'handleData')
                        });
                    }
                    // else if (this.state.isSeller) {
                    //     this.setState({ isHadRate: false, isSeller: false })
                    // }
                    else { this.setState({ isHadRate: false }) }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_RATING)) {
                    if (!Utils.isNull(data)) {
                        this.dataRateTemp = data;
                        this.dataRateDEMOTemp = data;

                        this.amountOfFive = !Utils.isNull(data[0]) ? data[0].amount : 0;
                        this.amountOfFour = !Utils.isNull(data[1]) ? data[1].amount : 0;
                        this.amountOfThree = !Utils.isNull(data[2]) ? data[2].amount : 0;
                        this.amountOfTwo = !Utils.isNull(data[3]) ? data[3].amount : 0;
                        this.amountOfOne = !Utils.isNull(data[4]) ? data[4].amount : 0;

                        this.maxAmount = Math.max(this.amountOfFive,
                            this.amountOfFour,
                            this.amountOfThree,
                            this.amountOfTwo,
                            this.amountOfOne);

                        this.dataRateTemp.forEach(item => {
                            this.dataRate[item.star - 1].amount = item.amount;
                        })
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_SELLER_INFO)) {
                    if (!Utils.isNull(data)) {
                        this.seller = data;
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    /**
     * Open modal Week
     */
    openModalEvaluate() {
        this.refs.modalEvaluate.showModal();
    }

    /**
     * On back
     */
    onBack = () => {
        if (this.props.navigation) {
            if (this.callBack != null) {
                this.callBack();
            }
            this.props.navigation.goBack();
        }
    }

    render() {
        return (
            <Container style={[styles.container, { backgroundColor: Colors.COLOR_WHITE }]}>
                <Root>
                    <View style={{ flexGrow: 1 }}>
                        {/* {Header home view} */}
                        <Header style={[commonStyles.header, { backgroundColor: Colors.COLOR_PRIMARY }]}>
                            {this.renderHeaderView({
                                onBack: this.onBack,
                                title: 'Đánh giá',
                                visibleStage: false,
                                titleStyle: { color: Colors.COLOR_WHITE },
                                renderRightMenu: this.renderRightHeader
                            })}
                        </Header>
                        <Content>
                            <View style={[{ marginHorizontal: Constants.MARGIN_X_LARGE }]}>
                                <View style={{ ...commonStyles.viewHorizontal }}>
                                    <View style={{ flex: 1 }}>
                                        <FlatListCustom
                                            keyExtractor={item => item.code}
                                            contentContainerStyle={{
                                                paddingVertical: Constants.PADDING_LARGE
                                            }}
                                            style={{
                                                flex: 1, backgroundColor: Colors.COLOR_WHITE
                                            }}
                                            horizontal={false}
                                            data={this.dataRate}
                                            itemPerCol={1}
                                            renderItem={this.renderItemRateChart.bind(this)}
                                            showsVerticalScrollIndicator={false}
                                            // enableRefresh={this.state.enableRefresh}
                                            // refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.handleRefresh} />}
                                            // enableLoadMore={this.state.enableLoadMore}
                                            // onLoadMore={() => {
                                            //     this.getMoreMyPost();
                                            // }}
                                            // isShowEmpty={this.showNoData}
                                            isShowImageEmpty={true}
                                            // textForEmpty={'Không có đánh giá nào'}
                                            styleEmpty={{
                                                marginTop: Constants.MARGIN_LARGE
                                            }}
                                        />
                                    </View>
                                    <View>
                                        <Text style={{
                                            ...commonStyles.textBold,
                                            fontSize: 40, textAlign: 'center'
                                        }}>{this.seller.star}</Text>
                                        <View style={[commonStyles.viewCenter, {}]}>
                                            <StarRating
                                                iconSet={'MaterialIcons'}
                                                fullStar={'star'}
                                                halfStar={'star-half'}
                                                emptyStar={'star'}
                                                emptyStarColor={'#A0A5AF'}
                                                fullStarColor={Colors.COLOR_GOLD}
                                                starSize={Fonts.FONT_SIZE_MEDIUM}
                                                disabled={true}
                                                maxStars={5}
                                                rating={this.seller.star}
                                                starStyle={{ margin: 0 }}
                                            />
                                        </View>
                                        <Text style={[commonStyles.text, { margin: 0, textAlign: 'center' }]}>{this.countRate > 0 ? `${this.countRate} đánh giá` : `Chưa có đánh giá`}</Text>
                                    </View>
                                </View>

                                <Text style={[commonStyles.textBold, { margin: 0 }]}>Đánh giá</Text>
                                <View style={[{
                                    borderWidth: 1,
                                    borderColor: Colors.COLOR_BACKGROUND,
                                    marginTop: Constants.PADDING_LARGE
                                }]}></View>
                                <View style={{ flex: 1 }}>
                                    <FlatListCustom
                                        keyExtractor={item => item.code}
                                        contentContainerStyle={{
                                            paddingVertical: Constants.PADDING_LARGE
                                        }}
                                        style={{
                                            flex: 1, backgroundColor: Colors.COLOR_WHITE
                                        }}
                                        horizontal={false}
                                        data={this.data}
                                        itemPerCol={1}
                                        renderItem={this.renderItem.bind(this)}
                                        showsVerticalScrollIndicator={false}
                                        enableRefresh={this.state.enableRefresh}
                                        refreshControl=
                                        {
                                            <RefreshControl
                                                refreshing={this.state.refreshing}
                                                onRefresh={this.handleRefresh}
                                            />
                                        }
                                        enableLoadMore={this.state.enableLoadMore}
                                        onLoadMore={() => {
                                            this.getMoreData();
                                        }}
                                        isShowEmpty={this.showNoData}
                                        isShowImageEmpty={true}
                                        textForEmpty={'Không có đánh giá nào'}
                                        styleEmpty={{
                                            marginTop: Constants.MARGIN_LARGE
                                        }}
                                    />
                                </View>
                            </View>
                        </Content>
                        {this.state.isSeller ? null :
                            (this.state.isHadRate ? null :
                                <View style={{ position: "relative", bottom: 0, left: 0, right: 0, backgroundColor: Colors.COLOR_TRANSPARENT }}>
                                    {
                                        this.renderCommonButton(
                                            'Viết đánh giá',
                                            {
                                                color: Colors.COLOR_WHITE, marginLeft: Constants.MARGIN_X_LARGE,
                                            },
                                            {
                                                backgroundColor: Colors.COLOR_PRIMARY,
                                                marginHorizontal: Constants.PADDING_X_LARGE
                                            },
                                            () => {
                                                this.openModalEvaluate();
                                                this.setState({ isHide: true })
                                            }
                                        )
                                    }
                                </View>
                            )
                        }
                        {!this.state.enableLoadMore ? this.showLoadingBar(this.props.isLoading) : null}
                    </View>
                    <ModalEvaluate
                        ref={'modalEvaluate'}
                        parentView={this}
                        sendRate={(starCount, content) => {
                            this.props.rateSeller({
                                sellerId: this.seller.id,
                                review: content,
                                star: starCount
                            })
                            setTimeout(() => {
                                this.handleRefresh();
                                this.callBack;
                            }, 1000)
                        }}
                    />
                </Root>
            </Container>
        );
    }

    /**
     * Get more data
     */
    getMoreData = () => {
        if (this.isLoadMore) {
            this.isLoadMore = false
            this.filter.paging.page += 1
            this.props.getRatingSeller(this.filter);
        }
    }

    /**
    * Render item rate chart
    * @param {*} item
    * @param {*} index
    * @param {*} parentIndex
    * @param {*} indexInParent
    */
    renderItemRateChart(item, index, parentIndex, indexInParent) {
        return (
            <ItemRateChart
                data={this.dataRate}
                item={item}
                index={index}
                maxAmount={this.maxAmount}
                per={item.amount / this.maxAmount}
            />
        );
    }

    /**
    * Render item 
    * @param {*} item
    * @param {*} index
    * @param {*} parentIndex
    * @param {*} indexInParent
    */
    renderItem(item, index, parentIndex, indexInParent) {
        return (
            <ItemRate
                data={this.data}
                item={item}
                index={index}
                resourceUrlPath={!Utils.isNull(this.resourceUrlPath.textValue) ? this.resourceUrlPath.textValue : null}
            />
        );
    }

}

const mapStateToProps = state => ({
    data: state.rateSeller.data,
    isLoading: state.rateSeller.isLoading,
    error: state.rateSeller.error,
    errorCode: state.rateSeller.errorCode,
    action: state.rateSeller.action
});

const mapDispatchToProps = {
    ...userActions
};

export default connect(mapStateToProps, mapDispatchToProps)(RateSellerView);
