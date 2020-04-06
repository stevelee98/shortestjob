import React, { Component } from 'react';
import {
    View, Text, ImageBackground, ScrollView, RefreshControl, TouchableOpacity, UIManager, LayoutAnimation,
    Image, TextInput, Keyboard, Animated, ActivityIndicator, Platform, BackHandler, Dimensions
} from 'react-native';
import BaseView from 'containers/base/baseView';
import styles from './styles';
import { Header, Container, Root, Title, Left, Body, Right, Content } from 'native-base';
import * as vehicleAction from 'actions/vehicleAction';
import * as commonAction from 'actions/commonActions';
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import ic_search_white from 'images/ic_search_white.png';
import ic_close from 'images/ic_close.png';
import ic_list_grey from "images/ic_list_grey.png";
import ic_grid_grey from "images/ic_grid_grey.png";
import ic_filter_grey from "images/ic_filter_grey.png";
import ic_sort_grey from "images/ic_sort_grey.png";
import { Colors } from 'values/colors';
import global from 'utils/global';
import commonStyles from 'styles/commonStyles';
import { Constants } from 'values/constants';
import { Fonts } from 'values/fonts';
import { localizes } from 'locales/i18n';
import FlatListCustom from 'components/flatListCustom';
import ItemNewsSellingVehicle from './items/itemNewsSellingVehicle';
import ItemSellerFilter from './items/itemSellerFilter';
import ModalSortNewsSellingVehicle from './modalSortNewsSellingVehicle';
import sortType from 'enum/sortType';
import listType from 'enum/listType';
import StorageUtil from 'utils/storageUtil';
import statusType from 'enum/statusType';
import Utils from 'utils/utils';
import DateUtil from 'utils/dateUtil';
import bannerType from 'enum/bannerType';
import actionClickBannerType from 'enum/actionClickBannerType';
import itemSellingVehicleType from 'enum/itemSellingVehicleType';
import imageRatio from 'enum/imageRatio';
import screenType from 'enum/screenType';
import ic_down_grey from 'images/ic_down_grey.png';
import areaType from 'enum/areaType';
import ic_cancel_white from "images/ic_cancel_white.png";
import filterType from 'enum/filterType';
import membershipStatus from 'enum/membershipStatus';
import ic_camera_white from "images/ic_camera_white.png";

const screen = Dimensions.get("window");
const MIN_PRICE = 0;
const MAX_PRICE = 100000000000;
const HEADER_MIN_HEIGHT = Platform.OS === 'android' ? 56 : 48;
const HEADER_MAX_HEIGHT = HEADER_MIN_HEIGHT * 2;// set the initial height
const pivotPoint = (a, b) => a - b
const interpolate = (value, opts) => {
    const x = value.interpolate(opts)
    x.toJSON = () => x.__getValue()
    return x
}
if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

class SellingVehicleView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            isGridView: false,
            searchString: null,
            typing: false,
            typingTimeout: 0,
            numColumns: [null],
            placeholder: localizes('sellingView.findByName'),
            province: {
                id: null,
                name: 'Phú Quốc'
            },
            category: {
                id: null,
                name: localizes('sellingView.allOfCategory')
            },
            isActionButtonVisible: true,
            parentCategory: {
                id: null,
                name: null
            },
            typeView: 0,
        };
        const { categoryId, categoryName, isHotProduct, filterSearch, parentCategory, itemChose } = this.props.navigation.state.params
        if (!Utils.isNull(categoryId) && !Utils.isNull(categoryName)) {
            this.state.category.id = categoryId
            this.state.category.name = categoryName
        } else if (!Utils.isNull(filterSearch)) {
            this.state.category.id = filterSearch.categoryId
            this.state.searchString = filterSearch.searchString
        }
        this.parentCategory = parentCategory;
        this.itemChose = itemChose
        this.filter = {
            stringSearch: this.state.searchString,
            minPrice: MIN_PRICE,
            maxPrice: MAX_PRICE,
            province: null,
            typeSort: sortType.DATE_MOST_RECENT,
            typeFilter: filterType.PRODUCT,
            categoryId: this.state.category.id,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            }
        }
        this.bannerFilter = {
            type: bannerType.ADS_BANNER
        }
        this.isBannerList = false;
        this.isBannerGrid = false;
        this.scrollY = new Animated.Value(0);
        this.isLoadMore = true;
        this.userInfo = null;
        this.heightHeader = 0;
        this.dataListTemp = [];
        this.dataGridOneTemp = [];
        this.dataGridTwoTemp = [];
        this.dataNewsSellingVehicle = [];
        this.dataNewsSellingVehicleOne = [];
        this.dataNewsSellingVehicleTwo = [];
        this.bannerList = [];
        this.bannerGrid = [];
        this.showNoData = false;
        this.onChangeTextInput = this.onChangeTextInput.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.renderItemNews = this.renderItemNews.bind(this);
        this.onClickItem = this.onClickItem.bind(this);
        this.toggleListView = this.toggleListView.bind(this);
        this.type = {
            LIKE: 0,
            EDIT: 1,
            DELETE: 2
        }
        this.userData = [];
    }

    componentWillMount() {
        if (!Utils.isNull(this.itemChose)) {
            this.setState({ parentCategory: { id: this.itemChose.hasChild ? this.parentCategory.id : null, name: this.parentCategory.name } })
        }
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        this.getSourceUrlPath();
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            //this callback is executed when your Promise is resolved
            if (!Utils.isNull(user) && user.status == statusType.ACTIVE) {
                this.userInfo = user
            }
        })
            .catch(error => {
                //this callback is executed when your Promise is rejected
                this.saveException(error, 'componentDidMount')
            });
        this.handleRequest();
    }

    // handle request
    handleRequest() {
        this.props.getNewsSellingVehicle(this.filter)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    formatDataList(data, banner) {
        if (!Utils.isNull(banner)) {
            banner.forEach(item => {
                if (item.ratio == imageRatio.RATIO_16_9 ||
                    item.ratio == imageRatio.RATIO_4_3 ||
                    item.ratio == imageRatio.RATIO_3_2) {
                    this.bannerList.push({ ...item, itemType: itemSellingVehicleType.ITEM_BANNER })
                }
            })
            // data.splice(Math.floor(Math.random() * data.length), 0, this.bannerList[this.filter.paging.page])
            if (!this.isBannerList) {
                this.isBannerList = true
                !Utils.isNull(this.bannerList[0]) ? data.splice(0, 0, this.bannerList[0]) : null
            }
        }
        return data
    }

    formatDataGrid(data, banner) {
        if (!Utils.isNull(banner)) {
            banner.forEach(item => {
                if (item.ratio == imageRatio.RATIO_1 ||
                    item.ratio == imageRatio.RATIO_9_16 ||
                    item.ratio == imageRatio.RATIO_3_4 ||
                    item.ratio == imageRatio.RATIO_2_3) {
                    this.bannerGrid.push({ ...item, itemType: itemSellingVehicleType.ITEM_BANNER })
                }
            })
            // data.splice(Math.floor(Math.random() * data.length), 0, this.bannerList[this.filter.paging.page])
            if (!this.isBannerGrid) {
                this.isBannerGrid = true
                !Utils.isNull(this.bannerGrid[0]) ? data.splice(0, 0, this.bannerGrid[0]) : null
            }
        }
        return data
    }

    /**
     * Handle data when request
     */
    handleData() {
        console.log("RENDER FILTER: ", this.filter)

        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_NEWS_SELLING_VEHICLE)) {
                    console.log("DATA NEWS: ", data)
                    if (!Utils.isNull(data)) {

                        this.userData = data.userData;

                        if (data.vehicleData.length < Constants.PAGE_SIZE) {
                            this.state.enableLoadMore = false
                        } else {
                            this.state.enableLoadMore = true
                        }
                        let dataVehicle = []
                        let dataVehicleOne = []
                        let dataVehicleTwo = []

                        this.dataNewsSellingVehicle = []
                        this.dataNewsSellingVehicleOne = []
                        this.dataNewsSellingVehicleTwo = []

                        this.bannerGrid = []
                        this.bannerList = []

                        data.vehicleData.forEach((item, index) => {
                            dataVehicle.push({ ...item, itemType: itemSellingVehicleType.ITEM_SELLING_VEHICLE })
                            if (index % 2 == 0) {
                                dataVehicleOne.push({ ...item, itemType: itemSellingVehicleType.ITEM_SELLING_VEHICLE })
                            } else {
                                dataVehicleTwo.push({ ...item, itemType: itemSellingVehicleType.ITEM_SELLING_VEHICLE })
                            }
                        });
                        this.dataListTemp.push(...this.formatDataList(dataVehicle, data.bannerData))
                        this.dataNewsSellingVehicle = this.dataListTemp
                        this.dataGridOneTemp.push(...this.formatDataGrid(dataVehicleOne, data.bannerData))
                        this.dataNewsSellingVehicleOne = this.dataGridOneTemp
                        this.dataGridTwoTemp.push(...this.formatDataGrid(dataVehicleTwo, []))
                        this.dataNewsSellingVehicleTwo = this.dataGridTwoTemp
                        if (data.vehicleData.length < Constants.PAGE_SIZE) {
                            this.isLoadMore = false
                        } else {
                            this.isLoadMore = true
                        }
                    }
                    this.showNoData = true;
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    /**
     * Toggle List View
     */
    toggleListView() {
        this.setState({
            isGridView: !this.state.isGridView
        }, () => {
            if (this.state.isGridView) {
                this.setState({
                    numColumns: [null, null]
                })
            } else {
                this.setState({
                    numColumns: [null]
                })
            }
        })
    }

    //onRefreshing
    handleRefresh() {
        this.filter.paging.page = 0
        this.resetData()
        this.handleRequest()
    }

    /**
     * On back
     */
    onBack() {
        if (this.props.navigation) {
            this.props.navigation.goBack()
            global.idChoose = 0;
            global.idGeneralChoose = 0;
        }
    }

    /**
     * Load more
     */
    loadMoreNews = async () => {
        if (this.isLoadMore) {
            this.isLoadMore = false
            this.filter.paging.page += 1
            this.props.getNewsSellingVehicle(this.filter)
        }
    }


    /**
     * Render (load more)
     */
    renderLoadingLoadMore = () => {
        return (
            <View
                style={{ marginBottom: Constants.MARGIN_X_LARGE, marginTop: -Constants.MARGIN_24 }}>
                <ActivityIndicator color={Colors.COLOR_PRIMARY} animating size="large" />
            </View>
        )
    }

    /**
     * Manager text input search 
     * @param {*} searchString 
     */
    onChangeTextInput(searchString) {
        const self = this;
        if (self.state.typingTimeout) {
            clearTimeout(self.state.typingTimeout);
        }
        self.setState({
            searchString: searchString,
            typing: false,
            typingTimeout: setTimeout(() => {
                this.filter.stringSearch = searchString
                this.filter.paging.page = 0
                this.onSearch(this.filter)
            }, 1000),
        });
    }

    // Reset data
    resetData() {
        this.isLoadMore = true;
        this.dataListTemp = [];
        this.dataGridOneTemp = [];
        this.dataGridTwoTemp = [];
        this.bannerList = [];
        this.bannerGrid = [];
        this.isBannerList = false;
        this.isBannerGrid = false;
    }

    renderStickyHeader() {
        const { scrollY } = this
        const p = pivotPoint(HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT)
        return (
            <View style={[styles.fixedHeader, { marginHorizontal: Constants.MARGIN_LARGE + Constants.MARGIN }]} >
                <Animated.View
                    style={[
                        styles.fixedHeader,
                        {
                            height: HEADER_MIN_HEIGHT,
                            // opacity: true
                            //     ? interpolate(scrollY, {
                            //         inputRange: [0, p * (1 / 2), p * (3 / 4), p],
                            //         outputRange: [1, 0.3, 0.1, 0],
                            //         extrapolate: 'clamp'
                            //     })
                            //     : 1
                        }
                    ]}
                >
                    {this.renderSearchBar()}
                </Animated.View>
                {/* <Animated.View
                    pointerEvents="box-none"
                    style={[{
                        opacity: interpolate(scrollY, {
                            inputRange: [0, p],
                            outputRange: [1, 1],
                            extrapolate: 'clamp'
                        })
                    }]}
                >
                    <Animated.View
                        style={{
                            transform: [
                                {
                                    translateY: interpolate(scrollY, {
                                        inputRange: [0, p],
                                        outputRange: [HEADER_MIN_HEIGHT, 0],
                                        extrapolate: 'clamp'
                                    })
                                }
                            ]
                        }}
                    >
                        {this.renderToolbar()}
                    </Animated.View>
                </Animated.View> */}
            </View>
        )
    }

    /**
     * Is scroll to end
     */
    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
    }

    render() {
        console.log("RENDER SELLING VEHICLE VIEW", this.userData)

        const { isGridView, numColumns, enableRefresh, enableLoadMore } = this.state
        let height = (Platform.OS === 'ios') ? Constants.STATUS_BAR_HEIGHT : 0
        return (
            //<MyApp />
            <Container style={styles.container}>
                <Root>
                    <View style={{ flexGrow: 1 }}>
                        {/* {Header home view} */}
                        <Header style={commonStyles.header}>
                            {this.renderStickyHeader()}
                        </Header>
                        <View style={{
                            ...commonStyles.shadowOffset,
                            paddingHorizontal: Constants.PADDING_LARGE + Constants.PADDING,
                            backgroundColor: Colors.COLOR_WHITE
                        }}>
                            {this.renderToolbar()}
                        </View>
                        <Content style={{ marginTop: 0 }}
                            showsVerticalScrollIndicator={false}
                            onScroll={(this.state.typeView == filterType.PRODUCT) ? Animated.event(
                                [{
                                    nativeEvent: { contentOffset: { y: this.scrollY } }
                                }],
                                {
                                    listener: (event) => {
                                        if (this.isCloseToBottom(event.nativeEvent)) {
                                            this.loadMoreNews()
                                        }

                                        this.offsetY = event.nativeEvent.contentOffset.y
                                        if (this.offsetY > screen.width + Constants.MARGIN_XX_LARGE) {
                                            this.setState({
                                                opacity: 1
                                            })
                                        } else {
                                            this.setState({
                                                opacity: 0
                                            })
                                        }

                                        const CustomLayoutLinear = {
                                            duration: 150,
                                            create: {
                                                type: LayoutAnimation.Types.spring,
                                                property: LayoutAnimation.Properties.scaleY,
                                                springDamping: 0.7
                                            },
                                            delete: {
                                                type: LayoutAnimation.Types.linear,
                                                property: LayoutAnimation.Properties.opacity,
                                                // springDamping: 0.7
                                            },
                                            //update: { type: LayoutAnimation.Types.keyboard },

                                        }
                                        const currentOffset = event.nativeEvent.contentOffset.y
                                        const direction = (currentOffset > 0 && currentOffset > this.listViewOffset)
                                            ? 'down'
                                            : 'up'
                                        const isActionButtonVisible = direction === 'up'
                                        if (isActionButtonVisible !== this.state.isActionButtonVisible) {
                                            LayoutAnimation.configureNext(CustomLayoutLinear)
                                            this.setState({ isActionButtonVisible })
                                        }

                                        this.listViewOffset = currentOffset

                                    }
                                },
                                { useNativeDriver: true }
                            ) : null}
                            enableRefresh={enableRefresh}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.handleRefresh}
                                />
                            }>
                            {/* List news selling vehicle */}
                            {(this.state.typeView == filterType.PRODUCT) &&
                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    {numColumns.map((col, index) => {
                                        return (
                                            <FlatListCustom
                                                key={index}
                                                style={{
                                                    paddingVertical: Constants.PADDING_LARGE,
                                                }}
                                                keyExtractor={(item) => item.id}
                                                horizontal={false}
                                                data={!isGridView
                                                    ? this.dataNewsSellingVehicle : index == 0
                                                        ? this.dataNewsSellingVehicleOne : this.dataNewsSellingVehicleTwo
                                                }
                                                itemPerCol={1}
                                                renderItem={this.renderItemNews.bind(this, index)}
                                                showsHorizontalScrollIndicator={false}
                                                isShowEmpty={this.showNoData}
                                                isShowImageEmpty={true}
                                                textForEmpty={localizes('sellingView.noSellingItem')}
                                                styleEmpty={{
                                                    marginTop: Constants.MARGIN_LARGE
                                                }}
                                            />
                                        )
                                    })}
                                </View>}


                            {/* List user filter */}
                            {(this.state.typeView == filterType.SELLER) &&
                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    {numColumns.map((col, index) => {
                                        return (
                                            <FlatListCustom
                                                key={index}
                                                style={{
                                                    paddingVertical: Constants.PADDING_LARGE,
                                                }}
                                                keyExtractor={(item) => item.id}
                                                horizontal={false}
                                                data={this.userData}
                                                itemPerCol={1}
                                                renderItem={this.renderItemSellerFilter.bind(this, index)}
                                                showsHorizontalScrollIndicator={false}
                                                isShowEmpty={this.showNoData}
                                                isShowImageEmpty={true}
                                                textForEmpty={localizes('sellingView.noSellingItem')}
                                                styleEmpty={{
                                                    marginTop: Constants.MARGIN_LARGE
                                                }}
                                            />)
                                    })}
                                </View>}

                            {/* {enableLoadMore ? this.renderLoadingLoadMore() : null} */}
                        </Content>
                        {this.state.isActionButtonVisible && this.state.typeView == filterType.PRODUCT
                            ? this.renderBtnSelling()
                            : null
                        }
                        {this.isLoadMore ? this.showLoadingBar(this.props.isLoading) : null}
                    </View>
                </Root>
            </Container >
        );
    }

    /**
     * Render btn selling
     */
    renderBtnSelling() {
        return (
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
                {
                    this.renderCommonButton(
                        'Đăng tin',
                        {
                            color: Colors.COLOR_WHITE, marginLeft: Constants.MARGIN_X_LARGE,
                        },
                        {
                            backgroundColor: Colors.COLOR_PRIMARY,
                            marginHorizontal: Constants.PADDING_X_LARGE * 5,
                        },
                        () => {
                            StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
                                //this callback is executed when your Promise is resolved
                                if (!Utils.isNull(user)) {
                                    this.props.navigation.navigate("PostNews", { screenType: screenType.FROM_HOME_VIEW })
                                } else {
                                    this.showLoginView({
                                        routeName: "PostNews",
                                        params: { screenType: screenType.FROM_HOME_VIEW }
                                    })
                                }
                            })

                        },
                        ic_camera_white
                    )
                }
            </View>
        )
    }


    /**
     * Render search bar
     */
    renderSearchBar = () => {
        return (
            <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter]}>
                {this.renderHeaderView({
                    visibleStage: false,
                    title: "",
                    visibleSearchBar: true,
                    visibleCart: false,
                    editable: false,
                    quantityCart: this.quantityCart,
                    showCart: this.showCart,
                    placeholder: !Utils.isNull(this.state.searchString)
                        ? '"' + this.state.searchString + '"'
                        : this.state.placeholder,
                    iconRightSearch: Utils.isNull(this.state.searchString) ? ic_search_white : ic_cancel_white,
                    onTouchStart: this.showSearch,
                    onPressRightSearch: this.showSearch
                })}
            </View>
        )
    }

    /**
     * Show search
     */
    showSearch = () => {
        if (Utils.isNull(this.state.searchString)) {
            this.props.navigation.navigate("SearchSelling", {
                categoryId: this.state.category.id,
                categoryName: this.state.category.name,
                callBack: this.onSearch.bind(this)
            })
        } else {
            this.onSearch(this.filter)
        }
    }

    /**
     * On search
     */
    onSearch(filter) {
        this.setState({ searchString: filter.searchString })
        this.filter.stringSearch = filter.searchString
        this.resetData()
        this.onChangeCategory(filter.categoryId, filter.categoryName)
    }

    /**
     * Render toolbar
     */
    renderToolbar = () => {
        const { isGridView, province, category } = this.state
        return (
            <View style={{ flexDirection: 'row', height: Constants.NAV_HEIGHT, backgroundColor: Colors.COLOR_WHITE }}>
                <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPress={this.gotoProvince}>
                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} ellipsizeMode={"tail"} style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_XX_SMALL }]}>
                            {province.name}
                        </Text>
                    </View>
                    <Image style={{ marginRight: Constants.MARGIN_LARGE, marginTop: 2 }} source={ic_down_grey} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPress={this.gotoCategory}>
                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} ellipsizeMode={"tail"} style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_XX_SMALL }]}>
                            {category.name}
                        </Text>
                    </View>
                    <Image style={{ marginRight: Constants.MARGIN_LARGE, marginTop: 2 }} source={ic_down_grey} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={this.gotoFilter}>
                    <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_XX_SMALL }]}>Lọc</Text>
                    <Image style={{ marginRight: Constants.MARGIN, marginTop: 2 }} source={ic_down_grey} />
                </TouchableOpacity>
            </View>
        )
    }

    /**
     * Render item
     * @param {*} item
     * @param {*} index
     * @param {*} parentIndex
     * @param {*} indexInParent
     */
    renderItemSellerFilter(indexCol, item, index) {
        let hasHttp = !Utils.isNull(item.avatarPath) && item.avatarPath.indexOf('http') != -1;
        let avatar = hasHttp ? item.avatarPath : this.resourceUrlPathResize.textValue + "=" + item.avatarPath;
        return (
            <ItemSellerFilter
                key={item.id}
                data={this.userData}
                item={item}
                index={index}
                indexCol={indexCol}
                isGridView={this.state.isGridView}
                onPress={() => {
                    this.props.navigation.navigate('InfoSeller', {
                        sellerId: item.id,
                        item: item,
                        avatarSeller: avatar,
                        resourceUrlPathResize: this.resourceUrlPathResize.textValue,
                        user: this.userInfo
                    });
                }}
                resource={this.resourceUrlPath.textValue}
                user={this.userInfo}
                showLogin={this.showLoginViewFromSelling}
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
    renderItemNews(indexCol, item, index) {
        return (
            <ItemNewsSellingVehicle
                key={item.id}
                data={this.dataNewsSellingVehicle}
                banner={!Utils.isNull(this.bannerList) ? this.bannerList : this.bannerGrid}
                item={item}
                index={index}
                indexCol={indexCol}
                isGridView={this.state.isGridView}
                onPress={this.onClickItem}
                resource={this.resourceUrlPathResize.textValue}
                user={this.userInfo}
                showLogin={this.showLoginViewFromSelling}
            />
        );
    }

    /**
     * Show login view
     */
    showLoginViewFromSelling = () => {
        this.showLoginView()
    }

    /**
     * On click item
     */
    onClickItem(item) {
        if (item.itemType == itemSellingVehicleType.ITEM_SELLING_VEHICLE) {
            // if (!Utils.isNull(this.userInfo)) {
            this.props.navigation.navigate("SellingVehicleDetail", {
                user: this.userInfo,
                vehicleId: item.id,
                resourceUrlPathResize: this.resourceUrlPathResize.textValue,
                resourceUrlPath: this.resourceUrlPath.textValue,
                callBack: (type) => {
                    if (type == this.type.LIKE) {
                        item.isFavorite = !item.isFavorite
                        this.setState({ isOk: true })
                    } else if (type == this.type.EDIT || type == this.type.DELETE) {
                        // this.handleRequest
                        this.handleRefresh()
                    }
                },
                callRefresh: this.handleRefresh,
                sellerId: item.seller.id
            })
            // } else { this.showLoginView() }
        } else if (item.itemType == itemSellingVehicleType.ITEM_BANNER) {
            this.handleClickBanner(item)
        }
    }

    /**
     * Choose a province:
     */
    gotoProvince = () => {
        this.props.navigation.navigate("CategoryGeneral", {
            onChangeValue: this.onChangeValueProvince,
            type: areaType.WARD_STRING,
            screen: screenType.FROM_SELLING_VEHICLE_SEEN
        })
    }

    /**
     * Change value province
     */
    onChangeValueProvince = (provinceId, provinceName) => {
        this.setState({
            province: {
                name: !Utils.isNull(provinceId) ? provinceName : "Phú Quốc",
                id: provinceId
            }
        })
        this.state.province.id = provinceId
        this.filter.province = provinceId
        this.resetData()
        this.handleRequest()
    }

    /**
     * Go to category
     */
    gotoCategory = () => {
        this.props.navigation.navigate("ProductCategory", {
            callBack: this.onChangeCategory,
            gotoBack: null,
            parentCategory: this.state.parentCategory,
            sttRequest: 2,
            screen: screenType.FROM_SELLING_VEHICLE_SEEN
        })
    }

    /**
     * Change text category
     */
    onChangeCategory = (categoryId, categoryName, parentCategory) => {
        this.setState({
            category: {
                name: !Utils.isNull(categoryId) ? categoryName : "Tất cả danh mục",
                id: categoryId
            },
            parentCategory
        })
        this.state.category.id = categoryId
        this.filter.categoryId = categoryId
        this.resetData()
        this.handleRequest()
    }

    /**
     * Go to filter
     */
    gotoFilter = () => {
        this.props.navigation.navigate("FilterNewsSellingVehicle", {
            filter: this.filter,
            callBack: this.onChangeFilter
        })
    }

    /**
     * Change filter
     */
    onChangeFilter = (filter) => {
        this.getPlaceholder(filter.typeFilter)
        this.filter.maxPrice = filter.maxPrice
        this.filter.minPrice = filter.minPrice
        this.filter.typeSort = filter.typeSort
        this.filter.typeFilter = filter.typeFilter
        this.resetData()
        this.handleRequest()
    }

    /**
     * Get placeholder
     */
    getPlaceholder(typeFilter) {
        switch (typeFilter) {
            case filterType.PRODUCT:
                this.setState({
                    placeholder: localizes('sellingView.findByName'),
                    typeView: 0
                })
                break;
            case filterType.SELLER:
                this.setState({
                    placeholder: localizes('sellingView.findBySeller'),
                    typeView: 1
                })
                break;
            default:
                break;
        }
    }

    /**
     * Handle click banner
     */
    handleClickBanner(data) {
        switch (data.actionOnClickType) {
            case actionClickBannerType.DO_NOTHING:
                global.openModalBanner(data)
                break;
            case actionClickBannerType.GO_TO_SCREEN:

                break;
            case actionClickBannerType.OPEN_OTHER_APP:
                Linking.openURL('https://www.facebook.com/n/?ToHyun.TQT')
                break;
            case actionClickBannerType.OPEN_URL:
                this.props.navigation.navigate("QuestionAnswer", {
                    actionTarget: data.actionTarget
                })
                break;

            default:
                break;
        }
    }
}

const mapStateToProps = state => ({
    data: state.sellingVehicle.data,
    isLoading: state.sellingVehicle.isLoading,
    error: state.sellingVehicle.error,
    errorCode: state.sellingVehicle.errorCode,
    action: state.sellingVehicle.action
});

const mapDispatchToProps = {
    ...vehicleAction,
    ...commonAction
};

export default connect(mapStateToProps, mapDispatchToProps)(SellingVehicleView);