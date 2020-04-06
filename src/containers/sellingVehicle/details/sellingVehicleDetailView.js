import React, { Component } from "react";
import {
    View,
    Text,
    ImageBackground,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Image,
    TextInput,
    Keyboard,
    Dimensions,
    BackHandler,
    Animated,
    InteractionManager,
    Platform,
    PermissionsAndroid,
    Share,
    LayoutAnimation,
    UIManager
} from "react-native";
import BaseView from "containers/base/baseView";
import ImagePicker from 'react-native-image-crop-picker';
import styles from "./styles";
import { Header, Container, Root, Title, Left, Body, Right } from "native-base";
import * as actions from "actions/vehicleAction";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import ic_search_white from "images/ic_search_white.png";
import ic_list_grey from "images/ic_list_grey.png";
import ic_grid_grey from "images/ic_grid_grey.png";
import ic_filter_grey from "images/ic_filter_grey.png";
import ic_sort_grey from "images/ic_sort_grey.png";
import ic_back_white from "images/ic_back_white.png";
import ic_call_blue from "images/ic_call_blue.png";
import ic_chat_blue from "images/ic_chat_blue.png";
import ic_mail_blue from "images/ic_mail_blue.png";
import { Colors } from "values/colors";
import global from "utils/global";
import ImageCameraPicker from "react-native-image-picker";
import commonStyles from "styles/commonStyles";
import { Constants } from "values/constants";
import { Fonts } from "values/fonts";
import { localizes } from "locales/i18n";
import FlatListCustom from "components/flatListCustom";
import Carousel, { Pagination } from "react-native-snap-carousel";
import ImageLoader from "components/imageLoader";
import ItemNewsSellingVehicleInterest from "../items/itemNewsSellingVehicleInterest";
import ic_logo_large from "images/ic_logo_large.png";
import StringUtil from "utils/stringUtil";
import DateUtil from "utils/dateUtil";
import Utils from "utils/utils";
import StorageUtil from "utils/storageUtil";
import firebase from "react-native-firebase";
import DialogCustom from "components/dialogCustom";
import BackgroundShadow from "components/backgroundShadow";
import { StackActions, NavigationActions } from "react-navigation";
import SliderImage from "./sliderImage";
import { TextInputMask } from "react-native-masked-text";
import ic_heart_red from "images/ic_heart_red.png";
import ic_heart_white from "images/ic_heart_white.png";
import carType from 'enum/carType';
import ic_pencil_white from 'images/ic_pencil_white.png';
import ic_renew_white from 'images/ic_renew_white.png';
import ic_delete_sweep from 'images/ic_delete_sweep.png';
import screenType from 'enum/screenType';
import * as userActions from 'actions/userActions';
import statusType from 'enum/statusType';
import Hr from 'components/hr';
import img_error_404 from 'images/img_error_404.png';
import approvalStatusType from 'enum/approvalStatusType';
import HTML from 'react-native-render-html';
import ic_send from 'images/ic_send.png';
import Upload from 'lib/react-native-background-upload';
import ServerPath from "config/Server";
import ic_cancel_black from 'images/ic_cancel_black.png';
import ic_send_image from 'images/ic_send_image.png';
import ItemComment from 'containers/sellingVehicle/items/ItemComment';
import ImageResizer from "react-native-image-resizer";
import ic_eyes_white from "images/ic_eyes_white.png";
import StarRating from 'react-native-star-rating';
import TabCommentView from "../tab/tabCommentView";
import TabFacebookView from "../tab/tabFacebookView";
import ic_share_white from "images/ic_share_white.png";
import TabsCustom from "components/tabsCustom";

const CANCEL_INDEX = 2;
const optionsCamera = {
    title: "Select avatar",
    storageOptions: {
        skipBackup: true,
        path: "images"
    }
};
const screen = Dimensions.get("window");
const MAX_PRICE = 100000000000;
const SIZE_AVATAR = 48;
const SIZE_LOGO = 32;
const ITEM_HEIGHT = screen.width / 1.5;

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

