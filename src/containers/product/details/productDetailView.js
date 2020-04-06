import React, { Component } from 'react';
import { View, Text, ImageBackground, ScrollView, RefreshControl, TouchableOpacity, Image, TextInput, Keyboard, Dimensions, BackHandler } from 'react-native';
import BaseView from 'containers/base/baseView';
import styles from './styles';
import { Header, Container, Root, Title, Left, Body, Right } from 'native-base';
import * as actions from 'actions/productActions';
import * as commonActions from 'actions/commonActions'
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import ic_search_white from 'images/ic_search_white.png';
import ic_add_grey_dark from 'images/ic_add_grey_dark.png';
import ic_list_grey from "images/ic_list_grey.png";
import ic_grid_grey from "images/ic_grid_grey.png";
import ic_filter_grey from "images/ic_filter_grey.png";
import ic_sort_grey from "images/ic_sort_grey.png";
import ic_share_black from "images/ic_share_black.png";
import ic_call_black from "images/ic_call_black.png";
import ic_chat_white from 'images/ic_chat_white.png';
import ic_star from 'images/ic_star.png';
import { Colors } from 'values/colors';
import global from 'utils/global';
import commonStyles from 'styles/commonStyles';
import { Constants } from 'values/constants';
import { Fonts } from 'values/fonts';
import { localizes } from 'locales/i18n';
import FlatListCustom from 'components/flatListCustom';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import ImageLoader from 'components/imageLoader';
import ic_heart_red from "images/ic_heart_red.png";
import ic_heart_white from "images/ic_heart_white.png";
import ic_cart_grey from "images/ic_cart_grey.png";
import ic_home_white from "images/ic_home_white.png";
import StringUtil from 'utils/stringUtil';
import DateUtil from 'utils/dateUtil';
import Utils from 'utils/utils';
import StorageUtil from 'utils/storageUtil';
import firebase from 'react-native-firebase';
import DialogCustom from 'components/dialogCustom';
import ItemNewsSellingVehicleInterest from 'containers/sellingVehicle/items/itemNewsSellingVehicleInterest';
import { CATEGORY_PRODUCTS } from '../data';
import ItemColor from './itemColor';
import ItemReview from './itemReview';
import ModalAddToCart from '../modal/modalAddToCart';
import StarRating from 'components/starRating';
import BackgroundShadow from 'components/backgroundShadow';
import userType from 'enum/userType';
import vehicleCardStatus from 'enum/vehicleCardStatus';

const screen = Dimensions.get("window");
const IMAGE_HEIGHT_CAROUSEL = screen.width * 0.75;
const POSITION_TOP_PAGINATION = screen.width * 0.80;
const POSITION_LEFT_PAGINATION = screen.width / 3;
const WIDTH_PAGINATION = screen.width / 3;
const TOP_CONTENT = IMAGE_HEIGHT_CAROUSEL
const INACTIVE_DOT_WIDTH_HEIGHT = 10;
const MAX_PRICE = 100000000000;
const WIDTH_HEIGHT_IMAGE = Constants.MARGIN_XX_LARGE;
const SIZE_AVATAR = 48;
const SIZE_LOGO = 32;
const ratingObj = {
    ratings: 0,
    views: 0
}
const NUMBER_REVIEW = 5

