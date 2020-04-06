import React, { Component } from 'react'
import { Text, View, TouchableOpacity, RefreshControl, Image, BackHandler } from 'react-native'
import BaseView from 'containers/base/baseView';
import styles from './styles';
import { Container, Root, Header } from 'native-base';
import { Colors } from 'values/colors';
import commonStyles from 'styles/commonStyles';
import { Constants } from 'values/constants';
import FlatListCustom from 'components/flatListCustom';
import ItemCart from './itemCart';
import ic_delete_white from "images/ic_delete_white.png";
import ic_home_white from "images/ic_home_white.png";
import ic_close from "images/ic_close.png";
import StorageUtil from 'utils/storageUtil';
import * as productActions from 'actions/productActions';
import * as commonActions from 'actions/commonActions';
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import Utils from 'utils/utils';
import StringUtil from 'utils/stringUtil';
import userType from 'enum/userType';
import ModalAddToCart from '../modal/modalAddToCart';
import { Fonts } from 'values/fonts';
import global from 'utils/global';
import screenType from 'enum/screenType';
import vehicleCardStatus from 'enum/vehicleCardStatus';

class CartView extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            isShowDialogCart: false,
            isPressDelete: false,
            indexColor: 0,
            indexSize: 0,
            quantity: 1
        };
        this.itemSelected = null
        this.indexSelected = 0
        this.userInfo = null
        this.product = null
        this.price = null
        this.origin = null
        this.trademark = null
        this.colors = []
        this.sizes = []
        this.images = [{ pathToResource: "" }]
        this.carts = []
        this.cartItem = null
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.getSourceUrlPath()
        this.getCart()
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            //this callback is executed when your Promise is resolved
            if (!Utils.isNull(user)) {
                this.userInfo = user
            }
        }).catch(error => {
            //this callback is executed when your Promise is rejected
            this.saveException(error, 'componentWillMount')
        });
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
                if (this.props.action == getActionSuccess(ActionEvent.GET_DETAIL_PRODUCT_IN_CART)) {
                    if (!Utils.isNull(data)) {
                        data.resourcePaths.forEach(resource => {
                            this.images = []
                            this.images.push({
                                pathToResource: !Utils.isNull(resource.path) && resource.path.indexOf('http') != -1 ?
                                    resource.path : this.resourceUrlPathResize.textValue + "=" + resource.path
                            })
                        });
                        this.product = data
                        this.price = data.price
                        this.origin = data.origin
                        this.trademark = data.trademark
                        this.colors = data.colors
                        this.sizes = data.sizes
                        this.refs.modalCart.showModal();
                    }
                } else if (this.props.action == ActionEvent.GET_ALL_CART) {
                    this.carts = data.carts
                    this.quantityCart = data.quantity
                    if (Utils.isNull(this.carts)) {
                        this.setState({ isPressDelete: false })
                    }
                } else if (this.props.action == ActionEvent.UPDATE_CART) {
                    if (!Utils.isNull(data)) {
                        let id = this.product.id
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
                                if (indexCart != this.indexSelected) {
                                    this.cartItem.quantity += this.carts[indexCart].quantity
                                    this.carts.splice(indexCart, 1, this.cartItem)
                                    this.carts.splice(this.indexSelected, 1)
                                } else {
                                    this.handleEditItem(quantity)
                                }
                            } else {
                                this.handleEditItem(quantity)
                            }
                            this.saveCart(this.carts)
                        }
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    /**
     * Handle edit item
     */
    handleEditItem(quantity) {
        for (index = 0; index < this.carts.length; index++) {
            item = this.carts[index]
            if (index == this.indexSelected) {
                item.newColors = this.cartItem.newColors
                item.newSizes = this.cartItem.newSizes
                item.quantity = quantity
            }
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    render() {
        const { isPressDelete } = this.state
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[{ backgroundColor: Colors.COLOR_BACKGROUND, borderBottomWidth: 0, alignItems: 'center' }]}>
                        {this.renderHeaderView({
                            visibleBack: !isPressDelete ? true : false,
                            title: !isPressDelete ? "GIỎ HÀNG (" + this.quantityCart + ")" : "XÓA",
                            visibleStage: false,
                            titleStyle: { marginLeft: Constants.MARGIN_XX_LARGE }
                        })}
                        {!isPressDelete
                            ? <TouchableOpacity
                                style={{ paddingHorizontal: Constants.PADDING_LARGE }}
                                onPress={() => {
                                    if (global.positionX != 0) {
                                        this.setState({
                                            isPressDelete: false
                                        })
                                    } else {
                                        this.setState({
                                            isPressDelete: true
                                        })
                                    }
                                }}
                            >
                                <Image source={ic_delete_white} />
                            </TouchableOpacity>
                            : null
                        }
                        <TouchableOpacity
                            style={{ paddingHorizontal: Constants.PADDING_LARGE }}
                            onPress={() => {
                                !isPressDelete ? this.props.navigation.navigate("Main") : this.setState({ isPressDelete: false })
                            }}
                        >
                            <Image source={!isPressDelete ? ic_home_white : ic_close} />
                        </TouchableOpacity>
                    </Header>
                    <FlatListCustom
                        contentContainerStyle={{
                            paddingTop: Constants.PADDING,
                            paddingBottom: Constants.HEIGHT_BUTTON + Constants.PADDING_X_LARGE + Constants.PADDING
                        }}
                        style={{ flex: 1 }}
                        keyExtractor={(item) => item.id}
                        horizontal={false}
                        data={this.carts}
                        itemPerCol={1}
                        renderItem={this.renderItem.bind(this)}
                        showsVerticalScrollIndicator={false}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                    />
                    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        <TouchableOpacity
                            activeOpacity={Constants.ACTIVE_OPACITY}
                            style={{ padding: Constants.PADDING_X_LARGE }}
                            onPress={() => {
                                if (!Utils.isNull(this.carts)) {
                                    this.props.navigation.navigate("OrderProduct", {
                                        screen: screenType.FROM_CART
                                    })
                                } else {
                                    this.showMessage("Hãy thêm ít nhất một sản phẩm vào giỏ hàng!")
                                }
                            }}
                        >
                            <View style={styles.btnAdd}>
                                <Text style={[commonStyles.text, { flex: 1, color: Colors.COLOR_WHITE }]}>
                                    {StringUtil.formatStringCashNoUnit(this.carts.reduce(this.totalPriceCart, 0))} ({this.quantityCart})
                                </Text>
                                <Text style={[commonStyles.text, { color: Colors.COLOR_WHITE }]}>THANH TOÁN</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    {this.showLoadingBar(this.props.isLoading)}
                    {this.renderModalAddToCart()}
                </Root>
            </Container>
        )
    }

    //onRefreshing
    handleRefresh = () => {
        this.setState({
            refreshing: false
        })
    }

    /**
     * Render item
     * @param {*} item
     * @param {*} index
     * @param {*} parentIndex
     * @param {*} indexInParent
     */
    renderItem(item, index, parentIndex, indexInParent) {
        const { isPressDelete } = this.state
        return (
            <ItemCart
                key={item.id}
                data={this.carts}
                item={item}
                index={index}
                onPressItem={() => this.onClickItem(item, index)}
                resource={this.resourceUrlPath.textValue}
                onPressDeleteItem={() => this.onDeleteItem(index)}
                isPressDelete={isPressDelete}
            />
        );
    }

    /**
     * On delete item
     */
    onDeleteItem(index) {
        this.carts.splice(index, 1)
        StorageUtil.storeItem(StorageUtil.CART, this.carts)
        this.getCart()
        global.positionX = 0
    }

    /**
     * On click item
     */
    onClickItem(item, index) {
        this.itemSelected = item
        this.indexSelected = index
        this.itemSelected.newColors.forEach((itemColor, indexColor) => {
            if (itemColor.isSelect) {
                this.state.indexColor = indexColor
            }
        })
        this.itemSelected.newSizes.forEach((itemSize, indexSize) => {
            if (itemSize.isSelect) {
                this.state.indexSize = indexSize
            }
        })
        this.state.quantity = this.itemSelected.quantity
        this.props.getDetailProductInCart({ id: item.id })
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
                isAddItem={false}
                onBack={() => {
                    this.setState({
                        isShowDialogCart: false
                    })
                }}
                indexColorCurrent={this.state.indexColor}
                indexSizeCurrent={this.state.indexSize}
                quantity={this.state.quantity}
                onSetStateIndexColor={(item, index) => { }}
                onSetStateIndexSize={(item, index) => { }}
                onTouchOutside={true}
                onPress={this.updateItemCart.bind(this)}
            />
        )
    }

    /**
     * Update item cart
     */
    updateItemCart(data) {
        this.state.indexColor = data.indexColor
        this.state.indexSize = data.indexSize
        this.state.quantity = data.numberProduct
        this.props.updateCart(data)
    }

    /**
     * Save cart
     * @param {*} carts
     */
    saveCart(carts) {
        StorageUtil.storeItem(StorageUtil.CART, carts)
        this.getCart()
        this.refs.modalCart.hideModal();
        this.showMessage("Cập nhật giỏ hàng thành công")
    }
}

const mapStateToProps = state => ({
    data: state.cart.data,
    isLoading: state.cart.isLoading,
    error: state.cart.error,
    errorCode: state.cart.errorCode,
    action: state.cart.action
});

const mapDispatchToProps = {
    ...productActions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(CartView);
