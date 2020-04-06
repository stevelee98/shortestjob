import React, { Component } from "react";
import {
    View, Text, TouchableOpacity, Image,
    RefreshControl, TextInput, Keyboard
} from "react-native";
import BaseView from "containers/base/baseView";
import { Container, Header, Content, Root, Title } from "native-base";
import FlatListCustom from "components/flatListCustom";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import commonStyles from "styles/commonStyles";
import { Fonts } from "values/fonts";
import ItemListChat from "./itemListChat";
import firebase from "react-native-firebase";
import Utils from "utils/utils";
import StorageUtil from "utils/storageUtil";
import ic_search_white from "images/ic_search_white.png";
import ic_cancel_white from "images/ic_cancel_white.png";
import TextInputSetState from "./textInputSetState";
import DialogCustom from "components/dialogCustom";
import StringUtil from "utils/stringUtil";
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import { ErrorCode } from "config/errorCode";
import { getActionSuccess, ActionEvent } from "actions/actionEvent";
import { connect } from "react-redux";
import conversationStatus from "enum/conversationStatus";
import styles from "./styles";
import { async } from "rxjs/internal/scheduler/async";
import { localizes } from "locales/i18n";

class ListChatView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            isShowLoading: true,
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            isLoadingMore: false,
            stringSearch: null,
            isAlertDelete: false,
            itemSelected: null,
            mainConversation: [],
            showNoData: false
        };
        this.conversationIds = [];
        this.conversations = [];
        this.userId = null;
        this.onBackConversation = null;
    }

    componentDidMount() {
        this.getSourceUrlPath();
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            if (!Utils.isNull(user)) {
                this.props.getUserProfile(user.id);
                this.userId = user.id;
                this.realTime = firebase.database().ref(`chats_by_user/u${user.id}/_all_conversation`);
                setTimeout(() => {
                    this.realTime.on("value", snap => {
                        this.readDataListChat();
                    });
                }, 1000);
            }
        }).catch(error => {
            this.saveException(error, "componentWillMount");
        });
    }

    componentWillReceiveProps = nextProps => {
        if (nextProps != this.props) {
            this.props = nextProps;
            this.handleData();
        }
    };

    /**
     * read conversations on firebase
     * @param {*} usersKey (~ array contain userKey) is used when search
     */
    readDataListChat = async (usersKey) => {
        try {
            firebase
                .database()
                .ref(`chats_by_user/u${this.userId}/_conversation`)
                .orderByChild("deleted__last_updated_at")
                .startAt(`1_`)
                .endAt(`1_\uf8ff`)
                .limitToLast(5000)
                .once("value", conversationSnap => {
                    const conversationValue = conversationSnap.val();
                    console.log("conversationValue: ", conversationValue);
                    if (!Utils.isNull(conversationValue)) {
                        this.conversationIds = [];
                        conversationSnap.forEach(element => {
                            this.conversationIds.push(parseInt(StringUtil.getNumberInString(element.key)));
                        });
                        this.conversationIds.reverse();
                        this.getInformationMemberChat();
                    } else {
                        this.setState({
                            refreshing: false,
                            isLoadingMore: false,
                            isShowLoading: false,
                            mainConversation: [],
                            showNoData: true
                        });
                    }
                });
        } catch (error) {
            this.saveException(error, "readDataListChat");
        }
    };

    /**
     * Get information member chat (name, avatarPath)
     */
    getInformationMemberChat() {
        if (this.conversationIds.length > 0) {
            this.props.getMemberOfConversation({
                conversationIds: this.conversationIds
            });
        }
    }

    /**
     * Get valueLastMessage and valueUnseen
     */
    getInformationConversation = async () => {
        this.setState({
            refreshing: false,
            isLoadingMore: false,
            mainConversation: this.conversations,
            isShowLoading: false,
            showNoData: true
        });
        this.conversations = [];
    };

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_MEMBER_OF_CONVERSATION)) {
                    this.conversations = data;
                    this.state.mainConversation = this.conversations;
                    // add information conversation
                    this.getInformationConversation();
                } else if (this.props.action == getActionSuccess(ActionEvent.DELETE_CONVERSATION)) {
                } else if (this.props.action == getActionSuccess(ActionEvent.SEARCH_CONVERSATION)) {
                    if (!Utils.isNull(data)) {
                        this.conversations = data;
                        this.getInformationConversation();
                    } else {
                        this.conversations = [];
                        this.getInformationConversation();
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    /**
     * Get more testing
     */
    getMoreTesting = () => {
        if (this.isLoadMore) {
            this.isLoadMore = false;
            global.pageConversation += 10;
            this.readDataListChat();
        }
    };

    componentWillUnmount() {
        this.realTime.off();
    }

    //onRefreshing
    handleRefresh = () => {
        this.setState({
            refreshing: true,
            enableLoadMore: false
        });
        this.readDataListChat();
    };

    /**
     * Search user chat
     * @param {*} str
     */
    onSearch(str) {
        this.setState({
            stringSearch: str
        });
        if (!Utils.isNull(str)) {
            this.props.searchConversation({
                paramsSearch: str
            });
        } else {
            this.readDataListChat();
        }
    }

    render() {
        return (
            <Container style={styles.container}>
                <Root>
                    {/* {Header home view} */}
                    <Header style={commonStyles.header}>
                        {this.renderHeaderView({
                            visibleStage: false,
                            visibleBack: false,
                            visibleSearchBar: true,
                            title: "",
                            placeholder: localizes('listChatView.search'),
                            iconLeftSearch: ic_search_white,
                            inputSearch: this.state.stringSearch,
                            onRef: ref => {
                                this.inputSearchRef = ref;
                            },
                            onChangeTextInput: stringSearch => this.onSearch(stringSearch),
                            iconLeftSearch: !Utils.isNull(this.state.stringSearch) ? ic_cancel_white : ic_search_white,
                            onPressLeftSearch: () => (!Utils.isNull(this.state.stringSearch) ? this.onSearch() : this.inputSearchRef.focus()),
                            onSubmitEditing: () => Keyboard.dismiss(),
                            renderRightMenu: this.renderRightMenu
                        })}
                    </Header>

                    <FlatListCustom
                        contentContainerStyle={{
                            paddingVertical: Constants.PADDING_LARGE
                        }}
                        horizontal={false}
                        data={this.state.mainConversation}
                        itemPerCol={1}
                        renderItem={this.renderItemListChat}
                        showsVerticalScrollIndicator={false}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        isShowEmpty={this.state.showNoData}
                        textForEmpty={'Không có dữ liệu'}
                        styleEmpty={{ marginTop: Constants.MARGIN_XX_LARGE * 5, backgroundColor: Colors.COLOR_BACKGROUND }}
                    />
                    {this.state.isLoadingMore || this.state.refreshing ? null : this.showLoadingBar(this.state.isShowLoading)}
                    {this.renderDialogDelete()}
                </Root>
            </Container>
        );
    }

    /**
     * Render dialog delete conversation
     */
    renderDialogDelete() {
        const { itemSelected } = this.state;
        return (
            <DialogCustom
                visible={this.state.isAlertDelete}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={localizes('confirm')}
                textBtnOne={localizes('cancel')}
                textBtnTwo={localizes('delete')}
                contentText={localizes('listChatView.confirmTextChat')}
                onPressX={() => {
                    this.setState({ isAlertDelete: false });
                }}
                onPressBtnPositive={() => {
                    firebase
                        .database()
                        .ref()
                        .update({
                            [`members/c${itemSelected.conversationId}/u${this.userId}/deleted_conversation`]: true,
                            [`chats_by_user/u${this.userId}/_conversation/c${itemSelected.conversationId}/deleted`]: true,
                            [`chats_by_user/u${this.userId}/_conversation/c${itemSelected.conversationId}/deleted__last_updated_at`]: "0_0",
                            [`conversation/c${itemSelected.conversationId}/deleted`]: true
                        })
                        .then(() => {
                            this.readDataListChat();
                            // update DB
                            // + set conversation.status = 2 (suspended)
                            // + set conversation_member.deleted_conversation = true (with me id)
                            this.props.deleteConversation(itemSelected.conversationId);
                            this.setState({
                                isAlertDelete: false
                            });
                            this.onBackConversation ? this.onBackConversation() : null;
                        });
                }}
            />
        );
    }

    /**
     * Render item
     * @param {*} item
     * @param {*} index
     * @param {*} parentIndex
     * @param {*} indexInParent
     */
    renderItemListChat = (item, index, parentIndex, indexInParent) => {
        return (
            <ItemListChat
                key={index.toString()}
                data={this.state.mainConversation}
                item={item}
                index={index}
                onPressItemChat={() => {
                    this.props.navigation.navigate("Chat", {
                        userMember: {
                            id: item.userId,
                            name: item.name,
                            avatarPath: item.avatarPath
                        },
                        conversationId: item.conversationId
                    });
                }}
                onPressDeleteItem={() => {
                    this.setState({ isAlertDelete: true, itemSelected: item });
                }}
                resourcePath={this.resourceUrlPathResize.textValue}
                userId={this.userId}
            />
        );
    }
}

const mapStateToProps = state => ({
    data: state.listChat.data,
    isLoading: state.listChat.isLoading,
    error: state.listChat.error,
    errorCode: state.listChat.errorCode,
    action: state.listChat.action
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ListChatView);