class SellingVehicleDetailView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            isLoadMoreChild: false,
            opacity: 0,
            isSold: false,
            sellingItemId: null,
            isDeleteSuccess: false,
            visibleDialog: false,
            isActionButtonVisible: true,
            isComment: true,
            isFacebook: false
        };
        const { vehicleId, resourceUrlPathResize, resourceUrlPath, screenType, callBack, user, callBackTab, callRefresh, sellerId } = this.props.navigation.state.params;
        this.callRefresh = callRefresh;
        this.callBack = callBack;
        this.callBackTab = callBackTab;
        this.urlPathResource = resourceUrlPathResize;
        this.resourceUrlPath = resourceUrlPath;
        this.images = [{ pathToResource: "" }];
        this.opacity = new Animated.Value(0);
        this.isMyPost = false;
        this.onClickItem = this.onClickItem.bind(this);
        this.renderItemInterest = this.renderItemInterest.bind(this);
        this.vehicleId = vehicleId;
        this.accredited = false;
        this.entries = [
            {
                title: "hello",
                pathToResource: ""
            }
        ]
        this.screenType = !Utils.isNull(screenType) ? screenType : -1;
        this.type = {
            LIKE: 0,
            EDIT: 1,
            DELETE: 2
        }
        this.filter = {
            productId: this.productId,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
            sellerId: sellerId
        }
        this.filter = {
            productId: this.vehicleId,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
            sellerId: sellerId
        }
        this.user = user
        this.sellerId = sellerId;
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
        this.setState({ vehicleId: this.vehicleId })
        if (!Utils.isNull(this.vehicleId)) {
            this.props.getSellingVehicleDetail(this.vehicleId)
        }
        this.getSourceUrlPath();
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            if (!Utils.isNull(user)) {
                this.props.saveSellingVehicleSeen({ tableId: this.vehicleId })
                if (user.id != this.sellerId) {
                    if (this.screenType == -1 || this.screenType != screenType.FROM_NOTIFICATION) {
                        this.props.userSeenSellingItem(this.vehicleId)
                    }
                }
                this.state.user = user
            }
        }).catch(error => {
            this.saveException(error, 'componentDidMount')
        });
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE)
            .then(user => {
                //this callback is executed when your Promise is resolved
                console.log("user", user);
                if (!Utils.isNull(user)) {
                    this.userInfo = user;
                    this.setState({ user: user })
                }
            })
            .catch(error => {
                this.saveException(error, "componentWillMount");
            });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    /**
     * Refresh my data selling vehicle
     */
    requestMySellingVehiclePost() {
        let filterRequestMyPost = {
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
            userId: this.userInfo.id
        };
        this.props.getPostLiked(filterRequestMyPost);
    }

    keyboardDidShow() {
        console.log('Keyboard Shown');
    }

    keyboardDidHide() {
        console.log('Keyboard Hidden');
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST)) {
                    this.dataNewsSellingVehicleInterest.push(...data.vehicleData);
                } else if (this.props.action == getActionSuccess(ActionEvent.UPDATE_STATUS_SOLD_SELLING_POST)) {
                    if (data) {
                        this.state.isSold = true;
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.DELETE_SELLING_VEHICLE)) {
                    if (data) {
                        this.callBack ? this.callBack(this.type.DELETE) : null;
                        this.setState({
                            isDeleteSuccess: true
                        });
                    }
                } else if (
                    this.props.action == getActionSuccess(ActionEvent.GET_SELLING_VEHICLE_DETAIL) ||
                    this.props.action == getActionSuccess(ActionEvent.UPDATE_SELLING_VEHICLE)
                ) {
                    if (!Utils.isNull(data)) {
                        console.log("DATA SELLING DETAILS: ", data)
                        setTimeout(() => {
                            if (this.props.action == getActionSuccess(ActionEvent.UPDATE_SELLING_VEHICLE)) {
                                this.handleRefresh();
                                this.callBack ? this.callBack(this.type.EDIT) : null;
                            }
                        }, 1500);

                        if (!Utils.isNull(this.userInfo) && this.userInfo.id == data.seller.id) {
                            this.isMyPost = true;
                        }
                        if (!Utils.isNull(data.listImage)) {
                            this.images = data.listImage;
                            this.images.forEach(item => {
                                item.pathToResource = item.pathToResource.indexOf("http") != -1 ? item.pathToResource : this.resourceUrlPathResize.textValue + "=" + item.pathToResource;
                            });
                            if (!Utils.isNull(data.seller.avatarPath)) {
                                this.avatarSeller = data.seller.avatarPath.indexOf("http") != -1 ? data.seller.avatarPath : this.resourceUrlPath.textValue + "/" + data.seller.avatarPath;
                                this.setState({ avatar: data.seller.avatarPath.indexOf("http") != -1 ? data.seller.avatarPath : this.resourceUrlPathResize.textValue + "=" + data.seller.avatarPath })
                                this.avatarPath = data.seller.avatarPath;
                            } else {
                                this.avatarSeller = "";
                            }
                            if (this.images.length == 0) {
                                this.images = this.entries;
                            }
                        }

                        this.state.sellingItemId = data.id
                        this.state.price = String(data.price).toString()
                        this.state.vehicleName = data.name
                        this.state.vehicleDescription = data.description
                        this.state.vehicleManufactureName = data.vehicleManufacture
                        this.state.vehicleManufactureId = data.idVehicleManufacture
                        this.state.logoVehicleManufacture = data.logoVehicleManufacture
                        this.state.vehicleModelId = data.idVehicleModel
                        this.state.vehicleModelName = data.vehicleModel
                        this.state.province = data.province
                        this.state.logoVehicleModel = data.logoVehicleModel
                        this.state.sellingStatus = data.status
                        this.state.approvalStatus = data.approvalStatus
                        this.dataSelling = data;
                        this.vehicleCode = data.code
                        this.sellerId = data.seller.id
                        this.sellerPhone = data.seller.phone
                        this.sellerName = data.seller.name
                        this.createdAt = data.createdAt
                        this.deleteAt = data.deletedAt
                        this.accredited = data.accredited
                        this.seller = data.seller
                        this.category = data.category
                        this.categoryId = data.categoriesId
                        this.provinceId = data.provinceId
                        this.state.viewCount = data.viewCount
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.USER_SEEN_SELLING_ITEM)) {
                    if (data) {
                        console.log('USER_SEEN_SELLING_ITEM', data)
                        if (this.callRefresh) {
                            this.callRefresh();
                        }
                        //this check for item favorite
                        if (this.screenType == screenType.FROM_SELLING_VEHICLE_GENERAL) {
                            this.callBack();
                        }
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.LIKE_POST)) {
                    if (data) {
                        // setTimeout(() => { this.handleRefresh() }, 50)
                        this.handleRefresh()
                        // call refresh at selling vehicle view
                        if (this.callRefresh) {
                            this.callRefresh();
                        }
                        this.callBack ? this.callBack(this.type.LIKE) : null;
                        this.callBackTab ? this.callBackTab : null;
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.RENEWS_SELLING)) {
                    if (!Utils.isNull(data)) {
                        this.dataRenews = data;
                        if (this.dataRenews == ErrorCode.RENEWS_SUCCESS) {
                            this.showMessage(localizes('sellingDetailView.renewSuccess'))
                        } else if (this.dataRenews == ErrorCode.RENEWS_LIMITTED) {
                            this.showMessage(localizes('sellingDetailView.runOutOfRenew'))
                        }
                        if (!Utils.isNull(this.vehicleId)) {
                            this.props.getSellingVehicleDetail(this.vehicleId);
                        }
                    }
                }
                else if (this.props.action == getActionSuccess(ActionEvent.CHECK_EXIST_CONVERSATION_IN_SELLING)) {
                    this.conversationId = data;
                    this.goToChatWithSeller();
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    //onRefreshing
    handleRefresh = () => {
        this.reviewsTemp = []
        this.setState({
            refreshing: false
        });
        if (!Utils.isNull(this.vehicleId)) {
            this.props.getSellingVehicleDetail(this.vehicleId);
            this.setState({ messageText: null })
        }
    };

    /**
     * Render slideShow image vehicle
     */
    renderSlideShow() {
        return (
            <View style={{ position: 'relative' }} >
                <SliderImage data={this.images} />
                <View
                    style={[commonStyles.viewHorizontal, {
                        position: 'absolute', top: Constants.MARGIN_LARGE,
                        marginLeft: Constants.MARGIN_X_LARGE
                    }]}
                >
                    <View style={[{ marginBottom: Constants.MARGIN_X_LARGE }]}>
                        <Image source={ic_eyes_white} />
                    </View>
                    <Text ellipsizeMode={"tail"}
                        style={[commonStyles.text, {
                            textAlign: 'left',
                            color: Colors.COLOR_WHITE,
                            fontSize: Fonts.FONT_SIZE_X_MEDIUM,
                            height: 40,
                            marginLeft: Constants.MARGIN
                        }]}>
                        {this.state.viewCount}
                    </Text>
                </View>
            </View>
        );
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
                key={item.id}
                data={this.dataNewsSellingVehicleInterest}
                item={item}
                index={index}
                onPress={this.onClickItem}
                resource={this.resourceUrlPathResize.textValue}
            />
        );
    }

    /**
     * On click item
     */
    onClickItem(item) {
        this.props.navigation.pop();
        this.props.navigation.navigate("SellingVehicleDetail", {
            vehicleId: item.id,
            urlPathResource: this.resourceUrlPathResize.textValue
        });
    }

    /**
     * You may be interested
     */
    renderSellingPostInterest = () => {
        return this.dataNewsSellingVehicleInterest.length > 0 ? (
            <View>
                <Text style={[commonStyles.text, { paddingHorizontal: Constants.PADDING_24 }]}>{localizes("sellingVehicle.titlePostInterest")}</Text>
                <View>
                    <FlatListCustom
                        getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                        keyExtractor={(item, index) => item.id.toString()}
                        horizontal={true}
                        data={this.dataNewsSellingVehicleInterest}
                        itemPerCol={1}
                        renderItem={this.renderItemInterest}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
            </View>
        ) : (
                <View />
            );
    };

    /**
     * Render Image
     * @param {*} imagePath
     * @param {*} type // 0: image avatar, 1: image logo vehicle
     */
    renderImage(imagePath, type, typeImage) {
        let isSocial = !Utils.isNull(this.avatarPath) ? (this.avatarPath.indexOf("http") != -1 ? true : false) : false

        if (type == 0) {
            return (
                <ImageLoader
                    resizeModeType={"cover"}
                    style={[
                        {
                            width: SIZE_AVATAR,
                            height: SIZE_AVATAR,
                            marginRight: Constants.MARGIN_X_LARGE,
                            borderRadius: Constants.PADDING_24
                        }
                    ]}
                    path={!Utils.isNull(imagePath) ? imagePath : null}
                />
            )
        }
    }

    /**
     * Function for btn chat
     */
    onPressSoldVehicle() {
        if (this.userInfo.id !== this.sellerId) {
            this.userId = this.userInfo.id;
            this.userMemberChatId = this.userAdmin.numericValue;
            this.props.checkExistConversation({ userMemberChatId: this.userMemberChatId });
        } else {
            this.setState({
                isShowDialog: true
            });
        }
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
                contentTitle={localizes('confirm')}
                textBtnOne={localizes('cancel')}
                textBtnTwo={localizes('confirm')}
                contentText={"Xác nhận xe đã được bán?"}
                onTouchOutside={() => {
                    this.setState({ isShowDialog: false });
                }}
                onPressX={() => {
                    this.setState({ isShowDialog: false });
                }}
                onPressBtnPositive={() => {
                    this.setState({ isShowDialog: false });
                    this.props.updateStatusSoldSellingPost(this.vehicleId);
                }}
            />
        );
    }

    /**
     * Is scroll to end
     */
    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
    }

    /**
     * go to seller 
     */
    gotoInfoSeller = (seller) => {
        this.props.navigation.navigate('InfoSeller', {
            sellerId: seller.id,
            item: seller,
            avatarSeller: this.avatarSeller,
            resourceUrlPathResize: this.urlPathResource,
            user: this.user,
            callBack: this.handleRefresh
        });
    }

    render() {
        const star = !Utils.isNull(this.seller) ? this.seller.star : null;
        if (!Utils.isNull(this.state.user)) {
            if (!Utils.isNull(this.state.user.avatarPath)) {
                var avatarUser = this.state.user.avatarPath.indexOf("http") != -1 ? this.state.user.avatarPath :
                    ((!Utils.isNull(this.resourceUrlPath) ? this.resourceUrlPath.textValue : null) + '/' + this.state.user.avatarPath)
            } else { var avatarUser = '' }
        } else { var avatarUser = '' }

        this.tabs = [
            {
                id: 1,
                name: 'Bình luận',
                child:
                    <TabCommentView
                        vehicleId={this.vehicleId}
                        sellerId={this.sellerId}
                        sellingItemId={this.state.sellingItemId}
                        vehicleName={this.state.vehicleName}
                        navigation={this.props.navigation}
                        isLoadMoreChild={this.state.isLoadMoreChild}
                    />
            },
            {
                id: 2,
                name: 'Facebook',
                child: <TabFacebookView />,
            }
        ];

        return (
            <Container style={styles.container}>
                <Root>
                    <View style={{ flexGrow: 1 }}>
                        {/* {Header home view} */}
                        <Header style={{ backgroundColor: Colors.COLOR_PRIMARY, borderBottomWidth: 0 }}>{this.renderToolbar()}</Header>
                        {!Utils.isNull(this.vehicleId) ?
                            <ScrollView
                                keyboardShouldPersistTaps='always'
                                contentContainerStyle={{ flexGrow: 1 }}
                                style={{
                                    flex: 1,
                                    position: "relative"
                                }}
                                scrollEnabled={true}
                                onScroll={event => {
                                    this.offsetY = event.nativeEvent.contentOffset.y;
                                    if (this.offsetY > screen.width + Constants.MARGIN_XX_LARGE * 2) {
                                        /* your logic */
                                        Animated.timing(this.opacity, {
                                            toValue: 1,
                                            duration: 100,
                                            useNativeDriver: true
                                        }).start();
                                    } else {
                                        Animated.timing(this.opacity, {
                                            toValue: 0,
                                            duration: 100,
                                            useNativeDriver: true
                                        }).start();

                                    }
                                    // comment
                                    {
                                        if (this.isCloseToBottom(event.nativeEvent)) {
                                            this.setState({ isLoadMoreChild: true });
                                            setTimeout(() => {
                                                this.setState({ isLoadMoreChild: false });
                                            })
                                        } else {
                                            this.setState({ isLoadMoreChild: false });
                                        }
                                    }
                                    const CustomLayoutLinear = {
                                        duration: 150,
                                        create: {
                                            type: LayoutAnimation.Types.spring,
                                            property: LayoutAnimation.Properties.scaleY,
                                            springDamping: 0.7
                                        },
                                        delete: {
                                            type: LayoutAnimation.Types.linear,
                                            property: LayoutAnimation.Properties.opacity,
                                            // springDamping: 0.7
                                        },
                                        //update: { type: LayoutAnimation.Types.keyboard },

                                    }

                                    const currentOffset = event.nativeEvent.contentOffset.y
                                    const direction = (currentOffset > 0 && currentOffset > this.listViewOffset)
                                        ? 'down'
                                        : 'up'
                                    const isActionButtonVisible = direction === 'up'
                                    if (isActionButtonVisible !== this.state.isActionButtonVisible) {
                                        LayoutAnimation.configureNext(CustomLayoutLinear)
                                        this.setState({ isActionButtonVisible })
                                    }

                                    this.listViewOffset = currentOffset
                                }}
                                scrollEventThrottle={16}
                                refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.handleRefresh} />}
                            >
                                {/* Image */}
                                {this.renderSlideShow()}
                                <View style={{
                                    backgroundColor: Colors.COLOR_TRANSPARENT,
                                    width: screen.width,
                                    paddingBottom: !this.isMyPost ? Constants.PADDING_X_LARGE - 2 + Constants.HEADER_HEIGHT : Constants.MARGIN_X_LARGE - 2
                                }}>
                                    <View style={{ flexDirection: 'row', backgroundColor: Colors.COLOR_WHITE, alignItems: 'flex-start', paddingTop: Constants.PADDING_X_LARGE, }}>
                                        {/* Info post */}
                                        {this.renderInfoSellingVehicle()}
                                        {/* Favorite */}
                                        {this.renderFavorite()}
                                    </View>

                                    <View style={[styles.viewChild, { marginTop: Constants.MARGIN_X_LARGE }]}>
                                        {/* Info seller */}

                                        <View style={[commonStyles.viewHorizontal, {
                                            alignItems: 'flex-start'
                                        }]}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    this.gotoInfoSeller(this.seller)
                                                }}
                                            >
                                                {this.renderImage(this.avatarSeller, 0)}
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    this.gotoInfoSeller(this.seller)
                                                }}
                                            >
                                                <View style={{ flex: 1, marginRight: Constants.MARGIN_X_LARGE }}>
                                                    <Text style={[commonStyles.text, { margin: 0 }]}>{this.sellerName}</Text>
                                                    {!Utils.isNull(this.seller) ?
                                                        (
                                                            <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_XX_SMALL, marginHorizontal: 0, color: Colors.COLOR_GREY_LIGHT }]}>
                                                                {localizes('sellingDetailView.from')} {!Utils.isNull(this.seller.createdAt)
                                                                    ? DateUtil.convertFromFormatToFormat(this.seller.createdAt, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE)
                                                                    : null
                                                                }
                                                            </Text>
                                                        ) : null}
                                                </View>
                                            </TouchableOpacity>
                                            {/* Rating */}
                                            {this.renderRating()}

                                        </View>
                                        <Hr color={Colors.COLOR_BACKGROUND} style={{ marginVertical: Constants.MARGIN_X_LARGE }} />

                                        {/* Description */}

                                        <View>
                                            {!Utils.isNull(this.state.vehicleDescription)
                                                ? <HTML {...{}}
                                                    baseFontStyle={{ ...commonStyles.text, lineHeight: 20 }}
                                                    ignoredStyles={['height', 'width']}
                                                    html={this.state.vehicleDescription}
                                                    imagesMaxWidth={screen.width - Constants.MARGIN_X_LARGE}
                                                    alterChildren={this.renderChildren.bind(this)} />
                                                : null
                                            }
                                        </View>

                                    </View>
                                    {/* {this.renderTap()} */}

                                    {/* {this.state.isComment ? this.renderComment() : this.renderFacebook()} */}

                                    {/* <TabsCustom
                                        tabs={!Utils.isNull(this.tabs) ? this.tabs : []}
                                        child={(tab) => {
                                            return (
                                                this.renderChild(tab.child)
                                            )
                                        }}
                                        underlineStyle={{ backgroundColor: Colors.COLOR_PRIMARY }}
                                        isRenderTabBar={false}
                                    /> */}

                                    <View style={{
                                        borderWidth: 0.5,
                                        borderColor: Colors.COLOR_BACKGROUND
                                    }} />

                                    {this.renderComment()}

                                    {this.renderDialogConfirmSold()}
                                    {this.renderDialogDelete()}
                                    {this.renderDialogDeleteSuccess()}
                                    {this.renderDialogRenews()}
                                </View>
                            </ScrollView>
                            :
                            <View style={[commonStyles.viewCenter, { backgroundColor: Colors.COLOR_WHITE }]}>
                                <Image source={img_error_404} style={{ marginTop: Constants.PADDING_XX_LARGE * 2, marginRight: Constants.MARGIN_XX_LARGE }} />
                                <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_XX_SMALL, marginBottom: Constants.PADDING_XX_LARGE * 2 }]}>
                                    Bài đăng đã được xoá
                                </Text>
                            </View>}
                        {this.state.isActionButtonVisible ? this.renderButtonShare() : null}
                        {/* {this.renderButtonShare()} */}
                        <Hr color={Colors.COLOR_BACKGROUND} />
                        {!Utils.isNull(this.vehicleId) ? this.renderContact() : null}
                        {/* load more comment */}
                        {this.isLoadMore ? this.showLoadingBar(this.props.isLoading) : null}
                    </View>
                </Root>
            </Container>

        );
    }

    /**
     * render Tap
     */
    renderTap = () => {
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 0.5,
                borderColor: Colors.COLOR_BACKGROUND
            }}>
                <TouchableOpacity
                    style={[commonStyles.viewCenter, {
                        backgroundColor: this.state.isComment ? Colors.COLOR_PRIMARY : Colors.COLOR_WHITE,
                        flex: 1
                    }]}
                    onPress={() => {
                        if (this.state.isFacebook) {
                            this.setState({ isComment: true, isFacebook: false })
                        }
                    }}
                >
                    <Text style={[this.state.isComment ? commonStyles.textBold : commonStyles.text, {
                        margin: 0,
                        textAlign: 'center',
                        paddingVertical: Constants.PADDING_X_LARGE,
                        color: this.state.isComment ? Colors.COLOR_WHITE : Colors.COLOR_TEXT
                    }]}>Bình luận</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[commonStyles.viewCenter, {
                        backgroundColor: this.state.isFacebook ? Colors.COLOR_PRIMARY : Colors.COLOR_WHITE,
                        flex: 1
                    }]}
                    onPress={() => {
                        if (this.state.isComment) {
                            this.setState({ isComment: false, isFacebook: true })
                        }
                    }}
                >
                    <Text style={[this.state.isFacebook ? commonStyles.textBold : commonStyles.text, {
                        margin: 0,
                        textAlign: 'center',
                        paddingVertical: Constants.PADDING_X_LARGE,
                        color: this.state.isFacebook ? Colors.COLOR_WHITE : Colors.COLOR_TEXT
                    }]}>Facebook</Text>
                </TouchableOpacity>

            </View>
        )
    }

    /**
     * render Rating
     */
    renderRating = () => {
        return (
            <TouchableOpacity
                onPress={() => {
                    if (!Utils.isNull(this.state.user)) {
                        this.props.navigation.navigate('RateSeller', {
                            seller: this.seller,
                            resourceUrlPath: this.resourceUrlPath,
                            callBack: this.handleRefresh
                        })
                    } else { this.showLoginView() }
                }}
                style={[commonStyles.viewCenter, { flex: 1 }]}
            >
                <View >
                    <Text style={[commonStyles.textBold, { margin: 0, textAlign: 'center' }]}>{!Utils.isNull(this.seller) ? this.seller.star : null}</Text>
                    <View style={[commonStyles.viewCenter, {}]}>
                        <StarRating
                            iconSet={'MaterialIcons'}
                            fullStar={'star'}
                            halfStar={'star-half'}
                            emptyStar={'star'}
                            emptyStarColor={'#A0A5AF'}
                            fullStarColor={Colors.COLOR_GOLD}
                            starSize={Fonts.FONT_SIZE_MEDIUM}
                            disabled={true}
                            maxStars={5}
                            rating={!Utils.isNull(this.seller) ? this.seller.star : null}
                            starStyle={{ margin: 0 }}
                        />
                    </View>
                    <Text style={[commonStyles.text, { margin: 0, textAlign: 'center' }]}> {!Utils.isNull(this.seller) ? (this.seller.countRate > 0 ? `${this.seller.countRate} đánh giá` : 'Chưa có đánh giá') : null}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    /**
     * render Info Selling Vehicle
     */
    renderInfoSellingVehicle = () => {
        return (
            <View style={[styles.viewChild, { flex: 1, paddingVertical: 0 }]}>
                <View
                    style={[
                        commonStyles.viewHorizontal,
                        {
                            alignItems: "center"
                        }
                    ]}
                >
                    <TextInput
                        ref={(ref) => this.vehicleNameRef = ref}
                        editable={false}
                        onChangeText={(text) => {
                            this.setState({
                                vehicleName: text
                            });
                        }}
                        value={this.state.vehicleName}
                        style={[commonStyles.textBold, { flex: 1, margin: 0, paddingVertical: 0, paddingLeft: 0 }]}
                        multiline={true}
                        underlineColorAndroid={Colors.COLOR_TRANSPARENT}
                        placeholder={localizes('sellingDetailView.inputName')}
                    />
                </View>
                <View style={[commonStyles.viewHorizontal]}>
                    <TextInputMask
                        editable={false}
                        keyboardType="numeric"
                        ref={"price"}
                        placeholderTextColor={Colors.COLOR_TEXT}
                        underlineColorAndroid={Colors.COLOR_TRANSPARENT}
                        type={"money"}
                        options={{
                            precision: 0,
                            separator: ".",
                            delimiter: "",
                            unit: "",
                            suffixUnit: ""
                        }}
                        value={this.state.price}
                        onChangeText={text => {
                            text == null ? this.setState({ price: 0 }) : this.setState({ price: text });
                        }}
                        style={[
                            commonStyles.text,
                            {
                                padding: 0,
                                margin: 0,
                                color: Colors.COLOR_RED
                                // marginTop: Constants.MARGIN,
                                // backgroundColor: 'red'
                            }
                        ]}
                    />
                    <Text style={[commonStyles.text, { padding: 0, margin: 4, color: Colors.COLOR_RED, marginTop: Constants.MARGIN, flex: 1 }]}>₫</Text>
                </View>
                {this.accredited ?
                    <View
                        style={[
                            commonStyles.viewHorizontal,
                            {
                                justifyContent: "space-between"
                            }
                        ]}
                    >
                        <Text style={[commonStyles.textSmall, { margin: 0, marginTop: Constants.MARGIN, color: Colors.COLOR_GREY_LIGHT }]}>
                            Đã được kiểm định
                                                </Text>
                        <Image resizeMode={"cover"} style={styles.logo} source={ic_logo_large} />
                    </View>
                    : null
                }
                <Text style={[commonStyles.textSmall, { margin: 0, marginTop: Constants.MARGIN, color: Colors.COLOR_GREY_LIGHT }]}>
                    {this.getStateApproval()}
                </Text>
                {/* Area */}
                <View style={{ marginVertical: 8 }}>
                    <Text style={[styles.textArea, { margin: 0 }]}>{this.state.province}</Text>
                </View>
            </View>
        )
    }

    /**
     * render Favorite
     */
    renderFavorite = () => {
        return (
            <View style={[commonStyles.viewCenter, { flex: 0, backgroundColor: Colors.COLOR_WHITE }]}>
                {/* Favorite */}
                {!Utils.isNull(this.dataSelling) && !this.isMyPost && !Utils.isNull(this.userInfo)
                    ? <TouchableOpacity
                        disabled={this.props.isLoading}
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        onPress={() => {
                            if (!this.props.isLoading) {
                                this.props.likePost({
                                    tableId: this.vehicleId,
                                    isFavorite: !this.dataSelling.isFavorite
                                })
                            }
                        }}>
                        <View style={{ alignItems: 'flex-end', marginRight: Constants.MARGIN_X_LARGE }}>
                            <Image source={!this.dataSelling.isFavorite ? ic_heart_white : ic_heart_red} />
                            {this.dataSelling.isFavorite
                                ? <View style={{
                                    marginTop: Constants.MARGIN_LARGE
                                }}>
                                    <Text style={{ fontSize: Fonts.FONT_SIZE_X_MEDIUM, color: Colors.COLOR_PRIMARY }}>{localizes('sellingDetailView.unLike')}</Text>
                                </View>
                                :
                                <View
                                    style={{
                                        marginTop: Constants.MARGIN_LARGE
                                    }}
                                >
                                    <Text style={{ fontSize: Fonts.FONT_SIZE_X_MEDIUM, color: Colors.COLOR_PRIMARY }}>{localizes('sellingDetailView.like')}</Text>
                                </View>
                            }
                        </View>
                    </TouchableOpacity>
                    : null}
            </View>
        )
    }

    /**
     * Render Comment
     */
    renderComment() {
        return (
            <TabCommentView
                vehicleId={this.vehicleId}
                sellerId={this.sellerId}
                sellingItemId={this.state.sellingItemId}
                vehicleName={this.state.vehicleName}
                navigation={this.props.navigation}
                isLoadMoreChild={this.state.isLoadMoreChild}
            />
        )
    }

    /**
     * Render Facebook
     */
    renderFacebook() {
        return (
            <TabFacebookView

            />
        )
    }

    renderButtonShare() {
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'absolute', bottom: Constants.MARGIN_X_LARGE * 4
            }}>
                <View style={{ flex: 1 }}></View>
                <View style={[{ marginRight: Constants.MARGIN_X_LARGE }]}>
                    <TouchableOpacity
                        style={[{
                            ...commonStyles.shadowOffset,
                            backgroundColor: Colors.COLOR_PRIMARY,
                            height: screen.width / 7,
                            width: screen.width / 7,
                            borderRadius: Constants.CORNER_RADIUS * 3
                        }]}
                        onPress={() => {
                            this.onShareSelling();
                        }}
                    >
                        <View style={[commonStyles.viewCenter, { flex: 1 }]}>
                            <Image source={ic_share_white} />
                        </View>
                    </TouchableOpacity>
                </View >
            </View>
        )
    }

    /**
     * Share blog
     */
    onShareSelling = () => {
        if (!Utils.isNull(this.dataSelling.url)) {
            let url = ServerPath.API_URL.split("mapi/")
            Share.share({
                message: 'MARKET: ' + this.state.vehicleName + '\n' + url[0] + this.dataSelling.url,
                url: url[0] + this.dataSelling.url,
                // message: 'https://www.youtube.com/watch?v=fjckPX8Kw48',
                // url: url[0] + 'https://www.youtube.com/watch?v=fjckPX8Kw48',
                title: "Share to social",
            }, {
                // Android only:
                dialogTitle: 'Shae to social',
                // iOS only:
                excludedActivityTypes: [
                    'com.apple.UIKit.activity.PostToTwitter'
                ]
            })
        } else { this.showMessage('Bài đăng chưa có link chia sẻ!'); }
    }

    renderChild(child) {
        return (
            <View style={{ flex: 1 }}>
                {child}
            </View>
        );
    }

    /**
     * Render children
     */
    renderChildren = (node) => {
        if (node.name == "iframe") {
            node.attribs.width = screen.width - Constants.MARGIN_X_LARGE
        }
    }

    /**
     * Get state approval
     */
    getStateApproval() {
        const { sellingStatus, approvalStatus } = this.state;
        if (sellingStatus == statusType.ACTIVE && approvalStatus == approvalStatusType.APPROVED) {
            return "";
        } else if (sellingStatus == statusType.DRAFT && approvalStatus == approvalStatusType.WAITING_FOR_APPROVAL) {
            return "Đang chờ duyệt";
        } else if (sellingStatus == statusType.ACTIVE && approvalStatus == approvalStatusType.REJECTED) {
            return "Đã bị từ chối";
        } else {
            return "";
        }
    }
    // render Item comment
    renderItemComment = (item, index, parentIndex, indexInParent) => {
        if (!Utils.isNull(this.state.user)) {
            var avatarUser = this.state.user.avatarPath.indexOf("http") != -1 ? this.state.user.avatarPath :
                (this.resourceUrlPath.textValue + '/' + this.state.user.avatarPath)
        } else { var avatarUser = '' }
        return (
            <ItemComment
                data={this.reviews}
                item={item}
                index={index}
                type={0}
                navigation={this.props.navigation}
                avatarUser={avatarUser}
                resourceUrlPath={this.resourceUrlPath}
                sellingId={this.vehicleId}
            />
        )
    }


    /**
     * Render contact
     */
    renderContact() {
        return !this.isMyPost ? (
            <View style={{
                flexDirection: "row", position: "absolute", bottom: 0, left: 0, right: 0, height: Constants.HEADER_HEIGHT,
                borderTopColor: Colors.COLOR_BACKGROUND, borderTopWidth: 1,
            }}>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    disabled={this.isMyPost}
                    style={[styles.buttonContact, { opacity: this.isMyPost ? 0.5 : 1, backgroundColor: Colors.COLOR_WHITE }]}
                    onPress={() => {
                        this.renderCall(this.sellerPhone);
                    }}
                >
                    <Image source={ic_call_blue} />
                    <View style={{ paddingLeft: 8 }}>
                        <Text
                            style={[
                                commonStyles.text,
                                {
                                    margin: 0
                                }
                            ]}
                        >
                            {localizes('sellingDetailView.call')}
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    disabled={this.isMyPost}
                    style={[styles.buttonContact, { opacity: this.isMyPost ? 0.5 : 1, backgroundColor: Colors.COLOR_WHITE }]}
                    onPress={() => {
                        this.renderSMS(this.sellerPhone, this.state.vehicleName);
                    }}
                >
                    <Image source={ic_mail_blue} />
                    <View style={{ paddingLeft: 8 }}>
                        <Text style={[commonStyles.text, { margin: 0 }]}>{localizes('sellingDetailView.sms')}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    disabled={this.isMyPost}
                    style={[styles.buttonContact, { opacity: this.isMyPost ? 0.5 : 1, backgroundColor: Colors.COLOR_WHITE }]}
                    onPress={this.gotoChat}
                >
                    <Image source={ic_chat_blue} />
                    <View style={{ paddingLeft: 8 }}>
                        <Text style={[commonStyles.text, { margin: 0 }]}>{localizes('sellingDetailView.chat')}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        ) : null;
    }

    /**
     * Go to chat with seller
     */
    goToChatWithSeller = () => {
        if (!Utils.isNull(this.seller)) {
            this.props.navigation.navigate("Chat", {
                userMember: this.seller,
                conversationId: this.conversationId
            });
        }
    };

    /**
     * Go to Chat
     */
    gotoChat = () => {
        !Utils.isNull(this.userInfo)
            ?
            this.goToChatWithSeller()
            : this.showLoginView({
                routeName: "Chat",
                params: {
                    userMember: this.seller,
                    conversationId: this.conversationId
                }
            });
    };

    /**
     * Render dialog renews confirm
     */
    renderDialogRenews() {
        return (
            <DialogCustom
                visible={this.state.isShowDialogRenews}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={localizes('confirm')}
                textBtnOne={localizes('cancel')}
                textBtnTwo={localizes('confirm')}
                contentText={localizes('sellingDetailView.confirmRenew')}
                onPressX={() => {
                    this.setState({ isShowDialogRenews: false });
                }}
                onPressBtnPositive={() => {
                    this.setState({ isShowDialogRenews: false })
                    this.props.reNewsSelling(this.state.sellingItemId)
                }}
            />
        );
    }


    /**
     * Render dialog delete confirm
     */
    renderDialogDelete() {
        return (
            <DialogCustom
                visible={this.state.isShowDialogDelete}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={localizes('confirm')}
                textBtnOne={localizes('cancel')}
                textBtnTwo={localizes('delete')}
                contentText={localizes('sellingDetailView.confirmDelete')}
                onPressX={() => {
                    this.setState({ isShowDialogDelete: false });
                }}
                onPressBtnPositive={() => {
                    this.setState({ isShowDialogDelete: false })
                    this.props.deleteSellingVehicle(this.state.sellingItemId)
                }}
            />
        );
    }

    /**
     * Render dialog renews success confirm
     */
    renderDialogRenewsSuccess() {
        return (
            <DialogCustom
                visible={this.state.isShowDialogRenews}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleOneButton={true}
                contentTitle={localizes('sellingDetailView.notification')}
                textBtn={localizes('confirm')}
                contentText={localizes('sellingDetailView.renewSuccess1')}
                onPressX={() => {
                    this.setState({ isShowDialogRenews: false });
                }}
                onPressBtn={() => {
                    this.setState({ isShowDialogRenews: false })
                    this.props.reNewsSelling(this.state.sellingItemId)
                }}
            />
        );
    }

    /**
     * Render dialog delete success
     */
    renderDialogDeleteSuccess() {
        return (
            <DialogCustom
                visible={this.state.isDeleteSuccess}
                isVisibleOneButton={true}
                isVisibleContentText={true}
                textBtn={localizes('yes')}
                contentText={localizes('sellingDetailView.deleteSuccess')}
                onPressBtn={() => {
                    this.onBack();
                }}
            />
        );
    }

    /**
     * Render menu option
     */
    renderMenuOption() {
        const { sellingStatus } = this.state;
        return (
            this.isMyPost
                ?
                <View style={{ flexDirection: 'row' }}>
                    {this.state.sellingStatus == statusType.ACTIVE && this.state.approvalStatus == approvalStatusType.APPROVED ?
                        <TouchableOpacity onPress={() =>
                            this.setState({
                                isShowDialogRenews: true
                            })
                        }
                        >
                            <Image source={ic_renew_white} />
                        </TouchableOpacity>
                        : null
                    }
                    {sellingStatus != statusType.DELETE ?
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("PostNews", {
                                screenType: screenType.FROM_SELLING_VEHICLE_DETAIL,
                                vehicleId: this.state.sellingItemId,
                                urlPathResource: this.urlPathResource
                            });
                        }}>
                            <View style={[{ paddingHorizontal: Constants.PADDING_24 }]}>
                                <Image source={ic_pencil_white} />
                            </View>
                        </TouchableOpacity>
                        : null}
                    {sellingStatus != statusType.DELETE ?
                        <TouchableOpacity onPress={() => {
                            this.setState({
                                isShowDialogDelete: true
                            })
                        }}>
                            <View style={[{ paddingRight: Constants.MARGIN_12 }]}>
                                <Image source={ic_delete_sweep} />
                            </View>
                        </TouchableOpacity>
                        : null}
                </View >
                : <TouchableOpacity onPress={() => {
                    if (!Utils.isNull(this.state.user)) {
                        this.props.navigation.navigate('ListReasonReport', {
                            sellingItemId: this.state.sellingItemId
                        })
                    } else { this.showLoginView() }
                }
                }>
                    <View>
                        <Text style={[commonStyles.text, { marginRight: Constants.MARGIN_12, color: Colors.COLOR_WHITE }]}>{localizes('sellingDetailView.report')}</Text>
                    </View>
                </TouchableOpacity>
        )
    }

    /**
     * Go to Manufacturer
     */
    gotoManufacturer = () => {
        this.props.navigation.navigate("CategoryGeneral", {
            onChangeValue: this.onChangeManufacturer,
            type: carType.CAR_MANUFACTURER
        });
    };

    /**
     * Change Manufacturer
     */
    onChangeManufacturer = (vehicleManufactureId, vehicleManufactureName, logoVehicleManufacture) => {
        this.setState({ vehicleManufactureId, vehicleManufactureName, logoVehicleManufacture });
    };

    /**
     * Go to Car Life
     */
    gotoCarLife = () => {
        this.props.navigation.navigate("CategoryGeneral", {
            onChangeValue: this.onChangeCarLife,
            type: carType.CAR_LIFE,
            manufactureId: this.state.vehicleManufactureId
        });
    };

    /**
     * Change value car life
     */
    onChangeCarLife = (vehicleModelId, vehicleModelName, logoVehicleModel, parentCategoryId) => {
        this.setState({ vehicleModelId, vehicleModelName, logoVehicleModel, parentCategoryId });
    };

    /**
     * Validate data
     */
    validateData() {
        const { vehicleName, price, vehicleDescription } = this.state;
        if (Utils.isNull(vehicleName)) {
            this.showMessage(localizes('sellingDetailView.fillTitle'));
            this.vehicleNameRef.focus();
            return false;
        } else if (Utils.isNull(price)) {
            this.showMessage(localizes('sellingDetailView.fillPrice'));
            const el = this.refs.price.getElement();
            el.focus();
            return false;
        }
        return true;
    }

    /**
     * Save new information selling vehicle
     */
    onPressSave() {
        if (this.validateData) {
            let filter = {
                "id": this.state.sellingItemId,
                "manufacturerId": this.state.vehicleManufactureId,
                "modelVehicleId": this.state.vehicleModelId,
                "price": this.state.price.trim().split('.').join(""),
                "title": this.state.vehicleName,
                "description": this.state.vehicleDescription
            }
            this.props.updateSellingVehicle(filter)
        }
    }

    /**
     * Render toolbar
     */
    renderToolbar = () => {
        return (
            <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter]}>
                <TouchableOpacity
                    style={{ padding: Constants.PADDING_LARGE }}
                    onPress={() => {
                        this.onBack();
                    }}
                >
                    <Image source={ic_back_white} />
                </TouchableOpacity>
                <Animated.View
                    style={[
                        {
                            justifyContent: "center",
                            flex: 1,
                            padding: Constants.PADDING_LARGE,
                            opacity: this.opacity
                        }
                    ]}
                >
                    <Text
                        numberOfLines={1}
                        style={[
                            commonStyles.text,
                            {
                                margin: 0,
                                color: Colors.COLOR_WHITE
                            }
                        ]}
                    >
                        {!Utils.isNull(this.state.vehicleName) ? this.state.vehicleName.toUpperCase() : null}
                    </Text>
                </Animated.View>
                {this.renderMenuOption()}
            </View>
        );
    };
}

const mapStateToProps = state => ({
    data: state.sellingVehicleDetail.data,
    isLoading: state.sellingVehicleDetail.isLoading,
    error: state.sellingVehicleDetail.error,
    errorCode: state.sellingVehicleDetail.errorCode,
    action: state.sellingVehicleDetail.action,
    count: state.sellingVehicleDetail.count
});

const mapDispatchToProps = {
    ...actions,
    ...userActions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SellingVehicleDetailView);
