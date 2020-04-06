import React, { Component } from "react";
import { ImageBackground, Text, View, Image, TouchableOpacity, StyleSheet, Dimensions, Platform, ScrollView, TextInput } from "react-native";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import commonStyles from "styles/commonStyles";
import Modal from "react-native-modalbox";
import Utils from "utils/utils";
import { colors } from "react-native-elements";
import StringUtil from "utils/stringUtil";
import userType from "enum/userType";
import ItemColor from "../details/itemColor";
import FlatListCustom from "components/flatListCustom";
import ItemSize from "../details/itemSize";
import BaseView from "containers/base/baseView";
import { Fonts } from "values/fonts";
import ImageLoader from "components/imageLoader";
import ic_plus_gray from "images/ic_plus_gray.png";
import ic_minus_gray from "images/ic_minus_gray.png";

const screen = Dimensions.get("window");
const deviceWidth = screen.width;
const deviceHeight = screen.height

const numberRowRenderColor = 7

const heightColor = (Dimensions.get('window').width - (Constants.MARGIN_XX_LARGE * 5)) / numberRowRenderColor
const heightSize = (Dimensions.get('window').width - (Constants.MARGIN_XX_LARGE * 6.5)) / numberRowRenderColor

export default class ModalAddToCart extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            indexColor: 0,
            indexSize: 0,
            numberProduct: 1
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.setState({
                indexColor: nextProps.indexColorCurrent,
                indexSize: nextProps.indexSizeCurrent,
                numberProduct: nextProps.quantity
            })
        }
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
                length={this.props.colors.length}
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
    renderItemSize(item, index, parentIndex, indexInParent) {
        return (
            <ItemSize
                length={this.props.sizes.length}
                data={item}
                index={index}
                onChooseColor={() => this.onChooseSize(item, index)}
                indexChose={this.state.indexSize}
            />
        )
    }

    /**
     * Choose color
     * @param {*} item 
     * @param {*} index 
     */
    onChooseColor(item, index) {
        const { numberProduct } = this.state
        this.setState({
            indexColor: index
        })
        this.props.onSetStateIndexColor(item, index, numberProduct)
    }

    /**
     * Choose color
     * @param {*} item 
     * @param {*} index 
     */
    onChooseSize(item, index) {
        const { numberProduct } = this.state
        this.setState({
            indexSize: index
        })
        this.props.onSetStateIndexSize(item, index, numberProduct)
    }

    /**
     * Render layout on touch outsize
     * @param {*} onTouch 
     */
    renderOutsideTouchable(onTouch) {
        const view = <View style={{ flex: 1, width: '100%', height: '100%' }} />
        // if (onTouch) {
        return (
            <TouchableOpacity onPress={() => {
                this.props.onBack()
            }} style={{ flex: 1, width: '100%', height: '100%' }}>
                {view}
            </TouchableOpacity>
        )
        // }
    }

    /**
     * Show Model 
     */
    showModal() {
        this.refs.modalCart.open();
    }

    /**
     * hide Modal 
     */
    hideModal() {
        this.refs.modalCart.close();
    }

    render() {
        const { selected,
            isVisible,
            isAddItem,
            nameProduct,
            onBack,
            indexColorCurrent,
            onSetStateIndexColor,
            pathToResource,
            onTouch, onTouchOutside, price, sizes, colors } = this.props;
        return (
            <Modal
                ref={"modalCart"}
                animationType={'fade'}
                transparent={true}
                style={{
                    backgroundColor: "#00000000",
                    flex: 1,
                    justifyContent: 'flex-end'
                }}
                backdrop={true}
                swipeToClose={Platform.OS === 'android' ? false : true}
                backdropPressToClose={true}
                onClosed={() => {
                    this.hideModal()
                }}
                backButtonClose={true}
                position={'bottom'}
            >
                {/* {this.renderOutsideTouchable(onTouchOutside)} */}
                <View style={{
                    backgroundColor: Colors.COLOR_BACKGROUND,
                    borderTopLeftRadius: Constants.CORNER_RADIUS,
                    borderTopRightRadius: Constants.CORNER_RADIUS
                }}>
                    <View style={[commonStyles.viewHorizontal, {
                        flex: 0, alignItems: 'center',
                        marginTop: Constants.MARGIN_X_LARGE
                    }]}>
                        <ImageLoader
                            resizeModeType={'contain'}
                            style={{ height: 50, width: 50, marginHorizontal: Constants.MARGIN_X_LARGE }}
                            path={pathToResource} />
                        <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} ellipsizeMode={"tail"} style={[commonStyles.text, { margin: 0 }]} >{nameProduct}</Text>
                            <Text style={[commonStyles.text, { margin: 0, color: Colors.COLOR_PRIMARY }]} >{StringUtil.formatStringCashNoUnit(price)}</Text>
                        </View>
                        <TouchableOpacity style={{ marginHorizontal: Constants.MARGIN_X_LARGE }}
                            onPress={() => this.hideModal()}>
                            <Image source={ic_cancel_black} />
                        </TouchableOpacity>
                    </View>
                    <View style={[{
                        marginTop: Constants.MARGIN_X_LARGE,
                        marginRight: Constants.MARGIN_X_LARGE
                    }]}>
                        <Text style={[commonStyles.text, {
                            margin: 0,
                            marginHorizontal: Constants.MARGIN_24,
                            marginBottom: Constants.MARGIN
                        }]} >Màu sắc</Text>
                        <FlatListCustom
                            style={{ height: 48 }}
                            horizontal={true}
                            data={colors}
                            renderItem={this.renderItemColor.bind(this)}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                    {/* Size */}
                    <View style={[{
                        marginTop: Constants.MARGIN_X_LARGE
                    }]}>
                        <Text style={[commonStyles.text, { margin: 0, marginLeft: Constants.MARGIN_24, marginBottom: Constants.MARGIN }]} >Kích cỡ</Text>
                        <FlatListCustom
                            style={{ height: 52 }}
                            horizontal={true}
                            data={sizes}
                            itemPerCol={1}
                            renderItem={this.renderItemSize.bind(this)}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                    {/* Quantity */}
                    <View style={[commonStyles.viewCenter, {
                        backgroundColor: Colors.COLOR_BACKGROUND,
                        justifyContent: 'space-between',
                        marginBottom: 0,
                        flexDirection: 'row',
                        paddingHorizontal: Constants.PADDING_X_LARGE,
                    }]}>
                        <TouchableOpacity onPress={() => {
                            this.setState({
                                numberProduct: this.state.numberProduct - 1
                            })
                        }}>
                            <Image source={ic_minus_gray} />
                        </TouchableOpacity>
                        <TextInput
                            value={this.state.numberProduct.toString()}
                            onChangeText={(text) => {
                                if (text < 0 || Utils.isNull(text)) {
                                    this.setState({ numberProduct: parseInt(0) })
                                } else {
                                    this.setState({ numberProduct: parseInt(text) })
                                }
                            }}
                            style={[commonStyles.text, {
                                flexGrow: 1, backgroundColor: Colors.COLOR_BACKGROUND,
                                textAlign: 'center', color: Colors.COLOR_GRAY
                            }]}
                            underlineColorAndroid='transparent'
                            keyboardType={"numeric"}
                        />
                        <TouchableOpacity onPress={() => {
                            this.setState({
                                numberProduct: this.state.numberProduct + 1
                            })
                        }}>
                            <Image source={ic_plus_gray} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={() => isAddItem ? this.addItemToCart() : this.updateItemCart()}
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        style={[commonStyles.viewCenter, {
                            paddingVertical: Constants.PADDING_LARGE,
                            borderRadius: Constants.CORNER_RADIUS,
                            backgroundColor: Colors.COLOR_PRIMARY,
                            marginHorizontal: Constants.MARGIN_X_LARGE,
                            marginBottom: Constants.MARGIN_X_LARGE
                        }]}>
                        <Text style={[commonStyles.text, { color: Colors.COLOR_WHITE }]}>{isAddItem ? "THÊM VÀO GIỎ HÀNG" : "CẬP NHẬT"}</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    /**
     * Add item to cart
     */
    addItemToCart() {
        const { indexColor, indexSize, numberProduct } = this.state
        const { price } = this.props
        let data = { indexColor, indexSize, price, numberProduct }
        this.props.onPress(data)
    }

    /**
     * Update item cart
     */
    updateItemCart() {
        const { indexColor, indexSize, numberProduct } = this.state
        const { price } = this.props
        let data = { indexColor, indexSize, price, numberProduct }
        this.props.onPress(data)
    }
}