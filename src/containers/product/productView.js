import React, { Component } from 'react';
import {
    View, Text, ImageBackground, ScrollView, RefreshControl, TouchableOpacity,
    Image, TextInput, Keyboard, Animated, ActivityIndicator, BackHandler
} from 'react-native';
import BaseView from 'containers/base/baseView';
import styles from './styles';
import { Header, Container, Root, Title, Left, Body, Right, Content } from 'native-base';
import * as productActions from 'actions/productActions';
import * as commonActions from 'actions/commonActions'
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import ic_search_white from 'images/ic_search_white.png';
import ic_list_grey from "images/ic_list_grey.png";
import ic_grid_grey from "images/ic_grid_grey.png";
import ic_filter_grey from "images/ic_filter_grey.png";
import ic_sort_grey from "images/ic_sort_grey.png";
import ic_home_white from 'images/ic_home_white.png';
import ic_cart_grey from 'images/ic_cart_grey.png';
import ic_down_grey from 'images/ic_down_grey.png';
import { Colors } from 'values/colors';
import global from 'utils/global';
import commonStyles from 'styles/commonStyles';
import { Constants } from 'values/constants';
import { Fonts } from 'values/fonts';
import { localizes } from 'locales/i18n';
import FlatListCustom from 'components/flatListCustom';
import sortType from 'enum/sortType';
import listType from 'enum/listType';
import StorageUtil from 'utils/storageUtil';
import statusType from 'enum/statusType';
import Utils from 'utils/utils';
import ItemProduct from './itemProduct';
import ModalFilterProduct from './modal/modalFilterProduct';
import ModalSortProduct from './modal/modalSortProduct';
import screenType from 'enum/screenType';
import areaType from 'enum/areaType';

const MIN_PRICE = 0;
const MAX_PRICE = 100000000000;
const HEADER_MIN_HEIGHT = 56;// set the height on scroll
const HEADER_MAX_HEIGHT = HEADER_MIN_HEIGHT * 2;// set the initial height
const pivotPoint = (a, b) => a - b
const interpolate = (value, opts) => {
    const x = value.interpolate(opts)
    x.toJSON = () => x.__getValue()
    return x
}

const COLUMNS_GRID = 2
const COLUMNS_LIST = 1

