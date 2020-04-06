import React, { Component } from "react";
import {
    ListView, View, Alert, Image, RefreshControl, Platform,
    FlatList, ScrollView, TouchableOpacity, TextInput, ImageBackground
} from "react-native";
import {
    Container, Header, Content, Button, Icon, List, ListItem, Text,
    SwipeRow, Body, Thumbnail, Root, Left, Title, Right, Tabs, Tab, TabHeading
} from "native-base";
import { localizes } from 'locales/i18n';
import FlatListCustom from "components/flatListCustom";
import I18n from 'react-native-i18n';
import { Colors } from "values/colors";
import commonStyles from "styles/commonStyles";
import styles from "./styles";
import { Constants } from "values/constants";
import BaseView from "containers/base/baseView";
import { Fonts } from "values/fonts";
import { connect } from 'react-redux';
import * as actions from 'actions/userActions';
import * as blogActions from 'actions/blogActions';
import * as commonActions from 'actions/commonActions';
import { ErrorCode } from "config/errorCode";
import Utils from "utils/utils";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import ItemNotification from "containers/user/notification/itemNotification";
import ic_back_white from 'images/ic_back_white.png'
import StorageUtil from "utils/storageUtil";
import global from "utils/global";
import statusType from "enum/statusType";
import ModalContent from "containers/user/notification/modalContent";
import firebase from 'react-native-firebase';
import ic_search_white from "images/ic_search_white.png";
import ic_delete_all_white from "images/ic_delete_sweep.png";
import ic_cancel from "images/ic_cancel_white.png";
import notificationType from "enum/notificationType";
import DialogCustom from "components/dialogCustom";
// import ItemBlog from "./itemBlog";
import DateUtil from "utils/dateUtil";

