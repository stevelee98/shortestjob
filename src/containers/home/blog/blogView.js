import React, { Component } from "react";
import {
    ListView, View, Alert, Image, RefreshControl, Platform,
    FlatList, ScrollView, TouchableOpacity, TextInput, ImageBackground, BackHandler
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
import ic_cancel from "images/ic_cancel_white.png";
import notificationType from "enum/notificationType";
import ItemBlog from "./itemBlog";
import DateUtil from "utils/dateUtil";

class BlogView extends BaseView {

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
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        // super.componentWillMount()
        this.props.getBlogPost(this.filter);
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
     * Handle show date
     * @param {*} data 
     */
    handleShowDate(data) {
        if (data.length > 0) {
            this.nextIndex = 0
            this.nextElement = null
            for (let index = 0; index < data.length; index++) {
                const element = data[index]
                if (index == 0 && this.filter.paging.page == 0) {
                    this.listNotificationsTemp.push({ ...element, showDate: true })
                }
                if (index + 1 > data.length - 1) {
                    // break
                } else {
                    this.nextIndex = index + 1
                    this.nextElement = data[this.nextIndex]
                    if (new Date(Number(DateUtil.getTimestamp(element.createdAt))).getMonth() + 1
                        === new Date(Number(DateUtil.getTimestamp(this.nextElement.createdAt))).getMonth() + 1
                        && new Date(Number(DateUtil.getTimestamp(element.createdAt))).getDate()
                        === new Date(Number(DateUtil.getTimestamp(this.nextElement.createdAt))).getDate()
                        && new Date(Number(DateUtil.getTimestamp(element.createdAt))).getYear()
                        === new Date(Number(DateUtil.getTimestamp(this.nextElement.createdAt))).getYear()) {
                        this.listNotificationsTemp.push({ ...this.nextElement, showDate: false })
                    } else {
                        this.listNotificationsTemp.push({ ...this.nextElement, showDate: true })
                    }
                }
            }
            this.listNotifications = this.listNotificationsTemp
        }
    }

    /**
    * Handle data when request
    */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_BLOG_POST)) {
                    console.log("NOTIFICATION DATA: ", data)
                    if (data.data.length > 0) {
                        this.handleShowDate(data.data)
                    }
                    // this.handleArrayNotification(getActionSuccess(ActionEvent.GET_BLOG_POST))
                    this.showNoData = true;
                } else if (this.props.action == getActionSuccess(ActionEvent.SEARCH_BLOG)) {
                    if (data.length > 0) {
                        this.handleShowDate(data)
                    } else {
                        this.listNotifications = []
                        this.setState({ txtNotNotify: localizes("notificationView.searchNull") })
                    }
                    // this.handleArrayNotification(getActionSuccess(ActionEvent.GET_BLOG_POST))
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.languageDevice = I18n.locale
        this.getUserProfile()
    }

    componentWillUnmount() {
        // super.componentWillUnmount()
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    //onChangeBadger
    handleNotifications() {
    }

    //onRefreshing
    handleRefresh = () => {
        if (Utils.isNull(this.state.stringSearch)) {
            this.listNotificationsTemp = [];
            this.isLoadMore = true
            this.filter.paging.page = 0;
            this.props.getBlogPost(this.filter);
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
            this.props.getBlogPost(this.filter);
        }
    }

    /**
     * Update number notification seen
     * @param {*} type 
     * @param {*} itemNotificationId  // id of item notification when on click item notification
     */
    updateNumberIsSeen(type, itemNotificationId) {
        // if (!Utils.isNull(this.state.userId)) {
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
            // }
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
                                    paddingHorizontal: Constants.PADDING_LARGE
                                }
                            ]} >
                                {!this.state.isSearch ?
                                    <TouchableOpacity
                                        activeOpacity={Constants.ACTIVE_OPACITY}
                                        onPress={() => {
                                            this.onBack();
                                        }}
                                    >
                                        <Image
                                            style={{ resizeMode: 'contain' }}
                                            source={ic_back_white} />
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity
                                        activeOpacity={Constants.ACTIVE_OPACITY}
                                        onPress={() => this.onSearch()}>
                                        <Image
                                            opacity={this.state.isSearch ? 1 : 0}
                                            style={{ resizeMode: 'contain' }}
                                            source={ic_search_white} />
                                    </TouchableOpacity>
                                }
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
                                            :
                                            <Text style={[commonStyles.title, { textAlign: "center", margin: 0, padding: 0 }]}>Tin tức cộng đồng</Text>
                                    }
                                </View>
                                <View>
                                    {
                                        this.state.isSearch ?
                                            <TouchableOpacity
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
                                                activeOpacity={Constants.ACTIVE_OPACITY}
                                                onPress={() => {
                                                    this.onToggleSearch()
                                                }}
                                            >
                                                <Image
                                                    style={{ resizeMode: 'contain' }}
                                                    source={ic_search_white} />
                                            </TouchableOpacity>
                                    }
                                </View>
                            </View>
                        </Header>
                        <FlatListCustom
                            contentContainerStyle={{ paddingVertical: Constants.PADDING_LARGE }}
                            style={{
                                flex: 1,
                                backgroundColor: Colors.COLOR_BACKGROUND
                            }}
                            data={this.listNotifications}
                            renderItem={this.renderItem}
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
                        {/* <ModalContent
                            ref={'modalContent'}
                            parentView={this}
                            navigation={this.props.navigation}
                            resourcePath={this.resourceUrlPathResize.textValue}
                        /> */}
                        {!this.state.enableLoadMore ? this.showLoadingBar(this.props.isLoading) : null}
                    </View>
                </Root>
            </Container>
        );
    }

    /**
     * search notification
     */
    onSearch(text) {
        // if (!Utils.isNull(this.state.userId)) {
        this.filterSearch = {
            "stringSearch": text,
            "userId": this.state.userId
        }
        if (!Utils.isNull(text)) {
            this.listNotificationsTemp = []
            this.props.searchBlog(this.filterSearch)
        } else {
            this.handleRefresh()
            // }
        }
    }

    /**
     * Render item row
     */
    // renderItemNotification = (item, index, parentIndex, indexInParent) => {
    //     return (
    //         <ItemNotification
    //             item={item}
    //             index={index}
    //             parentIndex={parentIndex}
    //             indexInParent={indexInParent}
    //             onPressItem={() => this.onPressedItem(item, index)}
    //         />
    //     )
    // }

    // /**
    //  * set title and content for model item
    //  * @param {*} title
    //  * @param {*} content
    //  */
    // onPressedItem(item, index) {
    //     this.itemWatching = item
    //     if (!item.isGroup) {
    //         this.openModal(item.content, item.title)
    //         if (!item.seen) {
    //             this.updateNumberIsSeen(this.typeIsSeen.ONE_ITEM, item.id)
    //         }
    //     } else {
    //         this.props.navigation.navigate('GroupNotification', {
    //             title: item.title,
    //             type: item.type,
    //             userId: this.state.userId
    //         })
    //     }
    // }

    /**
     * Go blog detail
     */
    gotoBlogDetail = (data) => {
        this.props.navigation.push("BlogDetail", { dataItemBlog: data, id: data && data.id })
    }

    /**
     * render Item Blog
     */

    renderItem = (item, index, parentIndex, indexInParent) => {
        return (
            <ItemBlog data={item} gotoBlogDetail={this.gotoBlogDetail} />
        );
    }
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

export default connect(mapStateToProps, mapDispatchToProps)(BlogView);