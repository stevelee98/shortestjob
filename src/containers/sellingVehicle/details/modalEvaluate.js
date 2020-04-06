import React, { Component } from "react";
import { ImageBackground, View, StatusBar, Image, TouchableWithoutFeedback, BackHandler, ScrollView, Alert, Linking, RefreshControl, StyleSheet, Slider, TextInput, Dimensions, FlatList, TouchableHighlight, TouchableOpacity } from "react-native";
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text, Card, CardItem, Form } from "native-base";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import commonStyles from "styles/commonStyles";
import BaseView from "containers/base/baseView"
import TextInputCustom from "components/textInputCustom";
import ModalDropdown from 'components/dropdown';
import I18n, { localizes } from "locales/i18n";
import StringUtil from "utils/stringUtil";
import { Fonts } from "values/fonts";
import { months } from "moment";
import ServiecType from 'enum/serviceType';
import FlatListCustom from "components/flatListCustom";
import Modal from 'react-native-modalbox';
import moment from 'moment';
import DateUtil from "utils/dateUtil";
import ic_close_red from 'images/ic_close.png';
import { CheckBox } from 'react-native-elements';
import StarRating from 'react-native-star-rating';
import styles from './styles';
import Utils from "utils/utils";

const screen = Dimensions.get("window");

export default class ModalEvaluate extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            description: null,
            isValidateStar: false,
            starCount: 0
        };
    }

    componentDidUpdate = (prevProps, prevState) => {
    }

    componentWillMount = () => {
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
    handleData() { }

    /**
     * Show Modal Week
     */
    showModal() {
        this.refs.modalEvaluate.open();
    }

    /**
     * hide Modal Week
     */
    hideModal() {
        this.refs.modalEvaluate.close();
    }

    componentWillUpdate(nextProps, nextState) {
    }

    componentWillUnmount = () => {
    }

    render() {
        return (
            <Modal
                ref={"modalEvaluate"}
                style={{
                    backgroundColor: "#00000000",
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                backdrop={true}
                onClosed={() => {
                    this.hideModal()
                }}
                backButtonClose={true}
            >
                <View style={[commonStyles.shadowOffset, {
                    borderRadius: Constants.MARGIN,
                    width: screen.width - Constants.MARGIN_X_LARGE * 2,
                    backgroundColor: Colors.COLOR_WHITE,
                    alignItems: 'center'
                }]}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                        </View>
                        <TouchableOpacity style={{
                            padding: Constants.PADDING_LARGE,
                            paddingBottom: 0
                        }}
                            onPress={() => {
                                this.hideModal();
                            }}>
                            <Image source={ic_close_red}
                                style={{ width: Fonts.FONT_SIZE_XX_LARGE, height: Fonts.FONT_SIZE_XX_LARGE }}
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={[commonStyles.textBold, { margin: Constants.MARGIN_X_LARGE, marginTop: 0, fontSize: Fonts.FONT_SIZE_X_LARGE }]}>
                        Gửi đánh giá
                    </Text>
                    <ScrollView
                        keyboardShouldPersistTaps='always'
                        showsVerticalScrollIndicator={false}>
                        {/* stars rating */}
                        <View style={[commonStyles.viewCenter, { flex: 1, paddingTop: Constants.PADDING_LARGE }]}>

                            <View style={[commonStyles.viewCenter, { width: 100 }]}>
                                <StarRating
                                    iconSet={'MaterialIcons'}
                                    fullStar={'star'}
                                    halfStar={'star-half'}
                                    emptyStar={'star'}
                                    emptyStarColor={'#A0A5AF'}
                                    fullStarColor={Colors.COLOR_GOLD}
                                    starSize={50}
                                    disabled={false}
                                    maxStars={5}
                                    rating={this.state.starCount}
                                    selectedStar={(rating) => this.onStarRatingPress(rating)}
                                    starStyle={{ margin: 0 }}
                                />
                            </View>
                        </View>
                        {/* content */}
                        <View style={{ marginBottom: Constants.PADDING_LARGE }}>
                            <TextInputCustom
                                refInput={input => (this.description = input)}
                                // title={'Nội dung'}
                                // warnTitle={"Vui lòng nhập nội dung!"}
                                // isValidate={isValidate}
                                value={this.state.description}
                                onChangeText={(text) => { this.setState({ description: text }) }}
                                onSubmitEditing={() => {
                                    this.description.focus();
                                }}
                                isMultiLines={true}
                                placeholder={'Viết đánh giá ...'}
                                keyboardType="default"
                                editable={true}
                                numberOfLines={5}
                                multiline={true}
                                inputNormalStyle={{
                                    backgroundColor: Colors.COLOR_BACKGROUND,
                                    borderRadius: Constants.CORNER_RADIUS
                                }}
                            />
                        </View>
                        {this.renderCommonButton(
                            "Gửi",
                            { color: Colors.COLOR_WHITE },
                            {
                                margin: 0,
                                backgroundColor: Colors.COLOR_PRIMARY,
                                width: screen.width - Constants.MARGIN_X_LARGE * 4
                            },
                            () => {
                                const { description } = this.state;
                                if (this.state.starCount == 0) {
                                    this.showMessage('Vui lòng chọn sao đánh giá!')
                                } else if (Utils.isNull(description) || Utils.isNull(description.trim())) {
                                    this.showMessage('Vui lòng nhập đánh giá!')
                                    this.description.focus();
                                } else if (Utils.validateSpaces(description.trim())) {
                                    this.showMessage('Vui lòng nhập đánh giá!')
                                    this.description.focus();
                                } else {
                                    this.props.sendRate(this.state.starCount, this.state.description);
                                    this.hideModal();
                                    this.setState({ starCount: 0, description: null })
                                }
                            })
                        }
                    </ScrollView>
                </View>
            </Modal>
        );
    }

    /**
     * Change value star
     * @param {*} rating 
     */
    onStarRatingPress(rating) {
        this.setState({
            starCount: rating,
            isValidateStar: false
        });
    }
}