class NotificationView extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            userId: null,
            basic: true,
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            content: null,
            title: null,
            numberIsNotSeen: 0,
            listNotifications: [],
            groupNotifications: [],
            isAlertDelete: false,
            isAlertConfirm: false,
            isAlertHasDeleted: false,
            enableDelete: false,
            deleteAll: false,
            stringSearch: null,
            typing: false,
            typingTimeout: 0,
            txtNotNotify: localizes("notificationView.notData"),
            numTab: null
        };
        this.selectedRow;
        this.valueBadge = 0;
        this.typeIsSeen = {
            ONE_ITEM: 1,
            ALL_ITEM: 0
        }
        this.isLoadMore = true
        this.filter = {
            userId: null,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            }
        }
        this.filterTempNotification = {
            content: localizes("notificationView.notNewNotification"),
            isGroup: true,
            seen: true,
            isTemp: true
        }
        this.tabs = {
            tabLeft: 0,
            tabRight: 1
        }
        this.listDelete = [];
        // this.numTab = null
        this.listBlogPost = [];
        this.listNotifications = [];
        this.listNotificationsTemp = [];
        this.groupNotifications = [];
        this.itemWatching = null;
        this.showNoData = false;
        this.onChangeTextInput = this.onChangeTextInput.bind(this);
        this.heightStatusBar = (Platform.OS === 'ios') ? Constants.STATUS_BAR_HEIGHT : 0;
        // global.gotoBlogDetail = this.gotoBlogDetail.bind(this);
    }

    componentWillMount() {
        super.componentWillMount()
    }

    /**
     * Open modal Week
     */
    openModal(content, title, item) {
        this.refs.modalContent.showModal(content, title, item);
    }

    /**
     * Get information user profile
     */
    getUserProfile = () => {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then((user) => {
            //this callback is executed when your Promise is resolved
            console.log('user', user)
            if (!Utils.isNull(user)) {
                this.setState({
                    user: user,
                    userId: user.id
                })
                this.filter = {
                    userId: user.id,
                    paging: {
                        pageSize: Constants.PAGE_SIZE,
                        page: 0
                    }
                }
                this.props.getUserProfile(user.id);
                this.countNewNotification()
            }
        }).catch((error) => {
            this.saveException(error, 'getUserProfile')
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    /**
     * Handle notifications
     * @param {*} action 
     */
    handleArrayNotification(action) {
        this.groupNotifications = []
        let isPushOrder = true
        let isPushCommercial = true
        let isPushCommon = true
        this.listNotifications.forEach(element => {
            if (element.type == notificationType.COMMON_NOTIFICATION) {
                if (isPushOrder) {
                    this.groupNotifications.push({ ...element, isGroup: true })
                    isPushOrder = false
                }
            } else if (element.type == notificationType.FINE_NOTIFICATION) {
                if (isPushCommercial) {
                    this.groupNotifications.push({ ...element, isGroup: true })
                    isPushCommercial = false
                }
            } else if (element.type == notificationType.BONUS_NOTIFICATION) {
                if (isPushCommon) {
                    this.groupNotifications.push({ ...element, isGroup: true })
                    isPushCommon = false
                }
            }
        });
        if (this.listNotifications.length < Constants.PAGE_SIZE * (this.filter.paging.page == 0 ? 1 : this.filter.paging.page)) {
            this.setState({
                enableLoadMore: false
            })
        } else {
            this.setState({
                enableLoadMore: true
            })
        }
        this.isLoadMore = true
        isPushCommon = true
        isPushOrder = true
        isPushCommercial = true
        if (!this.groupNotifications.some(item => item.type === notificationType.COMMON_NOTIFICATION)) {
            this.groupNotifications.push(
                this.filterTempNotification = {
                    ...this.filterTempNotification,
                    title: "Hệ thống Chợ PQ",
                    type: notificationType.COMMON_NOTIFICATION
                }
            )
        }
        if (!this.groupNotifications.some(item => item.type === notificationType.FINE_NOTIFICATION)) {
            this.groupNotifications.push(
                this.filterTempNotification = {
                    ...this.filterTempNotification,
                    title: "Khuyến mãi",
                    type: notificationType.FINE_NOTIFICATION
                }
            )
        }
        if (!this.groupNotifications.some(item => item.type === notificationType.BONUS_NOTIFICATION)) {
            this.groupNotifications.push(
                this.filterTempNotification = {
                    ...this.filterTempNotification,
                    title: "Cập nhật đơn hàng",
                    type: notificationType.BONUS_NOTIFICATION
                }
            )
        }
        // sort by type
        this.groupNotifications.sort(function (a, b) {
            return parseInt(a.type) - parseInt(b.type);
        })
    }

    /**
    * Handle data when request
    */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_NOTIFICATIONS)) {
                    if (!Utils.isNull(data)) {
                        if (data.data.length > 0) {
                            data.data.forEach(item => {
                                this.listNotificationsTemp.push({ ...item });
                            });
                            this.listNotifications = this.listNotificationsTemp;
                            this.isLoadMore = true;
                        }
                    }
                    this.handleArrayNotification(getActionSuccess(ActionEvent.GET_NOTIFICATIONS))
                    this.showNoData = true;
                } else if (this.props.action == getActionSuccess(ActionEvent.COUNT_NEW_NOTIFICATION)) {
                    firebase.notifications().setBadge(parseInt(data));
                    global.badgeCount = data;
                    this.listNotificationsTemp = [];
                    this.handleNotifications();
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_NOTIFICATIONS_VIEW)) {
                    let index2 = -1
                    for (let index = 0, size = this.listNotifications.length; index < size; index++) {
                        const element = this.listNotifications[index];
                        if (element.id == this.itemWatching.id) {
                            index2 = index
                            this.itemWatching.seen = true
                            break;
                        }
                    }
                    this.listNotifications.splice(index2, 1, this.itemWatching);
                    this.countNewNotification()
                } else if (this.props.action == getActionSuccess(ActionEvent.SEARCH_NOTIFICATION)) {
                    if (data.length > 0) {
                        data.forEach(item => {
                            this.listNotificationsTemp.push({ ...item });
                        });
                        this.listNotifications = this.listNotificationsTemp;
                        this.isLoadMore = true;
                    } else {
                        this.listNotifications = []
                        this.setState({ txtNotNotify: localizes("notificationView.searchNull") })
                    }
                    this.handleArrayNotification(getActionSuccess(ActionEvent.GET_NOTIFICATIONS))
                } else if (this.props.action == getActionSuccess(ActionEvent.READ_ALL_NOTIFICATION)) {
                    if (data) {
                        for (let index = 0, size = this.listNotifications.length; index < size; index++) {
                            const element = this.listNotifications[index]
                            element.seen = true
                        }
                        this.countNewNotification()
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.DELETE_NOTIFICATIONS)) {
                    this.listNotificationsTemp = this.listNotificationsTemp.filter((item) => !this.listDelete.includes(item.id));
                    this.listNotifications = this.listNotificationsTemp;
                    this.listDelete = [];
                    this.countNewNotification();
                } 
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.languageDevice = I18n.locale
        this.props.navigation.addListener('didBlur', () => {
            this.setState({ enableDelete: false, deleteAll: false })
        });
        this.getSourceUrlPath();
        this.getUserProfile();
    }

    componentWillUnmount() {
        super.componentWillUnmount()
    }

    //onChangeBadger
    handleNotifications() {
        this.props.getNotificationsRequest(this.filter);
    }

    //onRefreshing
    handleRefresh = () => {
        if (Utils.isNull(this.state.stringSearch)) {
            this.listNotificationsTemp = [];
            this.isLoadMore = true
            this.state.deleteAll = false;
            this.filter.paging.page = 0;
            this.countNewNotification()
            this.listDelete = [];
        } else {
            this.onSearch(this.state.stringSearch)
        }
    }

    /**
     * Get more notification
     */
    getMoreNotifications = () => {
        if (this.isLoadMore) {
            this.isLoadMore = false
            this.filter.paging.page += 1
            this.props.getNotificationsRequest(this.filter);
        }
    }

    /**
     * Update number notification seen
     * @param {*} type 
     * @param {*} itemNotificationId  // id of item notification when on click item notification
     */
    updateNumberIsSeen(type, itemNotificationId) {
        if (!Utils.isNull(this.state.userId)) {
            this.listNotificationsTemp = [];
            this.filterNotificationIsSeen = {
                notificationIds: []
            }
            if (type == this.typeIsSeen.ALL_ITEM) {
                if (this.listNotifications.length > 0) {
                    this.props.readAllNotification()
                }
            } else if (type == this.typeIsSeen.ONE_ITEM) {
                this.filterNotificationIsSeen.notificationIds.push(itemNotificationId)
                this.props.postNotificationsView(this.filterNotificationIsSeen)
            }
        }
    }

    /**
     * on toggle search
     */
    onToggleSearch() {
        if (!Utils.isNull(this.state.stringSearch)) {
            this.setState({
                stringSearch: ""
            })
        }
        this.setState({
            isSearch: !this.state.isSearch
        }, () => {
            if (this.state.isSearch) {
                this.stringSearch.focus();
            }
        })
    }

    /**
     * Manager text input search 
     * @param {*} stringSearch 
     */
    onChangeTextInput(stringSearch) {
        const self = this;
        if (self.state.typingTimeout) {
            clearTimeout(self.state.typingTimeout)
        }
        self.setState({
            stringSearch: stringSearch,
            typing: false,
            typingTimeout: setTimeout(() => {
                this.onSearch(stringSearch)
            }, 1000)
        });
    }



    /**Render view */
    render() {
        return (
            <Container style={styles.container}>
                <Root>
                    <View style={{ flexGrow: 1 }}>
                        <Header hasTabs style={commonStyles.header}>
                            <View style={[
                                commonStyles.viewHorizontal,
                                commonStyles.viewCenter, {
                                    paddingLeft: Constants.PADDING_LARGE
                                }
                            ]} >
                                <TouchableOpacity
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    onPress={() => this.onSearch()}>
                                    <Image
                                        opacity={this.state.isSearch ? 1 : 0}
                                        style={{ resizeMode: 'contain' }}
                                        source={ic_search_white} />
                                </TouchableOpacity>
                                <View style={{ flex: 1 }}>
                                    {
                                        this.state.isSearch ?
                                            <TextInput
                                                style={[commonStyles.text, {
                                                    color: Colors.COLOR_WHITE,
                                                    margin: 0,
                                                    borderRadius: 0,
                                                    paddingHorizontal: Constants.PADDING_12
                                                }]}
                                                placeholder={localizes('search')}
                                                placeholderTextColor={Colors.COLOR_WHITE}
                                                ref={r => (this.stringSearch = r)}
                                                value={this.state.stringSearch}
                                                onChangeText={this.onChangeTextInput}
                                                keyboardType="default"
                                                underlineColorAndroid='transparent'
                                                returnKeyType={"search"}
                                            />
                                            : <Text style={[commonStyles.title, { textAlign: "center", margin: 0, padding: 0 }]}>{localizes('notificationView.notification')}</Text>
                                    }
                                </View>
                                <View>
                                    {
                                        this.state.isSearch ?
                                            <TouchableOpacity
                                                style={{ padding: Constants.PADDING_LARGE }}
                                                activeOpacity={Constants.ACTIVE_OPACITY}
                                                onPress={() => {
                                                    this.state.stringSearch = null
                                                    this.onToggleSearch()
                                                    this.handleRefresh()
                                                }}
                                            >
                                                <Image
                                                    style={{ resizeMode: 'contain' }}
                                                    source={ic_cancel} />
                                            </TouchableOpacity> :
                                            <TouchableOpacity
                                                style={{ padding: Constants.PADDING_LARGE }}
                                                activeOpacity={Constants.ACTIVE_OPACITY}
                                                onPress={() => {
                                                    this.state.enableDelete ? this.onPressDeleteAll() : this.onToggleSearch()
                                                }}
                                            >
                                                <Image
                                                    style={{ resizeMode: 'contain' }}
                                                    source={ this.state.enableDelete ? ic_delete_all_white : ic_search_white } />
                                            </TouchableOpacity>
                                    }
                                </View>
                            </View>
                        </Header>
                        <FlatListCustom
                            ListHeaderComponent={this.renderHeaderFlatList}
                            contentContainerStyle={{ paddingVertical: Constants.PADDING_LARGE }}
                            style={{
                                flex: 1,
                                backgroundColor: Colors.COLOR_BACKGROUND
                            }}
                            data={this.listNotifications}
                            renderItem={this.renderItemNotification}
                            enableLoadMore={this.state.enableLoadMore}
                            enableRefresh={this.state.enableRefresh}
                            keyExtractor={item => item.code}
                            onLoadMore={() => {
                                this.getMoreNotifications()
                            }}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.handleRefresh}
                                />
                            }
                            isShowEmpty={this.showNoData}
                            isShowImageEmpty={true}
                            textForEmpty={localizes('notificationView.noDataLeft')}
                            styleEmpty={{
                                marginTop: Constants.MARGIN_LARGE
                            }}
                        />
                        <ModalContent
                            ref={'modalContent'}
                            parentView={this}
                            navigation={this.props.navigation}
                            resourcePath={this.resourceUrlPathResize.textValue}
                        />
                        {!this.state.enableLoadMore ? this.showLoadingBar(this.props.isLoading) : null}
                        {this.renderAlertDelete()}
                    </View>
                </Root>
            </Container>
        );
    }

    /**
     * On press delete all
     */
    onPressDeleteAll() {
        if (this.state.enableDelete) {
            if (this.listDelete != null && this.listDelete.length > 0) {
                this.setState({ isAlertDelete: true });
            }
        }
    }

    /**
     * search notification
     */
    onSearch(text) {
        if (!Utils.isNull(this.state.userId)) {
            this.filterSearch = {
                "stringSearch": text,
                "userId": this.state.userId
            }
            if (!Utils.isNull(text)) {
                this.listNotificationsTemp = []
                this.props.searchNotification(this.filterSearch)
            } else {
                this.handleRefresh()
            }
        }
    }

    /**
     * Render right menu
     */
    renderRightMenu = () => {
        const { enableDelete } = this.state;
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                style={{
                    position: "absolute",
                    right: 0,
                    padding: Constants.PADDING_LARGE
                }}
                onPress={() => {
                    if (enableDelete) {
                        if (this.listDelete != null && this.listDelete.length > 0) {
                            this.setState({ isAlertDelete: true });
                        }
                    } else {
                        this.menuOption.open()
                    }
                }}>
                <Image source={enableDelete ? ic_delete_white : ic_menu_vertical} />
                {/* {this.renderMenuOption()} */}
            </TouchableOpacity>
        )
    }

    /**
     * Render header flat list
     */
    renderHeaderFlatList = () => {
        return (
            this.state.enableDelete ?
                <View style={[commonStyles.viewHorizontal, {
                    flex: 0,
                    justifyContent: 'space-between',
                    backgroundColor: Colors.COLOR_WHITE
                }]}>
                    <TouchableOpacity
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        style={{
                            padding: Constants.PADDING_LARGE
                        }}
                        onPress={() => {
                            this.listDelete = [];
                            this.setState({ enableDelete: false, deleteAll: false });
                            this.listNotifications.forEach(item => {
                                item.isCheck = false;
                            });
                        }}>
                        <Text style={[commonStyles.text, {color: Colors.COLOR_RED}]}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        style={{
                            padding: Constants.PADDING_LARGE
                        }}
                        onPress={() => {
                            if (!this.state.deleteAll) {
                                this.listNotifications.forEach(item => {
                                    item.isCheck = true;
                                    var itemUnCheck = this.listDelete.indexOf(item.id);
                                    if (itemUnCheck == -1) {
                                        this.listDelete.push(item.id)
                                    }
                                });
                            } else {
                                this.listNotifications.forEach(item => {
                                    item.isCheck = false;
                                });
                                this.listDelete = [];
                            }
                            this.setState({ deleteAll: !this.state.deleteAll })
                        }}>
                        <Text style={[commonStyles.text]}>{!this.state.deleteAll ? "Chọn tất cả" : "Bỏ chọn"}</Text>
                    </TouchableOpacity>
                </View>
                : null
        )
    }

    /**
     * Render item row
     */
    renderItemNotification = (item, index, parentIndex, indexInParent) => {
        let resourceUrlPath = !Utils.isNull(this.resourceUrlPathResize) ? this.resourceUrlPathResize.textValue : "";
        return (
            <ItemNotification
                item={item}
                index={index}
                parentIndex={parentIndex}
                indexInParent={indexInParent}
                onPressItem={() => this.onPressedItem(item, index)}
                onLongPressItem={this.onLongPressItem}
                onChecked={this.onChecked}
                deleteObj={{
                    enable: this.state.enableDelete,
                    deleteAll: this.state.deleteAll,
                }}
                resourceUrlPathResize={resourceUrlPath}
            />
        )
    }

    /**
     * set title and content for model item
     * @param {*} title
     * @param {*} content
     */
    onPressedItem(item, index) {
        this.itemWatching = item
        if (item.isGroup) {
            this.props.navigation.navigate('GroupNotification', {
                title: item.title,
                type: item.type,
                userId: this.state.userId
            });
        }
        switch(item.type) {
            case notificationType.COMMENT_NOTIFICATION:
                var obj = JSON.parse(Utils.cloneObject(item.meta));
                if(!(Utils.isNull(obj.productId) && Utils.isNull(obj.sellerId)))
                    this.props.navigation.navigate("SellingVehicleDetail", {
                        vehicleId: obj.productId,
                        sellerId: obj.sellerId
                });
                break;
            case notificationType.FEEDBACK_COMMENT_NOTIFICATION:
                var obj = JSON.parse(Utils.cloneObject(item.meta));
                let dataItem = {
                    content: obj.content,
                    createdAt: obj.createdAt,
                    imageComment: !Utils.isNull(obj.imageComment) ? {
                        pathToResource: obj.imageComment,
                    } : null,
                    reviewer: {
                        name: obj.nameReviewer,
                        avatarPath: obj.avatarPath
                    }
                };
                this.props.navigation.navigate('ReviewSellingVehicleDetail', {
                    dataItem: dataItem,
                    idComment: obj.parentReviewId,
                    resourceUrlPath: this.resourceUrlPath,
                    sellingId: obj.sellingId,
                    avatarUser: obj.avatarUser
                });
                break;
            default:
                this.openModal(item.content, item.title, item);
                break;
        }
        if (!item.seen) {
            this.updateNumberIsSeen(this.typeIsSeen.ONE_ITEM, item.id)
        }
    }

     /**
     * On long press item
     */
    onLongPressItem = () => {
        this.setState({ enableDelete: true, deleteAll: false })
    }

    /**
     * On check
     */
    onChecked = (itemPress) => {
        this.listNotifications.forEach(item => {
            if (item.id == itemPress.id) {
                item.isCheck = itemPress.isCheck;
                var itemUnCheck = this.listDelete.indexOf(item.id);
                if (itemPress.isCheck) {
                    if (itemUnCheck == -1) {
                        this.listDelete.push(item.id)
                    }
                } else {
                    if (itemUnCheck != -1) {
                        this.listDelete.splice(itemUnCheck, 1);
                    }
                }
            }
        });
        if (this.listDelete.length == this.listNotifications.length) {
            this.setState({ deleteAll: true });
        } else {
            this.setState({ deleteAll: false });
        }
    }

    /**
     * Render alert delete
     */
    renderAlertDelete() {
        return (
            <DialogCustom
                visible={this.state.isAlertDelete}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={localizes('notification')}
                textBtnOne={"Không"}
                textBtnTwo={"Xóa"}
                contentText={"Bạn có muốn xóa không?"}
                onTouchOutside={() => { this.setState({ isAlertDelete: false }) }}
                onPressX={() => {
                    this.setState({ isAlertDelete: false });
                }}
                onPressBtnPositive={() => {
                    this.setState({ isAlertDelete: false });
                    let filter = {
                        userId: this.state.userId,
                        paging: {
                            pageSize: Constants.PAGE_SIZE,
                            page: 0
                        },
                        notificationsDelete: this.listDelete
                    };
                    this.setState({
                        enableDelete: false,
                        deleteAll: false
                    });
                    this.props.deleteNotifications(filter);
                }}
            />
        )
    }

    // /**
    //  * Go blog detail
    //  */
    // gotoBlogDetail = (data) => {
    //     this.props.navigation.push("BlogDetail", { dataItemBlog: data, id: data && data.id })
    // }

    // /**
    //  * render Item Blog
    //  */

    // renderItem = (item, index, parentIndex, indexInParent) => {
    //     return (
    //         <ItemBlog data={item} gotoBlogDetail={this.gotoBlogDetail} />
    //     );
    // }
}

const mapStateToProps = state => ({
    data: state.notifications.data,
    isLoading: state.notifications.isLoading,
    errorCode: state.notifications.errorCode,
    action: state.notifications.action
})

const mapDispatchToProps = {
    ...actions,
    ...blogActions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationView);