import React, { Component } from "react";
import { View, Text, ImageBackground, ScrollView, RefreshControl, TouchableOpacity, Image, TextInput, Keyboard, Dimensions, BackHandler } from "react-native";
import BaseView from "containers/base/baseView";
import styles from "./styles";
import { Header, Container, Root, Title, Left, Body, Right, TabHeading, Tabs, Tab } from "native-base";
import * as actions from "actions/vehicleAction";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import ic_search_white from "images/ic_search_white.png";
import ic_list_grey from "images/ic_list_grey.png";
import ic_grid_grey from "images/ic_grid_grey.png";
import ic_filter_grey from "images/ic_filter_grey.png";
import ic_sort_grey from "images/ic_sort_grey.png";
import ic_back_white from "images/ic_back_white.png";
import ic_share_black from "images/ic_share_black.png";
import ic_chat_white from "images/ic_chat_white.png";
import { Colors } from "values/colors";
import global from "utils/global";
import commonStyles from "styles/commonStyles";
import { Constants } from "values/constants";
import { Fonts } from "values/fonts";
import { localizes } from "locales/i18n";
import FlatListCustom from "components/flatListCustom";
import Carousel, { Pagination } from "react-native-snap-carousel";
import ImageLoader from "components/imageLoader";
import ItemNewsSellingVehicleInterest from "../../sellingVehicle/items/itemNewsSellingVehicleInterest";
import StringUtil from "utils/stringUtil";
import DateUtil from "utils/dateUtil";
import Utils from "utils/utils";
import StorageUtil from "utils/storageUtil";
import ItemNewsSellingVehicle from "../../sellingVehicle/items/itemNewsSellingVehicle";
import screenType from "enum/screenType";
import itemSellingVehicleType from "enum/itemSellingVehicleType";
import screenMyPostType from "enum/screenMyPostType";
import FlatListRejected from "./list/flatListRejected";
import FlatListApproved from "./list/flatListApproved";
import FlatListWait from "./list/flatListWait";
import statusType from "enum/statusType";
import FlatListDelete from "./list/flatListDelete";
import cleaningAndWashingType from "enum/cleaningAndWashingType";
import { thisExpression } from "@babel/types";

const screen = Dimensions.get("window");

class MyPostView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            opacity: 0,
            refreshing: false,
            enableRefresh: true,
            activeSlide: 0,
            avatarPath: "",
            enableLoadMore: false,

        };
        const { typeShow } = this.props.navigation.state.params;
        this.title = "";
        this.dataShow = [];
        this.dataTemp = [];
        this.isLoadMore = true;
        this.typeShow = typeShow;
        this.filter = {
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
            userId: null
        };
        this.showNoData = false;
        this.myPostType = {
            APPROVED: 1,
            WAITING: 2,
            DENY: 3,
            DELETED: 4
        }
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);

    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    componentDidMount() {
        this.getSourceUrlPath();
        this.getTitle();
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE)
            .then(user => {
                //this callback is executed when your Promise is resolved
                console.log("user", user);
                if (!Utils.isNull(user)) {
                    this.userInfo = user;
                    this.handleRequest(user);
                } else {
                    this.showLoginView();
                }
            })
            .catch(error => {
                this.saveException(error, "componentWillMount");
            });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    /**
     * Get title
     */
    getTitle() {
        if (this.typeShow == screenMyPostType.MY_POST_LIKED) {
            this.title = "Bài đăng đã thích";
        } else if (this.typeShow == screenMyPostType.MY_POST) {
            this.title = "Bài đăng của tôi";
        }
    }

    // handle request
    handleRequest(user) {
        // this.filter.userId = user.id;
        if (this.typeShow == screenMyPostType.MY_POST_LIKED) {
            this.props.getPostLiked(this.filter);
        }
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_POST_LIKED)) {
                    if (data.data.length < Constants.PAGE_SIZE) {
                        this.state.enableLoadMore = false;
                    } else {
                        this.state.enableLoadMore = true;
                    }
                    if (data.data.length > 0) {
                        data.data.forEach((item, index) => {
                            this.dataTemp.push({ ...item, itemType: itemSellingVehicleType.ITEM_SELLING_VEHICLE });
                        });
                        this.dataShow = this.dataTemp;
                    } else {
                        this.dataShow = [];
                    }
                    this.isLoadMore = true;
                    this.showNoData = true;
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    //onRefreshing
    handleRefresh = () => {
        this.dataTemp = [];
        this.setState({
            refreshing: false
        });
        this.filter.paging.page = 0;
        if (this.typeShow == screenMyPostType.MY_POST_LIKED) {
            this.props.getPostLiked(this.filter);
        }
    };

    /**
     * Render item
     * @param {*} item
     * @param {*} index
     * @param {*} parentIndex
     * @param {*} indexInParent
     */
    renderItemSellingVehicle(item, index, parentIndex, indexInParent) {
        return (
            <ItemNewsSellingVehicle
                data={this.state.dataShow}
                item={item}
                index={index}
                isGridView={false}
                onPress={this.onClickItem}
                resource={this.resourceUrlPathResize.textValue}
                user={this.userInfo}
                // handleRefresh={this.handleRefresh}
                callBack={this.callBack}
            />
        );
    }

    /**
     * Call back
     */
    callBack = (item) => {
        item.isFavorite = !item.isFavorite;
        this.props.likePost({
            tableId: item.id,
            isFavorite: item.isFavorite
        })
        let temps = this.dataShow
        var i = temps.indexOf(item)
        temps.splice(i, 1);
        this.setState({
            dataShow: temps
        })
        this.dataShow = temps
        console.log("IMAGE DATA: ", this.dataShow)
    }

    /**
     * On click item
     */
    onClickItem = (item) => {
        this.props.navigation.navigate("SellingVehicleDetail", {
            user: this.userInfo,
            vehicleId: item.id,
            resourceUrlPathResize: this.resourceUrlPathResize.textValue,
            callBack: () => {
                this.handleRefresh();
            },
            screenType: screenType.FROM_SELLING_VEHICLE_GENERAL
        });
    }

    /**
     * You may be interested
     */
    renderSellingVehicleLike = () => {
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
                data={this.dataShow}
                itemPerCol={1}
                renderItem={this.renderItemSellingVehicle.bind(this)}
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
    };

    /**
     * Get more testing
     */
    getMoreMyPost = () => {
        if (this.isLoadMore) {
            this.isLoadMore = false;
            this.filter.paging.page += 1;
            if (this.typeShow == screenMyPostType.MY_POST_LIKED) {
                this.props.getPostLiked(this.filter);
            }
        }
    };

    render() {
        return (
            // <MyApp />
            <Container style={styles.container}>
                <Root>
                    {/* {Header home view} */}
                    <Header hasTabs style={[commonStyles.header, { backgroundColor: Colors.COLOR_PRIMARY }]}>
                        {this.renderHeaderView({
                            title: this.title,
                            visibleStage: false,
                            titleStyle: { color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightHeader
                        })}
                    </Header>
                    {this.typeShow != screenMyPostType.MY_POST_LIKED
                        ?
                        <Tabs locked={false} tabBarUnderlineStyle={{ backgroundColor: Colors.COLOR_PRIMARY }}>
                            <Tab heading={
                                <TabHeading style={{ backgroundColor: Colors.COLOR_WHITE }}>
                                    <Text style={[commonStyles.text, { color: Colors.COLOR_PRIMARY, fontWeight: 'normal' }]}>{localizes('userProfileView.posting')}</Text>
                                </TabHeading>
                            }>
                                <FlatListApproved
                                    navigation={this.props.navigation}
                                    numScreen={this.myPostType.APPROVED}
                                />
                            </Tab>
                            {/* <Tab2 /> */}
                            <Tab heading={
                                <TabHeading style={{ backgroundColor: Colors.COLOR_WHITE }}
                                >
                                    <Text style={[commonStyles.text, { color: Colors.COLOR_PRIMARY, fontWeight: 'normal' }]}>{localizes('userProfileView.waiting')}</Text>
                                </TabHeading>
                            }>
                                <FlatListWait
                                    navigation={this.props.navigation}
                                    numScreen={this.myPostType.WAITING}
                                />
                            </Tab>
                            {/* <Tab3 /> */}
                            <Tab heading={
                                <TabHeading style={{ backgroundColor: Colors.COLOR_WHITE }}>
                                    <Text style={[commonStyles.text, { color: Colors.COLOR_PRIMARY, fontWeight: 'normal' }]}>{localizes('userProfileView.deny')}</Text>
                                </TabHeading>
                            }>
                                {/* {this.renderSellingRejected()} */}
                                <FlatListRejected
                                    navigation={this.props.navigation}
                                    numScreen={this.myPostType.DENY}
                                />
                            </Tab>
                            {/* <Tab4 /> */}
                            <Tab heading={
                                <TabHeading style={{ backgroundColor: Colors.COLOR_WHITE }}>
                                    <Text style={[commonStyles.text, { color: Colors.COLOR_PRIMARY, fontWeight: 'normal' }]}>{localizes('userProfileView.deleted')}</Text>
                                </TabHeading>
                            }>
                                {/* {this.renderSellingRejected()} */}
                                <FlatListDelete
                                    navigation={this.props.navigation}
                                    numScreen={this.myPostType.DELETED}
                                />
                            </Tab>
                        </Tabs>
                        :
                        this.renderSellingVehicleLike()
                    }
                    {!this.state.enableLoadMore ? this.showLoadingBar(this.props.isLoading) : null}
                </Root>
            </Container>
        );
    }

    /**
     * Render toolbar
     */
    renderToolbar = () => {
        return (
            <View
                style={[
                    commonStyles.viewHorizontal,
                    commonStyles.viewCenter,
                    {
                        paddingHorizontal: Constants.PADDING_LARGE
                    }
                ]}
            >
                <TouchableOpacity
                    style={{ paddingRight: Constants.PADDING_X_LARGE }}
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => {
                        this.onBack();
                    }}
                >
                    <Image source={ic_back_white} />
                </TouchableOpacity>
                <View
                    style={[
                        commonStyles.viewCenter,
                        {
                            flex: 1
                        }
                    ]}
                >
                    <Text
                        numberOfLines={1}
                        style={{
                            textAlign: "center",
                            margin: 0,
                            padding: 0,
                            color: Colors.COLOR_WHITE,
                            fontSize: Fonts.FONT_SIZE_LARGE,
                            margin: Constants.MARGIN
                        }}
                    >
                        {this.title}
                    </Text>
                </View>
                <TouchableOpacity style={{ paddingLeft: Constants.PADDING_X_LARGE }} activeOpacity={Constants.ACTIVE_OPACITY}>
                    <Image source={ic_share_black} opacity={0} />
                </TouchableOpacity>
            </View>
        );
    };
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
)(MyPostView);