class ProductView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            isShowFilter: false,
            isShowSort: false,
            isGridView: true,
            searchString: '',
            province: {
                id: null,
                name: 'Chọn thành phố'
            },
            category: {
                id: null,
                name: 'Tất cả danh mục'
            },
        };
        const { categoryId, categoryName, isHotProduct, filterSearch } = this.props.navigation.state.params
        if (!Utils.isNull(categoryId) && !Utils.isNull(categoryName)) {
            this.state.category.id = categoryId
            this.state.category.name = categoryName
        }
        this.isHotProduct = isHotProduct
        this.filterSearch = filterSearch
        this.filter = {
            sortType: sortType.DATE_MOST_RECENT,
            toPrice: null,
            fromPrice: null,
            trademarkId: null,
            originId: null,
            categoryId: this.state.category.id,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            }
        }
        this.scrollY = new Animated.Value(0)
        this.isLoadMore = true
        this.userInfo = null
        this.products = []
        this.productTemps = []
    }

    componentWillMount() {
        this.getSourceUrlPath()
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            //this callback is executed when your Promise is resolved
            if (!Utils.isNull(user) && user.status == statusType.ACTIVE) {
                this.userInfo = user;
            }
        }).catch(error => {
            this.saveException(error, "componentWillMount")
        });
    }

    componentDidMount() {
        if (!Utils.isNull(this.filterSearch)) {
            this.onSearch(this.filterSearch)
        } else {
            this.handleRequest()
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    /**
     * Format data
     */
    formatData(data, numColumns) {
        const numberOfFullRows = Math.floor(data.length / numColumns)
        let numberOfElementsLastRow = data.length - (numberOfFullRows * numColumns)
        while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow != 0) {
            data.push(null)
            numberOfElementsLastRow = numberOfElementsLastRow + 1
        }
        return data;
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_ALL_PRODUCT_BY_CATEGORY)
                    || this.props.action == getActionSuccess(ActionEvent.SEARCH_SELLING)
                    || this.props.action == getActionSuccess(ActionEvent.GET_NEW_PRODUCT)
                    || this.props.action == getActionSuccess(ActionEvent.GET_HOT_PRODUCT)) {
                    this.getCart()
                    if (this.props.screen == screenType.FROM_PRODUCT) {
                        if (!Utils.isNull(data)) {
                            if (data.data.length < Constants.PAGE_SIZE) {
                                this.state.enableLoadMore = false,
                                    this.isLoadMore = false
                            } else {
                                this.state.enableLoadMore = true
                                this.isLoadMore = true
                            }
                            if (data.data.length > 0) {
                                data.data.forEach(item => {
                                    this.productTemps.push({ ...item })
                                })
                                this.products = this.productTemps
                            } else {
                                this.products = []
                            }
                        }
                    }
                } else if (this.props.action == ActionEvent.GET_ALL_CART) {
                    this.quantityCart = data.quantity
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
     * Toggle filter
     */
    toggleFilter() {
        this.setState({
            isShowFilter: !this.state.isShowFilter
        })
    }

    /**
     * Toggle filter
     */
    toggleSort() {
        this.setState({
            isShowSort: !this.state.isShowSort
        })
    }

    /**
     * Toggle List View
     */
    toggleListView() {
        this.setState({
            isGridView: !this.state.isGridView
        })
    }

    //onRefreshing
    handleRefresh = () => {
        this.filter.paging.page = 0
        this.filter.sortType = sortType.DATE_MOST_RECENT
        this.filter.toPrice = null
        this.filter.fromPrice = null
        this.filter.trademarkId = null
        this.filter.originId = null
        this.productTemps = []
        this.setState({
            refreshing: false,
            searchString: ''
        })
        this.isLoadMore = true
        this.handleRequest()
        this.refs.modalSortProduct.onSelect(this.filter.sortType)
    }

    // Handle request
    handleRequest() {
        if (!Utils.isNull(this.state.category.id)) {
            this.props.getAllProductByCategory(this.filter, screenType.FROM_PRODUCT)
        } else {
            if (this.isHotProduct) {
                this.props.getHotProduct(this.filter, screenType.FROM_PRODUCT)
            } else {
                this.props.getNewProduct(this.filter, screenType.FROM_PRODUCT)
            }
        }
    }

    /**
     * Load more
     */
    loadMore = () => {
        if (this.isLoadMore) {
            this.isLoadMore = false
            this.filter.paging.page += 1
            this.handleRequest()
        }
    }

    /**
     * Set filter
     */
    onSetFilter = (filter) => {
        this.filter = filter
    }

    /**
     * Sort sort product
     */
    onSortProduct(sortType) {
        this.filter.paging.page = 0
        this.filter.sortType = sortType
        this.productTemps = []
        this.handleRequest()
        this.toggleSort()
    }

    /**
     * Sort filter product
     */
    onFilterProduct(filter) {
        this.filter.paging.page = 0
        this.filter.toPrice = filter.toPrice
        this.filter.fromPrice = filter.fromPrice
        this.filter.trademarkId = filter.trademarkId
        this.filter.originId = filter.originId
        this.productTemps = []
        this.handleRequest()
        this.toggleFilter()
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
                            opacity: true
                                ? interpolate(scrollY, {
                                    inputRange: [0, p * (1 / 2), p * (3 / 4), p],
                                    outputRange: [1, 0.3, 0.1, 0],
                                    extrapolate: 'clamp'
                                })
                                : 1
                        }
                    ]}
                >
                    {this.renderSearchBar()}
                </Animated.View>
                <Animated.View
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
                </Animated.View>
            </View>
        )
    }

    /**
     * Render (load more)
     */
    renderLoadingLoadMore = () => {
        return (
            <View
                style={{ marginBottom: Constants.MARGIN_X_LARGE }}>
                <ActivityIndicator color={Colors.COLOR_PRIMARY} animating size="large" />
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
        console.log("RENDER PRODUCT VIEW")
        const { isShowFilter, isShowSort, isGridView, enableRefresh, enableLoadMore } = this.state;
        return (
            <Container style={styles.container}>
                <Root>
                    <View style={{ flexGrow: 1 }}>
                        {/* {Header home view} */}
                        <Header style={commonStyles.header}>
                            {this.renderStickyHeader()}
                        </Header>
                        <Content
                            onScroll={Animated.event(
                                [{
                                    nativeEvent: { contentOffset: { y: this.scrollY } }
                                }],
                                {
                                    listener: (event) => {
                                        if (this.isCloseToBottom(event.nativeEvent)) {
                                            this.loadMore()
                                        }
                                    }
                                },
                                { useNativeDriver: true }
                            )}
                            enableRefresh={enableRefresh}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.handleRefresh}
                                />
                            }>
                            <View style={{ marginHorizontal: Constants.MARGIN_LARGE + Constants.MARGIN }}>
                                {this.renderToolbar()}
                            </View>
                            {/* List product */}
                            <View style={{ flex: 1 }}>
                                <FlatListCustom
                                    key={isGridView ? COLUMNS_GRID : COLUMNS_LIST}
                                    style={{
                                        paddingVertical: Constants.PADDING,
                                    }}
                                    keyExtractor={(item) => item.id}
                                    horizontal={false}
                                    data={this.formatData(this.productTemps, this.state.isGridView ? COLUMNS_GRID : COLUMNS_LIST)}
                                    itemPerCol={1}
                                    renderItem={this.renderItem.bind(this)}
                                    showsVerticalScrollIndicator={false}
                                    numColumns={isGridView ? COLUMNS_GRID : COLUMNS_LIST}
                                />
                            </View>
                            {enableLoadMore ? this.renderLoadingLoadMore() : null}
                        </Content>
                        {/* <ModalFilterProduct
                            ref={'modalFilterProduct'}
                            isVisible={isShowFilter}
                            onFilterProduct={this.onFilterProduct.bind(this)}
                            parentView={this}
                            onBack={() => this.toggleFilter()}
                        /> */}
                        <ModalSortProduct
                            ref={'modalSortProduct'}
                            isVisible={isShowSort}
                            onSortProduct={this.onSortProduct.bind(this)}
                            parentView={this}
                            onBack={() => this.toggleSort()}
                        />
                        {!enableLoadMore ? this.showLoadingBar(this.props.isLoading) : null}
                    </View>
                </Root>
            </Container>
        );
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
                        : this.state.category.name,
                    iconLeftSearch: ic_search_white,
                    onTouchStart: this.showSearch,
                    onPressLeftSearch: this.showSearch
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
            </View>
        )
    }

    /**
     * Show search
     */
    showSearch = () => {
        this.props.navigation.navigate("SearchSelling", {
            categoryId: this.state.category.id,
            categoryName: this.state.category.name,
            callBack: this.onSearch.bind(this)
        })
    }

    /**
     * On search
     */
    onSearch(filter) {
        this.setState({
            searchString: filter.searchString
        })
        this.productTemps = []
        this.props.searchSelling(filter, screenType.FROM_PRODUCT)
    }

    /**
     * Render toolbar
     */
    renderToolbar = () => {
        const { isGridView, province, category } = this.state
        return (
            <View style={{ flexDirection: 'row', height: Constants.HEADER_HEIGHT }}>
                <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPress={this.gotoProvince}>
                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} ellipsizeMode={"tail"} style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_XX_SMALL }]}>
                            {province.name}
                        </Text>
                    </View>
                    <Image style={{ marginRight: Constants.MARGIN_LARGE }} source={ic_down_grey} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPress={this.gotoCategory}>
                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} ellipsizeMode={"tail"} style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_XX_SMALL }]}>
                            {category.name}
                        </Text>
                    </View>
                    <Image style={{ marginRight: Constants.MARGIN_LARGE }} source={ic_down_grey} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => {
                        this.toggleSort()
                    }}>
                    <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_XX_SMALL }]}>{localizes('productView.filter')}</Text>
                    <Image style={{ marginRight: Constants.MARGIN }} source={ic_down_grey} />
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
    renderItem(item, index, parentIndex, indexInParent) {
        return (
            <ItemProduct
                key={!Utils.isNull(item) ? item.id : index}
                data={this.products}
                item={item}
                index={index}
                isGridView={this.state.isGridView}
                onPressItem={() => this.onClickItem(item)}
                resource={this.resourceUrlPathResize.textValue}
            />
        );
    }

    /**
     * Choose a province:
     */
    gotoProvince = () => {
        this.props.navigation.navigate("CategoryGeneral", {
            onChangeValue: this.onChangeValueProvince,
            type: areaType.PROVINCE_STRING
        })
    }

    /**
     * Change value province
     */
    onChangeValueProvince = (provinceId, provinceName) => {
        this.setState({
            province: {
                name: provinceName,
                id: provinceId
            }
        })
    }

    /**
     * Go to category
     */
    gotoCategory = () => {
        this.props.navigation.navigate("ProductCategory", {
            callBack: this.onChangeCategory
        })
    }

    /**
     * Change text category
     */
    onChangeCategory = (categoryId, categoryName) => {
        this.setState({
            category: {
                name: categoryName,
                id: categoryId
            }
        })
        this.state.category.id = categoryId
        this.filter.categoryId = categoryId
        this.handleRefresh()
    }

    /**
     * On click item
     */
    onClickItem(item) {
        this.props.navigation.navigate("ProductDetail", {
            productId: item.id
        })
    }
}

const mapStateToProps = state => ({
    data: state.product.data,
    isLoading: state.product.isLoading,
    error: state.product.error,
    errorCode: state.product.errorCode,
    action: state.product.action,
    screen: state.product.screen
});

const mapDispatchToProps = {
    ...productActions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductView);