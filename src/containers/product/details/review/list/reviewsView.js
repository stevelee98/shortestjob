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
import ItemReview from '../../itemReview';

class ReviewsView extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
        };
        const { productId } = this.props.navigation.state.params;
        this.productId = productId
        this.reviews = []
        this.filter = {
            productId: this.productId,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            }
        }
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
        this.props.getReviewsOfProduct(this.filter)
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
                if (this.props.action == getActionSuccess(ActionEvent.GET_REVIEWS_OF_PRODUCT)) {
                    if (!Utils.isNull(data.data)) {
                        if (data.data.length < Constants.PAGE_SIZE) {
                            this.setState({
                                enableLoadMore: false
                            })
                        } else {
                            this.setState({
                                enableLoadMore: true
                            })
                        }
                        if (data.data.length > 0) {
                            data.data.forEach((item, index) => {
                                this.reviews.push({ ...item })
                            });
                        }
                        this.isLoadMore = true
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
        this.reviews = []
        this.filter.paging.page = 0
        this.props.getReviewsOfProduct(this.filter)
    }

    /**
     * Render btn right
     */
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
                length={this.reviews.length}
                data={item}
                index={index}
            />
        )
    }

    /**
     * Get more testing
     */
    getMoreReview = () => {
        if (this.isLoadMore) {
            this.isLoadMore = false
            this.filter.paging.page += 1
            this.props.getReviewsOfProduct(this.filter)
        }
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
                    <FlatListCustom
                        style={{
                        }}
                        data={this.reviews}
                        renderItem={this.renderItemReview.bind(this)}
                        showsVerticalScrollIndicator={false}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        enableLoadMore={this.state.enableLoadMore}
                        onLoadMore={() => {
                            this.getMoreReview()
                        }}
                    />
                    {this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    data: state.reviews.data,
    isLoading: state.reviews.isLoading,
    error: state.reviews.error,
    errorCode: state.reviews.errorCode,
    action: state.reviews.action
});

const mapDispatchToProps = {
    ...actions
};

export default connect(mapStateToProps, mapDispatchToProps)(ReviewsView);