class ProductDetailView extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            opacity: 0,
            refreshing: false,
            enableRefresh: true,
            activeSlide: 0,
            avatarPath: '',
            isMyPost: false,
            indexColor: 0,
            indexSize: 0,
            quantity: 1,
            entries: [
                {
                    title: 'hello',
                    pathToResource: ""
                }
            ],
            isFavorite: false,
            isShowDialogCart: false,
            colorProductCurrent: ""
        };
        const { productId } = this.props.navigation.state.params;
        this.productId = productId
        this.images = [{ pathToResource: "" }]
        this.product = null
        this.price = null
        this.trademark = null
        this.origin = null
        this.reviews = []
        this.colors = []
        this.sizes = []
        this.cartItem = null
        this.carts = []
        this.userInfo = null
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.getSourceUrlPath()
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            //this callback is executed when your Promise is resolved
            if (!Utils.isNull(user)) {
                this.userInfo = user;
            }
        }).catch(error => {
            //this callback is executed when your Promise is rejected
            console.log("Promise is rejected with error: " + error);
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    componentDidMount() {
        this.props.getDetailProduct({ id: this.productId })
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
                if (this.props.action == getActionSuccess(ActionEvent.GET_DETAIL_PRODUCT)) {
                    // this.getCart()
                    if (!Utils.isNull(data)) {
                        this.images = []
                        data.resourcePaths.forEach(resource => {
                            this.images.push({
                                pathToResource: !Utils.isNull(resource.path) && resource.path.indexOf('http') != -1 ?
                                    resource.path : this.resourceUrlPathResize.textValue + "=" + resource.path
                            })
                        });
                        this.product = data
                        this.price = data.price
                        this.origin = data.origin
                        this.trademark = data.trademark
                        this.colors = this.product.colors
                        if (this.colors.length > 0) {
                            this.state.colorProductCurrent = this.colors[0].name
                        }
                        this.sizes = this.product.sizes
                        let views = 0
                        let ratings = 0
                        if (!Utils.isNull(data.reviews)) {
                            let totalStar = 0
                            data.reviews.forEach(review => {
                                views += 1
                                totalStar += review.star
                            });
                            ratings = Math.round(totalStar / views)
                            this.reviews = []
                            if (data.reviews.length >= NUMBER_REVIEW) {
                                for (let index = 0, size = NUMBER_REVIEW; index < size; index++) {
                                    const element = data.reviews[index];
                                    this.reviews.push(element)
                                }
                            } else {
                                this.reviews = data.reviews
                            }
                        }
                        if (views != 0) {
                            ratingObj = {
                                ratings: ratings,
                                views: views
                            }
                        }
                    }
                } else if (this.props.action == ActionEvent.GET_ALL_CART) {
                    this.quantityCart = data.quantity
                    this.carts = data.carts
                } else if (this.props.action == ActionEvent.ADD_TO_CART) {
                    if (!Utils.isNull(data)) {
                        let id = this.productId
                        let name = this.product.name
                        let price = data.price
                        let originalPrice = this.product.price.originalPrice
                        let resourcePaths = this.product.resourcePaths
                        let newColors = []
                        let newSizes = []
                        let colorId = null
                        let sizeId = null
                        let quantity = data.numberProduct
                        this.colors.forEach((item, index) => {
                            if (index === data.indexColor) {
                                newColors.push({ ...item, isSelect: true })
                                colorId = item.id
                            } else {
                                newColors.push({ ...item, isSelect: false })
                            }
                        })
                        this.sizes.forEach((item, index) => {
                            if (index === data.indexSize) {
                                newSizes.push({ ...item, isSelect: true })
                                sizeId = item.id
                            } else {
                                newSizes.push({ ...item, isSelect: false })
                            }
                        })
                        this.cartItem = { id, name, price, originalPrice, resourcePaths, newColors, newSizes, quantity, colorId, sizeId }
                        if (!Utils.isNull(this.carts)) {
                            let colorExist = false
                            let sizeExist = false
                            let indexCartWidthColor = 0
                            let indexCartWidthSize = 0
                            for (index = 0; index < this.carts.length; index++) {
                                item = this.carts[index]
                                if (colorExist && sizeExist && (indexCartWidthColor == indexCartWidthSize)) {
                                    break
                                }
                                if (item.id === this.cartItem.id) {
                                    item.newColors.forEach((itemColor, indexColor) => {
                                        if (itemColor.isSelect) {
                                            if (indexColor === data.indexColor) {
                                                colorExist = true
                                                indexCartWidthColor = index
                                            }
                                        }
                                    })
                                    item.newSizes.forEach((itemSize, indexSize) => {
                                        if (itemSize.isSelect) {
                                            if (indexSize === data.indexSize) {
                                                sizeExist = true
                                                indexCartWidthSize = index
                                            }
                                        }
                                    })
                                }
                            }
                            if (colorExist && sizeExist && (indexCartWidthColor == indexCartWidthSize)) {
                                let indexCart = indexCartWidthColor = indexCartWidthSize
                                this.cartItem.quantity += this.carts[indexCart].quantity
                                this.carts.splice(indexCart, 1, this.cartItem)
                            } else {
                                this.carts.splice(0, 0, this.cartItem)
                            }
                            this.saveCart(this.carts)
                        } else {
                            let newCarts = []
                            newCarts.push(this.cartItem)
                            this.saveCart(newCarts)
                        }
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    /**
     * Add item to cart
     */
    addItemToCart(data) {
        this.state.indexColor = data.indexColor
        this.state.indexSize = data.indexSize
        this.state.quantity = data.numberProduct
        this.props.addToCart(data)
    }

    /**
     * Save cart
     * @param {*} carts
     */
    saveCart(carts) {
        StorageUtil.storeItem(StorageUtil.CART, carts)
        this.getCart()
        this.refs.modalCart.hideModal();
        this.showMessage("Thêm vào giỏ hàng thành công")
    }

    //onRefreshing
    handleRefresh = () => {
        this.setState({
            refreshing: false
        })
        this.props.getDetailProduct({ id: this.productId })
    }

    /**
     * Render slideShow image vehicle
     */
    renderSlideShow() {
        return (
            <View style={{ position: 'relative' }} >
                <Carousel
                    ref={(c) => { this._carousel = c; }}
                    data={this.images}
                    renderItem={this.renderItemCarousel}
                    sliderWidth={screen.width}
                    itemWidth={screen.width}
                    // loop={true}
                    autoplay={true}
                    onSnapToItem={(index) => this.setState({ activeSlide: index })}
                    containerCustomStyle={{
                        flexGrow: 0,
                    }}
                />
                <View style={{
                    position: 'absolute',
                    top: POSITION_TOP_PAGINATION,
                    left: POSITION_LEFT_PAGINATION,
                }} >
                    <Pagination
                        dotsLength={this.images.length}
                        activeDotIndex={this.state.activeSlide}
                        containerStyle={{
                            backgroundColor: Colors.COLOR_TRANSPARENT,
                            width: WIDTH_PAGINATION,
                        }}
                        dotStyle={{
                            width: INACTIVE_DOT_WIDTH_HEIGHT,
                            height: INACTIVE_DOT_WIDTH_HEIGHT,
                            borderRadius: INACTIVE_DOT_WIDTH_HEIGHT / 2,
                            backgroundColor: "#78849E"
                        }}
                        inactiveDotStyle={{
                            width: INACTIVE_DOT_WIDTH_HEIGHT,
                            height: INACTIVE_DOT_WIDTH_HEIGHT,
                            borderRadius: INACTIVE_DOT_WIDTH_HEIGHT / 2,
                            backgroundColor: Colors.COLOR_GRAY
                        }}
                        inactiveDotOpacity={0.3}
                        inactiveDotScale={0.6}
                    />
                </View>
                {/* <View style={{
                    position: 'absolute',
                    top: POSITION_TOP_PAGINATION,
                    left: Constants.MARGIN_XX_LARGE,
                }} >
                    <Image source={ic_share_black} />
                </View> */}
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
    renderItemInterest(item, index, parentIndex, indexInParent) {
        return (
            <ItemNewsSellingVehicleInterest
                data={this.dataNewsSellingVehicleInterest}
                item={item}
                index={index}
                onPress={this.onClickItem.bind(this)}
                resource={this.resourceUrlPath.textValue}
            />
        );
    }

    /**
     * On click item
     */
    onClickItem(item) {
        this.props.navigation.push("SellingVehicleDetail", {
            dataVehicle: item,
            urlPathResource: this.resourceUrlPath.textValue
        })
    }

    /**
     * Render Image
     * @param {*} imagePath 
     * @param {*} type // 0: image avatar, 1: image logo vehicle
     */
    renderImage(imagePath, type) {
        if (type == 0) {
            return (
                <ImageLoader
                    resizeModeType={"cover"}
                    style={[{
                        width: SIZE_AVATAR,
                        height: SIZE_AVATAR,
                        marginRight: Constants.MARGIN_X_LARGE
                    }]}
                    path={imagePath}
                />
            )
        } else {
            return (
                !Utils.isNull(imagePath)
                    ? <Image source={{ uri: imagePath }}
                        resizeMode={"cover"}
                        style={{
                            width: SIZE_LOGO,
                            height: SIZE_LOGO,
                        }} />
                    : null
            )
        }
    }

    /**
     * Render UI call and message
     * @param {*} isFromToolbar 
     */
    renderCallAndMessage(isFromToolbar) {
        return (
            this.state.isMyPost
                ? null
                : <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter, {
                    flex: 0
                }]} >
                    <TouchableOpacity
                        style={{ paddingRight: Constants.PADDING_X_LARGE }}
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        onPress={() => {
                        }}>
                        <Image source={ic_call_black}
                            opacity={isFromToolbar ? this.state.opacity : 1}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        style={{
                        }}
                        onPress={this.gotoChat}>
                        <Image source={ic_chat_white}
                            opacity={isFromToolbar ? this.state.opacity : 1}
                        />
                    </TouchableOpacity>
                </View>
        )
    }

    onPressSoldVehicle() {
    }

    /**
     * Render Dialog Confirm Sold
     */
    renderDialogConfirmSold() {
        return (
            <DialogCustom
                visible={this.state.isShowDialog}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={"Xác nhận"}
                textBtnOne={"Hủy"}
                textBtnTwo={"Xác nhận"}
                contentText={"Xác nhận xe đã được bán?"}
                onTouchOutside={() => { this.setState({ isShowDialog: false }) }
                }
                onPressX={() => { this.setState({ isShowDialog: false }) }}
                onPressBtnPositive={() => {
                    this.setState({ isShowDialog: false })
                }}
            />
        )
    }

    /**
     * Render modal add products to cart
     */
    renderModalAddToCart() {
        let priceInCart = 0
        if (!Utils.isNull(this.userInfo)) {
            if (!Utils.isNull(this.price)) {
                if (!Utils.isNull(this.userInfo.membershipCards)) {
                    if (this.userInfo.membershipCards.approved
                        && this.userInfo.membershipCards.vehicleCardStatus == vehicleCardStatus.HAS_MEMBERSHIP) {
                        priceInCart = this.price.priceForMember
                    } else {
                        priceInCart = this.price.price
                    }
                } else {
                    priceInCart = this.price.price
                }
            }
        }
        return (
            <ModalAddToCart
                ref={'modalCart'}
                nameProduct={!Utils.isNull(this.product) ? this.product.name : ""}
                pathToResource={this.images[0].pathToResource}
                price={priceInCart}
                colors={this.colors}
                sizes={this.sizes}
                isVisible={this.state.isShowDialogCart}
                isAddItem={true}
                onBack={() => {
                    this.setState({
                        isShowDialogCart: false
                    })
                }}
                indexColorCurrent={this.state.indexColor}
                indexSizeCurrent={this.state.indexSize}
                quantity={this.state.quantity}
                onSetStateIndexColor={(item, index, quantity) => {
                    this.setState({
                        indexColor: index,
                        colorProductCurrent: item.name,
                        quantity
                    })
                }}
                onSetStateIndexSize={(item, index, quantity) => {
                    this.setState({
                        indexSize: index,
                        quantity
                    })
                }}
                onTouchOutside={true}
                onPress={this.addItemToCart.bind(this)}
            />
        )
    }

    /**
     * Render item
     * @param {*} item 
     * @param {*} index 
     * @param {*} parentIndex 
     * @param {*} indexInParent 
     */
    renderItemColor(item, index, parentIndex, indexInParent) {
        return (
            <ItemColor
                length={this.colors.length}
                data={item}
                index={index}
                onChooseColor={() => this.onChooseColor(item, index)}
                indexChoose={this.state.indexColor}
            />
        )
    }

    /**
     * Render item
     * @param {*} item 
     * @param {*} index 
     * @param {*} parentIndex 
     * @param {*} indexInParent 
     */
    renderItemReview(item, index, parentIndex, indexInParent) {
        return (
            <ItemReview
                key={index}
                length={this.reviews.length}
                data={item}
                index={index}
            />
        )
    }

    /**
     * Choose color
     * @param {*} item 
     * @param {*} index 
     */
    onChooseColor(item, index) {
        this.setState({
            indexColor: index,
            colorProductCurrent: item.name
        })
    }

    /**
     * Open modal 
     */
    openModalCart() {
        this.refs.modalCart.showModal();
    }

    render() {
        return (
            // <MyApp />
            <Container style={styles.container}>
                <Root>
                    <View style={{ flexGrow: 1 }}>
                        {/* {Header home view} */}
                        <Header style={{ backgroundColor: Colors.COLOR_BACKGROUND, borderBottomWidth: 0 }}>
                            {this.renderToolbar()}
                        </Header>
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1 }}
                            style={{
                                flex: 1, position: 'relative'
                            }}
                            scrollEnabled={true}
                            onScroll={event => {
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
                            }}
                            scrollEventThrottle={16}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.handleRefresh}
                                />
                            }
                        >
                            {this.renderSlideShow()}
                            <View style={{
                                backgroundColor: Colors.COLOR_TRANSPARENT,
                                marginVertical: Constants.MARGIN,
                                marginTop: - Constants.MARGIN_XX_LARGE
                            }}>
                                {/* content 1 */}
                                <View style={[commonStyles.viewHorizontal, { flex: 0 }]} >
                                    <View style={[styles.contentOne, { flex: 1 }]}>
                                        <Text numberOfLines={2} ellipsizeMode={"tail"} style={[commonStyles.title, { margin: 0, height: 50 }]} >{
                                            !Utils.isNull(this.product)
                                                ? this.product.name
                                                : "-"
                                        }</Text>
                                        <View style={[commonStyles.viewHorizontal]} >
                                            <View style={{ marginRight: Constants.MARGIN_LARGE, justifyContent: 'flex-end' }} >
                                                <Text style={[commonStyles.title, { margin: 0, color: Colors.COLOR_PRIMARY }]}>
                                                    {
                                                        !Utils.isNull(this.price)
                                                            ? !Utils.isNull(this.price.priceForMember) ? StringUtil.formatStringCashNoUnit(this.product.price.priceForMember)
                                                                : "-"
                                                            : "-"
                                                    }
                                                </Text>
                                                <Text style={[commonStyles.textSmall, { margin: 0 }]}>Dành cho thành viên H2</Text>
                                            </View>
                                            <View style={{ justifyContent: 'center', alignItems: 'flex-end' }} >
                                                <Text style={[commonStyles.text, { margin: 0, fontSize: Fonts.FONT_SIZE_XX_SMALL }]}>
                                                    {
                                                        !Utils.isNull(this.price)
                                                            ? !Utils.isNull(this.price.price) ? StringUtil.formatStringCashNoUnit(this.price.price)
                                                                : "-"
                                                            : "-"
                                                    }
                                                </Text>
                                                <Text style={[commonStyles.text, {
                                                    margin: 0, color: Colors.COLOR_GREY_LIGHT, fontSize: Fonts.FONT_SIZE_XX_SMALL,
                                                    textDecorationLine: 'line-through', textDecorationStyle: 'solid'
                                                }]}>
                                                    {
                                                        !Utils.isNull(this.price)
                                                            ? !Utils.isNull(this.price.originalPrice) ? StringUtil.formatStringCashNoUnit(this.price.originalPrice)
                                                                : "-"
                                                            : "-"
                                                    }
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={{ position: 'absolute', right: Constants.MARGIN_LARGE, bottom: Constants.MARGIN_LARGE }}
                                            activeOpacity={Constants.ACTIVE_OPACITY}
                                            onPress={() => {
                                                if (!Utils.isNull(this.userInfo)) {
                                                    this.setState({
                                                        isFavorite: !this.state.isFavorite
                                                    })
                                                } else {
                                                    this.showLoginView()
                                                }
                                            }}>
                                            <Image source={this.state.isFavorite ? ic_heart_white : ic_heart_red} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {/* content 2 */}
                                {/* <View style={{ marginTop: Constants.MARGIN_LARGE }} >
                                    <Text style={[commonStyles.text, {
                                        margin: 0,
                                        marginHorizontal: Constants.MARGIN_24,
                                    }]} >Màu sắc</Text>
                                    <View style={[
                                        commonStyles.viewHorizontal, commonStyles.viewCenter, styles.viewChild, {
                                            paddingHorizontal: 0
                                        }]}>
                                        <FlatListCustom
                                            style={{
                                            }}
                                            horizontal={true}
                                            data={this.colors}
                                            itemPerCol={1}
                                            renderItem={this.renderItemColor.bind(this)}
                                            showsHorizontalScrollIndicator={false}
                                        />
                                    </View>
                                </View> */}
                                {/* content 3  */}
                                <View style={{ marginTop: Constants.MARGIN_LARGE }} >
                                    <Text style={[commonStyles.text, {
                                        margin: 0,
                                        marginHorizontal: Constants.MARGIN_24,
                                    }]} >Thông tin chi tiết</Text>
                                    <View style={[styles.viewChild]}>
                                        <View style={[commonStyles.viewHorizontal, {
                                            marginBottom: Constants.MARGIN_LARGE
                                        }]} >
                                            <Text style={[commonStyles.text, styles.titleDetail]}>Thương hiệu</Text>
                                            <Text style={[commonStyles.text, styles.contentDetail]}>{
                                                !Utils.isNull(this.trademark)
                                                    ? !Utils.isNull(this.trademark.name)
                                                        ? this.trademark.name
                                                        : "-"
                                                    : "-"
                                            }</Text>
                                        </View>
                                        <View style={[commonStyles.viewHorizontal, {
                                            marginBottom: Constants.MARGIN_LARGE
                                        }]} >
                                            <Text style={[commonStyles.text, styles.titleDetail]}>Xuất xứ</Text>
                                            <Text style={[commonStyles.text, styles.contentDetail]}>{
                                                !Utils.isNull(this.origin)
                                                    ? !Utils.isNull(this.origin.name)
                                                        ? this.origin.name
                                                        : "-"
                                                    : "-"
                                            }</Text>
                                        </View>
                                        <View style={[commonStyles.viewHorizontal, {
                                            marginBottom: Constants.MARGIN_LARGE
                                        }]} >
                                            <Text style={[commonStyles.text, styles.titleDetail]}>Kích thước</Text>
                                            <Text style={[commonStyles.text, styles.contentDetail]}>{
                                                !Utils.isNull(this.product)
                                                    ? "(D x R x C) "
                                                    + this.product.dimensionLength
                                                    + " x "
                                                    + this.product.dimensionWidth
                                                    + " x "
                                                    + this.product.dimensionHeight
                                                    + " cm"
                                                    : "-"
                                            }</Text>
                                        </View>
                                        <View style={[commonStyles.viewHorizontal, {
                                            marginBottom: Constants.MARGIN_LARGE
                                        }]} >
                                            <Text style={[commonStyles.text, styles.titleDetail]}>SKU</Text>
                                            <Text style={[commonStyles.text, styles.contentDetail]}>{
                                                !Utils.isNull(this.product)
                                                    ? !Utils.isNull(this.product.sku)
                                                        ? this.product.sku
                                                        : "-"
                                                    : "-"
                                            }</Text>
                                        </View>
                                        <View style={[commonStyles.viewHorizontal, {
                                            marginBottom: Constants.MARGIN_LARGE
                                        }]} >
                                            <Text style={[commonStyles.text, styles.titleDetail]}>Model</Text>
                                            <Text style={[commonStyles.text, styles.contentDetail]}>{
                                                !Utils.isNull(this.product)
                                                    ? !Utils.isNull(this.product.model)
                                                        ? this.product.model
                                                        : "-"
                                                    : "-"
                                            }</Text>
                                        </View>
                                        <View style={[commonStyles.viewHorizontal, {
                                            marginBottom: Constants.MARGIN_LARGE
                                        }]} >
                                            <Text style={[commonStyles.text, styles.titleDetail]}>Màu/Mẫu</Text>
                                            <Text style={[commonStyles.text, styles.contentDetail]}>{
                                                this.colors.length > 0
                                                    ? this.state.colorProductCurrent
                                                    : "-"
                                            }</Text>
                                        </View>
                                    </View>
                                </View>
                                {/* content 4 */}
                                <View style={{ marginTop: Constants.MARGIN_LARGE }} >
                                    <Text style={[commonStyles.text, {
                                        margin: 0,
                                        marginHorizontal: Constants.MARGIN_24,
                                    }]} >Mô tả sản phẩm</Text>
                                    <View style={[styles.viewChild]}>
                                        <Text style={[commonStyles.text, { margin: 0 }]}>{
                                            !Utils.isNull(this.product)
                                                ? !Utils.isNull(this.product.description)
                                                    ? this.product.description
                                                    : "Chưa có thông tin mô tả sản phẩm"
                                                : "Chưa có thông tin mô tả sản phẩm"
                                        }</Text>
                                    </View>
                                </View>
                                {/* content 5 */}
                                <View style={[{
                                    marginTop: Constants.MARGIN_LARGE,
                                }]} >
                                    <View style={[commonStyles.viewHorizontal, { flex: 0, justifyContent: 'space-between', marginHorizontal: Constants.MARGIN_24 }]}>
                                        <Text style={[commonStyles.text, { margin: 0 }]} >Đánh giá</Text>
                                        <TouchableOpacity
                                            onPress={() => {
                                                this.props.navigation.navigate('Reviews', {
                                                    productId: this.product.id
                                                })
                                            }}
                                            style={[{ margin: 0 }]} >
                                            <Text style={[commonStyles.text, { margin: 0 }]}>Xem tất cả</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[commonStyles.viewHorizontal]} >
                                        <TouchableOpacity
                                            activeOpacity={Constants.ACTIVE_OPACITY}
                                            onPress={() => {
                                                if (!Utils.isNull(this.userInfo)) {
                                                    this.props.navigation.navigate('SendReview', {
                                                        productId: this.product.id
                                                    })
                                                } else {
                                                    this.showLoginView()
                                                }
                                            }}
                                            style={[commonStyles.viewCenter, commonStyles.shadowOffset, commonStyles.marginForShadow, {
                                                marginRight: Constants.MARGIN_LARGE,
                                                backgroundColor: Colors.COLOR_WHITE,
                                                borderRadius: Constants.CORNER_RADIUS,
                                                height: screen.width * 0.13,
                                                width: screen.width * 0.13
                                            }]}>
                                            <Image source={ic_add_grey_dark} />
                                        </TouchableOpacity>
                                        <View style={[commonStyles.viewCenter, commonStyles.shadowOffset, commonStyles.marginForShadow, {
                                            flex: 1,
                                            marginLeft: Constants.MARGIN_LARGE,
                                            backgroundColor: Colors.COLOR_WHITE,
                                            paddingHorizontal: Constants.PADDING_X_LARGE,
                                            borderRadius: Constants.CORNER_RADIUS,
                                            height: screen.width * 0.13,
                                        }]}>
                                            <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter, { flex: 0 }]} >
                                                <Text style={[commonStyles.text, { margin: 0 }]}>{ratingObj.ratings}/5</Text>
                                                <View style={[commonStyles.viewHorizontal, {
                                                    justifyContent: 'flex-end'
                                                }]} >
                                                    <View style={[{
                                                        justifyContent: 'flex-end',
                                                        alignItems: 'center',
                                                        marginRight: Constants.MARGIN,
                                                    }]} >
                                                        <StarRating
                                                            styleImage={{ width: 18, height: 18 }}
                                                            ratingObj={ratingObj}
                                                            myStyleViews={[commonStyles.text, { marginRight: 0 }]} />
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                {/* content 6 */}
                                <FlatListCustom
                                    style={{
                                    }}
                                    data={this.reviews}
                                    renderItem={this.renderItemReview.bind(this)}
                                    showsVerticalScrollIndicator={false}
                                />
                                {this.renderDialogConfirmSold()}
                            </View>
                        </ScrollView>
                        {this.renderBtnAddToCart()}
                        {this.renderModalAddToCart()}
                        {this.showLoadingBar(this.props.isLoading || this.state.isLoadingChat)}
                    </View>
                </Root>
            </Container>
        );
    }

    /**
     * Render btn add to cart
     */
    renderBtnAddToCart() {
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                style={[commonStyles.viewCenter, {
                    padding: Constants.PADDING_LARGE,
                    borderRadius: Constants.CORNER_RADIUS,
                    shadowColor: Colors.COLOR_PRIMARY,
                    backgroundColor: Colors.COLOR_PRIMARY,
                    width: 50,
                    height: 50
                }]}
                onPress={() => {
                    if (!Utils.isNull(this.userInfo)) {
                        this.openModalCart()
                    } else {
                        this.showLoginView()
                    }
                }}>
                <Image source={ic_add_cart_white} />
            </TouchableOpacity>
        )
    }

    /**
     * Render Item Carousel
     * @param {*} param0 
     */
    renderItemCarousel({ item, index }) {
        return (
            <View style={{
                borderBottomLeftRadius: Constants.CORNER_RADIUS,
                borderBottomRightRadius: Constants.CORNER_RADIUS,
            }} >
                <ImageLoader
                    resizeModeType={'cover'}
                    path={item.pathToResource}
                    // resizeAtt={{ type: 'resize', height: screen.width }}
                    style={{
                        width: screen.width, height: screen.width,
                        borderBottomLeftRadius: Constants.CORNER_RADIUS,
                        borderBottomRightRadius: Constants.CORNER_RADIUS,
                    }} />
            </View>
        );
    }

    /**
     * Render toolbar
     */
    renderToolbar = () => {
        return (
            <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter]}>
                {this.renderHeaderView({
                    title: !Utils.isNull(this.product)
                        ? this.product.name.toUpperCase()
                        : "-",
                    visibleStage: false,
                    visibleCart: false,
                    quantityCart: this.quantityCart,
                    showCart: this.showCart,
                    titleStyle: {
                        ...commonStyles.textBold,
                        textAlign: 'left',
                        marginLeft: Constants.MARGIN_X_LARGE,
                        opacity: this.state.opacity
                    }
                })}
                <TouchableOpacity
                    style={{ padding: Constants.PADDING_LARGE + 2 }}
                    onPress={() => this.props.navigation.navigate("Main")}>
                    <Image source={ic_home_white} />
                </TouchableOpacity>
            </View>
        )
    }
}

const mapStateToProps = state => ({
    data: state.productDetail.data,
    isLoading: state.productDetail.isLoading,
    error: state.productDetail.error,
    errorCode: state.productDetail.errorCode,
    action: state.productDetail.action
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetailView);