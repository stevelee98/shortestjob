import React, { Component } from "react";
import { ListView, View, Alert, Image, RefreshControl, FlatList, ScrollView, TouchableOpacity, TextInput, BackHandler } from "react-native";
import { Container, Header, Content, Button, Icon, List, ListItem, Text, SwipeRow, Body, Thumbnail, Root, Left, Title, Right, } from "native-base";
import { localizes } from 'locales/i18n';
import FlatListCustom from "components/flatListCustom";
import I18n from 'react-native-i18n';
import { Colors } from "values/colors";
import commonStyles from "styles/commonStyles";
import { Constants } from "values/constants";
import BaseView from "containers/base/baseView";
import { Fonts } from "values/fonts";
import { connect } from 'react-redux';
import * as actions from 'actions/userActions'
import { ErrorCode } from "config/errorCode";
import Utils from "utils/utils";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import dataNotification from './dataNotification';
import ItemNotification from "./itemNotification";
import StorageUtil from "utils/storageUtil";
import global from "utils/global";
import statusType from "enum/statusType";
import ModalContent from "./modalContent";
import firebase from 'react-native-firebase';
import ic_search_white from "images/ic_search_white.png";
import notificationType from "enum/notificationType";
import ic_back_white from 'images/ic_back_white.png';

class GroupNotificationView extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            userId: null,
            basic: true,
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            notifications: [],
            isSearch: false,
            stringSearch: null,
        };
        this.isLoadMore = true
        const { title, type, userId } = this.props.navigation.state.params;
        this.title = title
        this.type = type
        this.userId = userId
        this.filter = {
            userId: null,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
            type: this.type
        }
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.languageDevice = I18n.locale
        this.filter = {
            userId: this.userId,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
            type: this.type
        }
        this.requestNotificationByType()
    }

    /**
     * Open modal Week
     */
    openModal(content, title) {
        this.refs.modalContent.showModal(content, title);
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
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_NOTIFICATIONS_BY_TYPE)) {
                    this.setState({
                        notifications: data.data
                    })
                } else if (this.props.action == getActionSuccess(ActionEvent.SEARCH_NOTIFICATION)) {
                    this.setState({
                        notifications: data
                    })
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_NOTIFICATIONS_VIEW)) {
                    this.requestNotificationByType()
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    componentDidMount() {
        super.componentDidMount()
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    //onChangeBadger
    handleNotifications() {
        this.props.getNotificationsByType(this.filter);
    }

    //onRefreshing
    handleRefresh = () => {
        this.setState({
            refreshing: false
        })
        this.state.notifications = [];
        this.filter.paging.page = 0;
        this.requestNotificationByType()
    }

    /**
     * get notification by type and update count
     */
    requestNotificationByType() {
        if (!Utils.isNull(this.userId)) {
            this.handleNotifications()
            this.countNewNotification()
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
     * search notification
     */
    onSearch(text) {
        if (!Utils.isNull(this.userId)) {
            this.filterSearch = {
                "stringSearch": text,
                "userId": this.userId,
                "type": this.type
            }
            this.props.searchNotification(this.filterSearch)
        }
    }

    /**Render view */
    render() {
        var { data } = this.props;
        return (
            <Root>
                <Container>
                    <Header
                        style={[{
                            backgroundColor: Colors.COLOR_BACKGROUND,
                            borderBottomWidth: 0,
                        }]}>
                        <View style={[
                            commonStyles.viewHorizontal,
                            commonStyles.viewCenter, {
                                paddingHorizontal: Constants.PADDING_LARGE
                            }
                        ]} >
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={() => this.onBack()}>
                                <Image
                                    style={{ resizeMode: 'contain' }}
                                    source={ic_back_white} />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                {
                                    this.state.isSearch ?
                                        <TextInput
                                            style={[commonStyles.text, { margin: 0, borderRadius: 0, paddingHorizontal: Constants.MARGIN_12 }]}
                                            placeholder={"Tìm kiếm"}
                                            placeholderTextColor={Colors.COLOR_DRK_GREY}
                                            ref={r => (this.stringSearch = r)}
                                            value={this.state.stringSearch}
                                            onChangeText={(text) => {
                                                this.setState({
                                                    stringSearch: text
                                                })
                                                this.onSearch(text)
                                            }}
                                            keyboardType="default"
                                            underlineColorAndroid='transparent'
                                            returnKeyType={"done"}
                                        />
                                        : <Text style={[commonStyles.title, { textAlign: "center", margin: 0, padding: 0 }]}>{this.title.toUpperCase()}</Text>
                                }
                            </View>
                            <View>
                                {
                                    this.state.isSearch ?
                                        <TouchableOpacity
                                            activeOpacity={Constants.ACTIVE_OPACITY}
                                            onPress={() => {
                                                this.onToggleSearch()
                                                this.requestNotificationByType()
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
                    <View style={{ flex: 1 }} >
                        <FlatListCustom
                            style={[{
                                backgroundColor: Colors.COLOR_BACKGROUND,
                            }]}
                            data={this.state.notifications}
                            renderItem={this.renderItemRow}
                            // enableLoadMore={this.state.enableLoadMore}
                            enableRefresh={this.state.enableRefresh}
                            keyExtractor={item => item.code}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.handleRefresh}
                                />
                            }
                        />
                    </View>
                    <ModalContent
                        ref={'modalContent'}
                        parentView={this}
                    />
                    {this.showLoadingBar(this.props.isLoading)}
                </Container>
            </Root>
        );
    }

    /**
     * render item row
     */
    renderItemRow = (item, index, parentIndex, indexInParent) => {
        return (<ItemNotification
            item={item}
            index={index}
            parentIndex={parentIndex}
            indexInParent={indexInParent}
            onPressItem={() => this.onPressedItem(item, index)}
        />)
    }

    /**
     * Update number notification seen
     * @param {*} itemNotificationId  // id of item notification when on click item notification
     */
    updateNumberIsSeen(itemNotificationId) {
        if (!Utils.isNull(this.userId)) {
            this.filterNotificationIsSeen = {
                notificationIds: []
            }
            this.filterNotificationIsSeen.notificationIds.push(itemNotificationId)
            this.props.postNotificationsView(this.filterNotificationIsSeen)
        }
    }

    /**
     * set title and content for model item
     * @param {*} title 
     * @param {*} content 
     */
    onPressedItem(item, index) {
        if (!item.isGroup) {
            this.openModal(item.content, item.title)
            if (!item.seen) {
                this.updateNumberIsSeen(item.id)
            }
        }
    }
}

const mapStateToProps = state => ({
    data: state.notifications.data,
    isLoading: state.notifications.isLoading,
    errorCode: state.notifications.errorCode,
    action: state.notifications.action
})

export default connect(mapStateToProps, actions)(GroupNotificationView)