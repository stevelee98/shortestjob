import React, { Component } from "react";
import { ImageBackground, Text, View, Image, TouchableOpacity, StyleSheet, Dimensions, Platform, ScrollView } from "react-native";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import commonStyles from "styles/commonStyles";
import Modal from "react-native-modal";
import Utils from "utils/utils";
import ic_close from "images/ic_close.png";
import { colors } from "react-native-elements";
import StringUtil from "utils/stringUtil";
import styles from "./styles";
import * as productActions from 'actions/productActions';
import * as commonActions from 'actions/commonActions'
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import BaseView from "containers/base/baseView";
import filterProductType from "enum/filterProductType";

const screen = Dimensions.get("window");
const deviceWidth = screen.width;
const deviceHeight = screen.height

const PRICE_GAP = 200000;
const WIDTH_ITEM = deviceWidth - 40
const HEIGHT_ITEM = 52

class ModalFilterProduct extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            selected: null,
            selectedParent: null,
            isVisible: false,
            renderChildFilter: false
        };
        this.listFilter = []
        this.listChildFilter = []
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.toggleModal()
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
                if (this.props.action == getActionSuccess(ActionEvent.GET_CATEGORY_FILTER_PRODUCT)) {
                    console.log("GET_CATEGORY_FILTER_PRODUCT: ", data)
                    if (!Utils.isNull(data)) {
                        this.listFilter = [
                            {
                                name: "Giá",
                                content: [
                                    200000, 400000, 600000, 800000, 1000000
                                ],
                                type: filterProductType.PRICE
                            }
                        ]
                        if (!Utils.isNull(data.trademarks)) {
                            let trademarks = []
                            data.trademarks.forEach(item => {
                                trademarks.push({ ...item })
                            })
                            this.listFilter.push({
                                name: "Thương hiệu",
                                content: trademarks,
                                type: filterProductType.TRADEMARK
                            })
                        }
                        if (!Utils.isNull(data.origins)) {
                            let origins = []
                            data.origins.forEach(item => {
                                origins.push({ ...item })
                            })
                            this.listFilter.push({
                                name: "Xuất xứ",
                                content: origins,
                                type: filterProductType.ORIGIN
                            })
                        }
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    /**
     * Toggle modal
     */
    toggleModal = () => {
        this.setState({
            isVisible: this.props.isVisible
        })
    }

    /**
     * Hide modal
     */
    hideModal() {
        this.props.onBack()
        this.setState({
            renderChildFilter: false
        })
        this.listChildFilter = []
    }

    componentDidMount() {
        this.props.getCategoryFilterProduct()
    }


    render() {
        const { isVisible, renderChildFilter, selected } = this.state;
        return (
            <Modal
                ref={"modalFilterProduct"}
                style={{ alignItems: 'flex-start', margin: 0, padding: 0 }}
                isVisible={isVisible}
                deviceWidth={deviceWidth}
                deviceHeight={deviceHeight}
                animationIn="zoomInDown"
                animationOut="zoomOutUp"
                onBackButtonPress={() => this.hideModal()}
            >
                <ScrollView style={{ flex: 1, marginTop: Constants.MARGIN_XX_LARGE * 2 }}>
                    {!renderChildFilter ? this.listFilter.map((item, index) => {
                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={() => this.gotoChildFilter(index)}>
                                <View style={styles.button}>
                                    <Text style={[styles.text, {
                                        color: Colors.COLOR_TEXT
                                    }]}>{item.name}</Text>
                                    <Text style={[styles.text, {
                                        color: Colors.COLOR_TEXT
                                    }]}>Tất cả</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    }) :
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    onPress={() => this.onFilterProduct(null, null)}>
                                    <View style={[styles.button, {
                                        width: WIDTH_ITEM - HEIGHT_ITEM - Constants.MARGIN_LARGE,
                                        backgroundColor: !Utils.isNull(selected) ? Colors.COLOR_WHITE : Colors.COLOR_PRIMARY,
                                    }]}>
                                        <Text style={[styles.text, {
                                            color: !Utils.isNull(selected) ? Colors.COLOR_TEXT : Colors.COLOR_WHITE,
                                        }]}>Tất cả</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[commonStyles.viewCenter, commonStyles.shadowOffset, {
                                        width: HEIGHT_ITEM,
                                        height: HEIGHT_ITEM,
                                        backgroundColor: Colors.COLOR_WHITE,
                                        borderRadius: Constants.CORNER_RADIUS,
                                        marginBottom: Constants.MARGIN_LARGE
                                    }]}
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    onPress={() => this.onCloseChildFilter()}>
                                    <Image source={ic_close} />
                                </TouchableOpacity>
                            </View>
                            {this.listChildFilter.map((item, index) => {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        activeOpacity={Constants.ACTIVE_OPACITY}
                                        onPress={() => this.onFilterProduct(item, index)}>
                                        <View style={[styles.button, { backgroundColor: index == selected ? Colors.COLOR_PRIMARY : Colors.COLOR_WHITE }]}>
                                            {Utils.isNull(item.name)
                                                ? <Text style={[styles.text, {
                                                    color: index == selected ? Colors.COLOR_WHITE : Colors.COLOR_TEXT
                                                }]}>
                                                    {StringUtil.formatStringCashNoUnit(item - PRICE_GAP)} - {StringUtil.formatStringCashNoUnit(item)}
                                                </Text>
                                                : <Text style={[styles.text, {
                                                    color: index == selected ? Colors.COLOR_WHITE : Colors.COLOR_TEXT
                                                }]}>
                                                    {item.name}
                                                </Text>
                                            }
                                        </View>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    }
                </ScrollView>
            </Modal >
        );
    }

    /**
     * On close child filter
     */
    onCloseChildFilter() {
        this.setState({ renderChildFilter: false })
    }

    /**
     * Go to Child Filter
     */
    gotoChildFilter(index) {
        this.setState({
            renderChildFilter: true,
            selected: null,
            selectedParent: index
        })
        this.listChildFilter = []
        this.listFilter.forEach((item, i) => {
            if (index == i) {
                this.listChildFilter.push(...item.content)
            }
        })
    }

    /**
     * On filter product
     */
    onFilterProduct(item, index) {
        this.setState({
            selected: index
        })
        const { selectedParent } = this.state
        let toPrice = null
        let fromPrice = null
        let trademarkId = null
        let originId = null
        if (selectedParent == filterProductType.PRICE) {
            toPrice = item
            if (!Utils.isNull(item)) {
                fromPrice = item - PRICE_GAP
            }
        } else if (selectedParent == filterProductType.TRADEMARK) {
            trademarkId = !Utils.isNull(item) ? item.id : null
        } else if (selectedParent == filterProductType.ORIGIN) {
            originId = !Utils.isNull(item) ? item.id : null
        }
        let filter = { toPrice, fromPrice, trademarkId, originId }
        this.props.onFilterProduct(filter)
    }
}

const mapStateToProps = state => ({
    data: state.filterProduct.data,
    isLoading: state.filterProduct.isLoading,
    error: state.filterProduct.error,
    errorCode: state.filterProduct.errorCode,
    action: state.filterProduct.action
});

const mapDispatchToProps = {
    ...productActions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(ModalFilterProduct);