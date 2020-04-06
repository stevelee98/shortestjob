import React, { Component } from "react";
import { ImageBackground, Text, View, Image, TouchableOpacity, StyleSheet, Dimensions, Platform, ScrollView } from "react-native";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import commonStyles from "styles/commonStyles";
import Modal from "react-native-modal";
import Utils from "utils/utils";
import ic_cancel_white from "images/ic_cancel_white.png";
import { colors } from "react-native-elements";

const screen = Dimensions.get("window");
const deviceWidth = screen.width;
const deviceHeight = screen.height

const MIN_PRICE = 0;
const MAX_PRICE = 100000000000;

export default class ModalSortNewsSellingVehicle extends Component {

    constructor(props) {
        super(props)
        this.state = {
            selected: 0,
            isVisible: false
        };
        this.listTextSort = [
            "Sắp theo bài đăng mới nhất",
            "Sắp theo bài đăng cũ nhất",
            "Sắp theo giá thấp - cao",
            "Sắp theo giá cao - thấp"
        ]
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.toggleModal()
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

    render() {
        const { selected, isVisible } = this.state;
        return (
            <Modal
                style={{ alignItems: 'flex-start' }}
                isVisible={isVisible}
                deviceWidth={deviceWidth}
                deviceHeight={deviceHeight}
                animationIn="zoomInDown"
                animationOut="zoomOutUp"
                onBackButtonPress={() => this.props.onBack()}
            >
                <View style={{
                    position: 'absolute',
                    top: Constants.PADDING_X_LARGE,
                    right: Constants.PADDING_X_LARGE
                }} >
                    <TouchableOpacity onPress={() => this.props.onBack()}>
                        <Image
                            source={ic_cancel_white} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={{ flex: 1, marginTop: Constants.MARGIN_XX_LARGE * 3 }}>
                    {this.listTextSort.map((text, index) => {
                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={() => this.onSort(index)}>
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
                </ScrollView>
            </Modal >
        );
    }

    /**
     * On Sort news selling vehicle
     */
    onSort(index) {
        this.setState({
            selected: index
        })
        let filter = {
            minPrice: MIN_PRICE,
            maxPrice: MAX_PRICE,
            typeSort: index,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            }
        }
        this.props.onSort(filter)
    }
}

const styles = StyleSheet.create({
    button: {
        ...commonStyles.shadowOffset,
        width: deviceWidth - 40,
        paddingVertical: Constants.PADDING_X_LARGE,
        borderRadius: Constants.CORNER_RADIUS,
        marginTop: Constants.MARGIN_X_LARGE
    },
    text: {
        ...commonStyles.text,
        margin: 0,
        paddingHorizontal: Constants.PADDING_X_LARGE
    }
});