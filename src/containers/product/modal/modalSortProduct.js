import React, { Component } from "react";
import { ImageBackground, Text, View, Image, TouchableOpacity, StyleSheet, Dimensions, Platform, ScrollView } from "react-native";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import commonStyles from "styles/commonStyles";
import Modal from "react-native-modal";
import Utils from "utils/utils";
import ic_close from "images/ic_close.png";
import { colors } from "react-native-elements";
import styles from "./styles";
import sortType from "enum/sortType";

const screen = Dimensions.get("window");
const deviceWidth = screen.width;
const deviceHeight = screen.height

// const MIN_PRICE = 0;
// const MAX_PRICE = 1000000000;
const WIDTH_ITEM = deviceWidth - 40
const HEIGHT_ITEM = 52

export default class ModalSortProduct extends Component {

    constructor(props) {
        super(props)
        this.state = {
            selected: sortType.DATE_MOST_RECENT,
            isVisible: false
        };
        this.listTextSort = [
            // "Sắp theo sản phẩm mới nhất",
            // "Sắp theo sản phẩm cũ nhất",
            "Sắp theo giá thấp - cao",
            "Sắp theo giá cao - thấp",
            // "Sắp xếp theo giảm giá nhiều",
            // "Sắp xếp theo giảm giá ít"
        ]
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.toggleModal()
        }
    }

    /**
     * On select
     * @param {*} selected 
     */
    onSelect(selected) {
        this.setState({
            selected
        })
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
    }

    render() {
        const { selected, isVisible } = this.state;
        return (
            <Modal
                ref={"modalSortProduct"}
                style={{ alignItems: 'flex-start', backgroundColor: Colors.COLOR_WHITE, margin: 0 }}
                isVisible={isVisible}
                animationIn="slideInRight"
                animationOut="slideOutRight"
                onBackButtonPress={() => this.hideModal()}
            >
                <View style={{ width: "100%", flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: Constants.HEADER_HEIGHT }}>
                    <TouchableOpacity
                        style={[commonStyles.viewCenter, {
                            position: 'absolute', left: 0, top: 0,
                            padding: Constants.PADDING_X_LARGE,
                        }]}
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        onPress={() => this.hideModal()}>
                        <Image source={ic_close} />
                    </TouchableOpacity>
                    <Text style={[commonStyles.text]}>LỌC KẾT QUẢ</Text>
                </View>
                <ScrollView style={{ flex: 1 }}>
                    <View>
                        {this.listTextSort.map((text, index) => {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    onPress={() => this.onSortProduct(index)}>
                                    <View style={[styles.button, {
                                        backgroundColor: index == selected ? Colors.COLOR_PRIMARY : Colors.COLOR_WHITE
                                    }]}>
                                        <Text style={[styles.text, {
                                            color: index == selected ? Colors.COLOR_WHITE : Colors.COLOR_TEXT
                                        }]}>{text}</Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </ScrollView>
            </Modal >
        );
    }

    /**
     * On Sort product
     */
    onSortProduct(index) {
        this.setState({
            selected: index
        })
        this.props.onSortProduct(index)
    }
}