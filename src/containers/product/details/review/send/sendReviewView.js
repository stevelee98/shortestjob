import React, { Component } from 'react';
import { View, Text, ImageBackground, ScrollView, RefreshControl, TouchableOpacity, Image, TextInput, Keyboard, Dimensions, BackHandler } from 'react-native';
import BaseView from 'containers/base/baseView';
import styles from './styles';
import { Header, Container, Root, Title, Left, Body, Right, Content, Form } from 'native-base';
import * as actions from 'actions/userActions'
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import ic_search_white from 'images/ic_search_white.png';
import ic_list_grey from "images/ic_list_grey.png";
import ic_grid_grey from "images/ic_grid_grey.png";
import ic_filter_grey from "images/ic_filter_grey.png";
import ic_sort_grey from "images/ic_sort_grey.png";
import ic_back_white from "images/ic_back_white.png";
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
const screen = Dimensions.get("window");
import ic_heart_red from "images/ic_heart_red.png";
import ic_heart_white from "images/ic_heart_white.png";
import ic_home_white from "images/ic_home_white.png";
import StringUtil from 'utils/stringUtil';
import DateUtil from 'utils/dateUtil';
import Utils from 'utils/utils';
import StorageUtil from 'utils/storageUtil';
import firebase from 'react-native-firebase';
import DialogCustom from 'components/dialogCustom';
import ItemNewsSellingVehicleInterest from 'containers/sellingVehicle/items/itemNewsSellingVehicleInterest';
import userType from 'enum/userType';
import StarRating from 'react-native-star-rating';
import TextInputCustom from 'components/textInputCustom';

class SendReviewView extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            starCount: 0,
            title: "",
            content: ""
        };
        const { productId } = this.props.navigation.state.params;
        this.productId = productId
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.getSourceUrlPath()
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            //this callback is executed when your Promise is resolved
            console.log("user", user);
            if (!Utils.isNull(user)) {
                this.userInfo = user;
            } else {
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
                if (this.props.action == getActionSuccess(ActionEvent.SEND_REVIEW_PRODUCT)) {
                    if (data) {
                        this.sendSuccess = true
                    } else {
                        this.showMessage('Gửi đánh giá thất bại. Vui lòng thử lại')
                        this.state.title = ""
                        this.state.content = ""
                        this.state.starCount = 0
                        this.titleRef.focus()
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    //onRefreshing
    handleRefresh = () => {
        this.setState({
            refreshing: false
        })
    }

    renderRightMenu = () => {
        return (
            <TouchableOpacity
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    right: 0,
                    marginRight: Constants.PADDING_12,
                }}
                onPress={() => { alert("OK") }}>
                <Image
                    source={ic_chat_white}
                    resizeMode={'contain'} />
            </TouchableOpacity>
        )
    }

    /**
     * Change value star
     * @param {*} rating 
     */
    onStarRatingPress(rating) {
        this.setState({
            starCount: rating
        });
    }

    /**
     * Validate data
     */
    validateData() {
        const { title, content } = this.state;
        if (Utils.isNull(title)) {
            this.titleRef.focus()
            return false;
        } else if (Utils.isNull(content)) {
            this.contentRef.focus()
            return false;
        } else {
            return true;
        }
    }

    /**
     * Click btn send review
     */
    onPressSendReviewProduct() {
        const { title, content, starCount } = this.state;
        if (this.validateData()) {
            this.props.sendReviewProduct({
                title: title,
                review: content,
                star: starCount,
                productId: this.productId
            })
        }
    }

    renderDialogSendReviewSuccess = () => {
        return (
            <DialogCustom
                visible={this.sendSuccess}
                isVisibleOneButton={true}
                isVisibleContentText={true}
                textBtn={"Đồng ý"}
                contentText={"Gửi đánh giá thành công"}
                onPressBtn={() => {
                    this.onBack()
                }}
            />
        )
    }

    render() {
        return (
            <Container style={styles.container}>
                <Root>
                    {/* {Header home view} */}
                    <Header style={{ backgroundColor: Colors.COLOR_BACKGROUND, borderBottomWidth: 0 }}>
                        {this.renderHeaderView({
                            visibleStage: false,
                            title: "ĐÁNH GIÁ",
                            titleStyle: {},
                            renderRightMenu: this.renderRightMenu
                        })}
                    </Header>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={[commonStyles.viewCenter, { flex: 1 }]}>
                            <View style={[commonStyles.viewCenter, { width: 100 }]}>
                                <StarRating
                                    iconSet={'MaterialIcons'}
                                    fullStar={'star'}
                                    emptyStar={'star'}
                                    emptyStarColor={'#A0A5AF'}
                                    fullStarColor={Colors.COLOR_PRIMARY}
                                    starSize={36}
                                    disabled={false}
                                    maxStars={5}
                                    rating={this.state.starCount}
                                    selectedStar={(rating) => this.onStarRatingPress(rating)}
                                    starStyle={{ margin: Constants.MARGIN }}
                                />
                                <Text style={[commonStyles.text]}>{this.state.starCount}/5</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <TextInputCustom
                                refInput={r => (this.titleRef = r)}
                                isInputNormal={true}
                                placeholder={"Tiêu đề"}
                                onChangeText={(text) => {
                                    this.setState({ title: text })
                                }}
                                value={this.state.title}
                                onSubmitEditing={() => {
                                    this.contentRef.focus();
                                }}
                                keyboardType="default"
                                returnKeyType={"next"}
                                inputNormalStyle={[commonStyles.touchInputSpecial, commonStyles.marginForShadow]}
                            />
                            <TextInputCustom
                                refInput={r => (this.contentRef = r)}
                                isInputNormal={true}
                                placeholder={"Cảm nhận của bạn về sản phẩm"}
                                onChangeText={(text) => {
                                    this.setState({ content: text })
                                }}
                                value={this.state.content}
                                onSubmitEditing={() => {
                                    Keyboard.dismiss()
                                }}
                                keyboardType="default"
                                returnKeyType={"done"}
                                inputNormalStyle={[commonStyles.touchInputSpecial, commonStyles.marginForShadow]}
                            />
                        </View>
                    </ScrollView>
                    {this.renderCommonButton(
                        "ĐĂNG ĐÁNH GIÁ",
                        { color: Colors.COLOR_WHITE },
                        {
                            marginVertical: 0,
                            marginHorizontal: 0,
                            margin: 0,
                            marginHorizontal: Constants.MARGIN_X_LARGE
                        },
                        () => {
                            this.onPressSendReviewProduct()
                        }
                    )}
                    {this.showLoadingBar(this.props.isLoading)}
                    {this.renderDialogSendReviewSuccess()}
                </Root>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    data: state.sendReview.data,
    isLoading: state.sendReview.isLoading,
    error: state.sendReview.error,
    errorCode: state.sendReview.errorCode,
    action: state.sendReview.action
});

const mapDispatchToProps = {
    ...actions
};

export default connect(mapStateToProps, mapDispatchToProps)(SendReviewView);