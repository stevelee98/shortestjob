import React, { Component } from "react";
import {
    ImageBackground, View, StatusBar, Image, TouchableOpacity,
    Alert, WebView, Linking, StyleSheet, RefreshControl,
    TextInput, Dimensions, ScrollView, Keyboard, Platform, ActivityIndicator,
    FlatList, NetInfo, BackHandler
} from "react-native";
import {
    Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text,
    Card, CardItem, Item, Input, Toast, Root, Col, Form, Spinner
} from "native-base";
import BaseView from "containers/base/baseView";
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import Utils from 'utils/utils';
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation'
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import DateUtil from "utils/dateUtil";
import styles from "./styles";
import I18n, { localizes } from "locales/i18n";
import { Fonts } from "values/fonts";
import FlatListCustom from 'components/flatListCustom';
import StringUtil from "utils/stringUtil";
import { filter } from "rxjs/operators";
import moment from 'moment';
import ic_send_image from 'images/ic_send_image.png';
import StorageUtil from 'utils/storageUtil';
import { CalendarScreen } from "components/calendarScreen";
import statusType from "enum/statusType";
import ItemChat from "./ItemChat";
import firebase from 'react-native-firebase';
import ImagePicker from 'react-native-image-crop-picker';
import { async } from "rxjs/internal/scheduler/async";
import KeyboardSpacer from 'react-native-keyboard-spacer';
import * as actions from 'actions/userActions';
import * as commonActions from 'actions/commonActions';
import ServerPath from "config/Server";
import Upload from 'lib/react-native-background-upload'
import conversationStatus from "enum/conversationStatus";
import ModalImageViewer from 'containers/common/modalImageViewer';
import messageType from "enum/messageType";
import myGlobal from "utils/global"

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

class ChatView extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            enableLoadMore: false,
            messageText: '',
            messages: [],
            images: [],
            isShowLoading: true,
            userId: null,
            keyboardHeight: 0,
            user: null,
            isHasConversation: false
        }
        const { userMember, conversationId } = this.props.navigation.state.params;
        this.onceQuery = Constants.PAGE_SIZE;
        this.isScrollStart = true;
        this.isSending = false;
        this.isLoadingMore = false;
        this.userMember = userMember;
        this.conversationId = conversationId;
        this.userMemberId = !Utils.isNull(userMember) ? userMember.id : "";
        this.userMemberName = !Utils.isNull(userMember) ? userMember.name : "";
        this.avatar = !Utils.isNull(userMember) ? userMember.avatarPath : "";
        this.imagesMessage = [];
        this.indexImagesMessage = 0;
        this.objectImages = '';
        this.actionValue = {
            WAITING_FOR_USER_ACTION: 0,
            ACCEPTED: 1,
            DENIED: 2
        };
        this.otherUserIdsInConversation = [];
        this.deleted = false;
        this.messageDraft = {
            fromUserId: "",
            message: "",
            timestamp: "",
            isShowDate: "",
            messageType: "",
            receiverResourceAction: 0
        };
        this.firebaseRef = firebase.database();
        this.filter = {
            conversationId: null,
            content: null,
            typeMessage: messageType.NORMAL_MESSAGE
        };
        this.firstMessageType = messageType.NORMAL_MESSAGE;
        this.seller = null
    }

    /**
     * Follow status deleted conversation
     */
    watchDeletedConversation() {
        if (!Utils.isNull(this.conversationId)) {
            this.deletedConversation = this.firebaseRef.ref(`conversation/c${this.conversationId}/deleted`)
            this.deletedConversation.on('value', (memberSnap) => {
                return this.deleted = memberSnap.val()
            })
        }
        return this.deleted = false;
    }

    /**
     * Handle unseen
     */
    handleUnseen = () => {
        let countUnseen = 0;
        if (!Utils.isNull(this.conversationId)) {
            this.firebaseRef.ref(`members/c${this.conversationId}/u${this.state.userId}/number_of_unseen_messages`)
                .transaction(function (value) {
                    countUnseen = value;
                    return 0;
                });
            this.firebaseRef.ref(`chats_by_user/u${this.state.userId}/number_of_unseen_messages`)
                .transaction(function (value) {
                    return value - countUnseen;
                });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    componentDidMount = async () => {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
        this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
        this.getSourceUrlPath();
        myGlobal.atMessage = true;
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            //this callback is executed when your Promise is resolved
            console.log("USER_INFO_IN_CHAT", user);
            if (!Utils.isNull(user) && user.status == statusType.ACTIVE) {
                this.userInfo = user;
                this.state.userId = user.id;
                this.state.user = user
                if (!Utils.isNull(this.userMemberId)) {
                    this.otherUserIdsInConversation = [this.userMemberId, user.id];
                };
                // conversation is between user and admin (sold)
                this.watchDeletedConversation();
                this.handleUnseen();
            }
        }).catch(e => {
            this.saveException(e, 'componentDidMount')
        });
        this.props.checkExistConversation({ userMemberChatId: this.userMember.id });
        this.props.getSellerInfo(this.userMemberId)
    }

    /**
     * Get all member in this conversation current
     */
    getOtherUserIdsInConversation() {
        this.firebaseRef.ref(`members/c${this.conversationId}`).once('value', (snapshot) => {
            if (!Utils.isNull(snapshot.val())) {
                snapshot.forEach(element => {
                    this.otherUserIdsInConversation.push(parseInt(StringUtil.getNumberInString(element.key)))
                });
            }
        })
    }

    /**
     * Handle show keyboard 
     * @param {*} e 
     */
    keyboardWillShow(e) {
        this.setState({ keyboardHeight: e.endCoordinates.height });
    }

    /**
     * Handle hide keyboard
     * @param {*} e 
     */
    keyboardWillHide(e) {
        this.setState({ keyboardHeight: 0 });
    }

    /**
     * Keyboard did show
     */
    keyboardDidShow() {
        this.isScrollStart = true;
        this.scrollToStart();
    }

    /**
     * scroll to end flat list
     */
    scrollToStart() {
        if (this.isScrollStart) {
            !Utils.isNull(this.flatListRef) && this.flatListRef.scrollToOffset({ animated: true, offset: 0 });
            this.handleUnseen();
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
        this.keyboardDidShowListener.remove();
        this.keyboardWillHideListener.remove();
        myGlobal.atMessage = false;
    }

    /**
     * Get all messages
     * @param {*} isLoadMore ~ true: load more is active
     */
    readFirebaseDatabase = async (isLoadMore) => {
        if (isLoadMore) {
            this.isLoadingMore = true;
            this.onceQuery += this.onceQuery;
            this.isScrollStart = false;
        }
        try {
            console.log('JJJJJJ', this.conversationId)
            console.log('JJJJJJ', typeof this.conversationId)
            this.firebaseRef.ref(`messages_by_conversation/c${this.conversationId}`)
                .limitToLast(this.onceQuery)
                .on('value', (messageSnap) => {
                    let messages = [];
                    console.log("messagesSnap: ", messageSnap.val());
                    if (!Utils.isNull(messageSnap.val())) {
                        let lengthMessage = messageSnap._childKeys.length;
                        this.state.enableLoadMore = !(lengthMessage < this.onceQuery);
                        messageSnap.forEach(itemMessage => {
                            let item = {
                                "conversationId": this.conversationId,
                                "key": itemMessage.key,
                                "fromUserId": itemMessage.toJSON().from_user_id,
                                "message": itemMessage.toJSON().content,
                                "receiverSeen": itemMessage.toJSON().receiver_seen,
                                "timestamp": itemMessage.toJSON().timestamp,
                                "isShowAvatar": true,
                                "isShowDate": true,
                                "avatar": this.avatar,
                                "messageType": itemMessage.toJSON().message_type,
                                "receiverResourceAction": itemMessage.toJSON().receiver_resource_action
                            }
                            messages.push(item);
                        });
                    }
                    this.nextIndex = 0;
                    this.nextElement = null;
                    messages.sort(function (x, y) {
                        return x.timestamp - y.timestamp;
                    });
                    for (let index = 0; index < messages.length; index++) {
                        const element = messages[index]
                        if (index + 1 > messages.length - 1) {
                            break
                        } else {
                            this.nextIndex = index + 1
                        }
                        this.nextElement = messages[this.nextIndex]
                        if (element.fromUserId !== this.state.userId) {
                            if (element.fromUserId === this.nextElement.fromUserId) {
                                !Utils.isNull(element.isShowAvatar) ? element.isShowAvatar = false : null
                            }
                        }
                        if (
                            new Date(Number(element.timestamp)).getMonth() + 1 === new Date(Number(this.nextElement.timestamp)).getMonth() + 1
                            && new Date(Number(element.timestamp)).getDate() === new Date(Number(this.nextElement.timestamp)).getDate()
                        ) {
                            this.nextElement.isShowDate = false
                        }
                    }
                    this.setState({
                        messages: messages.reverse(),
                        isShowLoading: false
                    });
                    this.isLoadingMore = false;
                })
        } catch (error) {
            this.saveException(error, 'readFirebaseDatabase')
        }
        console.log('4')
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.CREATE_CONVERSATION)) {
                    if (!Utils.isNull(data)) {
                        if (!Utils.isNull(data.conversationId)) {
                            this.conversationId = data.conversationId;
                            this.otherUserIdsInConversation = [this.state.userId, this.userMemberId];
                            if (this.firstMessageType == messageType.NORMAL_MESSAGE) {

                                // add
                                this.filter.content = this.state.messageText.trim();
                                this.filter.conversationId = this.conversationId;
                                this.props.pushMessage(this.filter)

                                this.state.messageText = '';
                                this.readFirebaseDatabase();
                            } else {
                                console.log('BBBBBBB', this.userMemberId)
                                console.log('BBBBBBB1', typeof this.userMemberId)
                                this.firebaseRef.ref(`chats_by_user/u${this.userMemberId}/number_of_unseen_messages`).transaction(function (value) {
                                    return value - 1;
                                });
                                console.log('1')
                                this.uploadImageStepByStep();
                                console.log('2')
                                this.readFirebaseDatabase();
                                console.log('3')
                            }
                        }
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.CHECK_EXIST_CONVERSATION)) {
                    if (!Utils.isNull(data)) {
                        this.conversationId = data;
                        this.readFirebaseDatabase();
                        this.handleUnseen();
                        this.setState({ isHasConversation: true })
                    } else {
                        this.state.isShowLoading = false;
                        this.setState({ isHasConversation: false })
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_SELLER_INFO)) {
                    if (!Utils.isNull(data)) {
                        this.seller = data;
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    /**
     * Render item
     * @param {*} item 
     * @param {*} index 
     * @param {*} parentIndex 
     * @param {*} indexInParent 
     */
    renderItemChat = (item, index, parentIndex, indexInParent) => {
        if (!Utils.isNull(item)) {
            return (
                <ItemChat
                    key={index.toString()}
                    data={item}
                    index={index}
                    userId={this.state.userId}
                    roomId={this.roomId}
                    userAdminId={this.userAdmin.numericValue}
                    onPressSendAction={(actionValue, conversationId, keyMessage) => {
                        this.firebaseRef.ref().update({
                            [`messages_by_conversation/c${conversationId}/${keyMessage}/receiver_resource_action`]: this.receiverResourceAction(actionValue)
                        }).then(() => {
                            this.isScrollStart = false
                            this.readFirebaseDatabase();
                        });
                    }}
                    resourceUrlPath={this.resourceUrlPath.textValue}
                    resourceUrlPathResize={this.resourceUrlPathResize.textValue}
                    onPressImage={this.onPressImage}
                    user={this.state.user}
                    seller={this.seller}
                    navigation={this.props.navigation}
                />
            )
        }
        else { return (<View></View>) }
    }

    /**
     * On press image
     */
    onPressImage = (images, index) => {
        this.refs.modalImageViewer.showModal(images, index)
    }

    /**
     * Receiver resource action
     * @param {*} actionValue 
     */
    receiverResourceAction(actionValue) {
        if (actionValue == this.actionValue.DENIED) { // DENIED
            return this.actionValue.DENIED
        } else if (actionValue == this.actionValue.ACCEPTED) {
            return this.actionValue.ACCEPTED
        }
    }

    /**
     * Send message
     * @param {*} contentMessages 
     * @param {*} contentImages // when send image. contentImages = 'path 1, path 2, ...'
     */
    onPressSendMessages = async (contentMessages, contentImages) => {
        let timestamp = DateUtil.getTimestamp();
        let typeMessage = messageType.NORMAL_MESSAGE;
        if (!Utils.isNull(contentMessages) || !Utils.isNull(this.state.messageText) || !Utils.isNull(contentImages)) {
            let content = ""
            if (!Utils.isNull(contentMessages)) {
                content = contentMessages
            } else if (!Utils.isNull(this.state.messageText)) {
                content = this.state.messageText.trim();
            } else {
                content = contentImages;
                typeMessage = messageType.IMAGE_MESSAGE;
            }
            this.messageDraft = {
                conversationId: this.conversationId,
                fromUserId: this.state.userId,
                message: content,
                timestamp: timestamp,
                isShowAvatar: false,
                isShowDate: false,
                messageType: typeMessage,
                receiverResourceAction: 0,
                sending: 0
            }
            var joined = [...this.state.messages, this.messageDraft];
            this.setState({ messages: joined })
            if (!Utils.isNull(this.conversationId)) {
                if (this.deleted) {
                    this.readFirebaseDatabase();
                } else {
                    try {
                        this.otherUserIdsInConversation.forEach(userId => {
                            let updateData = {
                                [`chats_by_user/u${Number(userId)}/_conversation/c${Number(this.conversationId)}/deleted`]: false,
                                [`chats_by_user/u${Number(userId)}/_conversation/c${Number(this.conversationId)}/last_updated_at`]: timestamp,
                                [`chats_by_user/u${Number(userId)}/_conversation/c${Number(this.conversationId)}/deleted__last_updated_at`]: `1_${timestamp}`,
                                [`chats_by_user/u${Number(userId)}/_conversation/c${Number(this.conversationId)}/last_messages`]: {
                                    content: content,
                                    timestamp: timestamp,
                                    message_type: typeMessage
                                },
                                [`chats_by_user/u${Number(userId)}/_all_conversation`]: {
                                    conversation_id: Number(this.conversationId),
                                    from_user_id: Number(this.state.userId),
                                    last_updated_at: timestamp,
                                    last_messages: {
                                        content: content,
                                        timestamp: timestamp,
                                        message_type: typeMessage
                                    }
                                }
                            };
                            this.firebaseRef.ref().update(updateData);
                        })
                        this.otherUserIdsInConversation.forEach(userId => {
                            if (userId === this.state.userId) {
                                return;
                            }
                            this.firebaseRef.ref(`members/c${Number(this.conversationId)}/u${Number(userId)}/number_of_unseen_messages`).transaction(function (value) {
                                return value + 1;
                            });
                            this.firebaseRef.ref(`chats_by_user/u${Number(userId)}/number_of_unseen_messages`).transaction(function (value) {
                                return value + 1;
                            });
                        });
                        // push new message:
                        let newMessageKey = this.firebaseRef.ref(`messages_by_conversation/c${Number(this.conversationId)}`).push().key;
                        this.firebaseRef.ref().update({
                            [`messages_by_conversation/c${Number(this.conversationId)}/${newMessageKey}`]: {
                                from_user_id: this.state.userId,
                                uid: this.userMemberId,
                                content: content.trim(),
                                timestamp: timestamp,
                                message_type: typeMessage,
                                receiver_seen: true,
                                receiver_resource_action: 0
                            }
                        });
                        // add
                        this.filter.typeMessage = typeMessage;
                        this.filter.content = content;
                        this.filter.conversationId = this.conversationId;
                        this.props.pushMessage(this.filter);

                        this.state.messageText = '';
                        this.imagesMessage = [];
                        this.isScrollStart = true;
                        this.scrollToStart();
                        this.onceQuery = Constants.PAGE_SIZE;
                    } catch (error) {
                        this.saveException(error, 'onPressSendMessages');
                    }
                }
            } else {
                this.props.createConversation({
                    userMemberChatId: this.userMemberId,
                    typeMessage: typeMessage,
                    content: content
                })
            }
        }
    }

    /**
     * Format bytes
     * @param {*} bytes 
     * @param {*} decimals 
     */
    formatBytes(bytes, decimals) {
        if (bytes == 0) return '0 Bytes';
        var k = 1024,
            dm = decimals <= 0 ? 0 : decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return console.log(parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i])
    }

    /**
     * Choose image car
     */
    onChooseImage = () => {
        ImagePicker.openPicker({
            width: width * 25 / 100,
            height: width * 25 / 100,
            multiple: true,
            cropping: true,
            waitAnimationEnd: false,
            includeExif: true,
            forceJpg: true,
            mediaType: 'photo',
            compressImageQuality: 0.8
        }).then((images) => {
            let maxSizeUpload = this.maxFileSizeUpload.numericValue;
            this.objectImages = '';
            this.indexImagesMessage = 0
            images.forEach(element => {
                console.log("element.size: ", element.size)
                this.formatBytes(element.size);
                if (element.size / this.oneMB > maxSizeUpload) {
                    this.showMessage("Có " + count + " ảnh lớn hơn " + maxSizeUpload + " MB")
                } else {
                    this.imagesMessage.push({
                        "image": element.path
                    })
                }
            });
            if (this.imagesMessage.length > 0) {
                this.setState({
                    isShowLoading: true
                });
                if (!Utils.isNull(this.conversationId)) {
                    this.uploadImageStepByStep();
                } else {
                    this.firstMessageType = messageType.IMAGE_MESSAGE;
                    this.props.createConversation({
                        userMemberChatId: this.userMemberId,
                        typeMessage: messageType.IMAGE_MESSAGE,
                        content: null
                    });
                }
            }
        }).catch(e => this.saveException(e, 'onChooseImage'));
    }

    /**
     * Upload image to server and get return path
     */
    uploadImageStepByStep() {
        let filePathUrl = this.imagesMessage[this.indexImagesMessage].image;
        if (Platform.OS == "android") {
            filePathUrl = this.imagesMessage[this.indexImagesMessage].image.replace('file://', '');
        };
        console.log("Chat View image path: ", filePathUrl)
        const options = {
            url: ServerPath.API_URL + `user/conversation/${this.conversationId}/media/upload`,
            path: filePathUrl,
            method: 'POST',
            field: 'file',
            type: 'multipart',
            headers: {
                'Content-Type': 'application/json', // Customize content-type
                'X-APITOKEN': global.token
            }
        }
        this.processUploadImage(options)
    }

    /**
     * Process Upload Image
     */
    processUploadImage(options) {
        Upload.startUpload(options).then((uploadId) => {
            console.log('Upload started')
            Upload.addListener('progress', uploadId, (data) => {
                console.log(`Progress: ${data.progress}%`)
            })
            Upload.addListener('error', uploadId, (data) => {
                console.log(`Error: ${data.error} %`)
                this.showMessage(localizes('uploadImageError'))
                this.setState({
                    isShowLoading: false
                })
            })
            Upload.addListener('cancelled', uploadId, (data) => {
                console.log(`Cancelled!`)
            })
            Upload.addListener('completed', uploadId, (data) => {
                console.log('Completed!: ', this.indexImagesMessage, " - ", data)
                if (!Utils.isNull(data.responseBody)) {
                    let result = JSON.parse(data.responseBody)
                    let pathImage = result.data
                    console.log('Hello in chat view ' + pathImage)
                    this.objectImages += pathImage + (this.indexImagesMessage == this.imagesMessage.length - 1 ? '' : ',')
                }
                if (this.indexImagesMessage < this.imagesMessage.length - 1) {
                    this.indexImagesMessage++
                    const timeOut = setTimeout(() => {
                        this.uploadImageStepByStep()
                    }, 200);
                } else {
                    console.log("this.objectImages: ", this.objectImages)
                    // upload images done!
                    this.onPressSendMessages("", this.objectImages)
                }
            })
        }).catch((err) => {
            this.saveException(err, 'processUploadImage')
        })
    }

    renderRightMenu = () => {
        return (
            <View style={{ paddingRight: Constants.PADDING_XX_LARGE }}></View>
        )
    }

    render() {
        console.log("this.state.enableLoadMore", this.state.enableLoadMore)
        return (
            <Container style={styles.container}>
                <Root>
                    <Header noShadow style={[commonStyles.header, { backgroundColor: Colors.COLOR_PRIMARY }]}>
                        {this.renderHeaderView({
                            visibleBack: true,
                            visibleStage: false,
                            title: this.userMemberName,
                            titleStyle: { color: Colors.COLOR_WHITE },
                            iconDark: true,
                            renderRightMenu: this.renderRightMenu
                        })}
                    </Header>
                    <FlatListCustom
                        showsVerticalScrollIndicator={false}
                        enableLoadMore={this.state.enableLoadMore}
                        onLoadMore={() => {
                            console.log("this.isLoadingMore", this.isLoadingMore)
                            !this.isLoadingMore && this.readFirebaseDatabase(true)
                        }}
                        inverted={true}
                        onRef={(ref) => { this.flatListRef = ref }}
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingHorizontal: Constants.PADDING_LARGE
                        }}
                        horizontal={false}
                        data={this.state.messages}
                        renderItem={this.renderItemChat}
                    />
                    <View style={[commonStyles.viewCenter, commonStyles.viewHorizontal, {
                        backgroundColor: Colors.COLOR_WHITE,
                        flex: 0, paddingHorizontal: Constants.PADDING_X_LARGE, marginBottom: this.state.keyboardHeight
                    }]}>
                        {Utils.isNull(this.state.messageText) ?
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                style={{}}
                                onPress={() => this.onChooseImage()}>
                                <Image
                                    source={ic_send_image}
                                    resizeMode={'cover'}
                                />
                            </TouchableOpacity>
                            : null}
                        <TextInput style={[commonStyles.text]}
                            editable={!this.state.isShowLoading}
                            selectTextOnFocus={!this.state.isShowLoading}
                            placeholder={"Aa"}
                            placeholderTextColor={Colors.COLOR_DRK_GREY}
                            ref={r => (this.messageInput = r)}
                            value={this.state.messageText}
                            onChangeText={(text) => {
                                this.setState({ messageText: text })
                            }}
                            style={{
                                flex: 1,
                                maxHeight: 100,
                                marginHorizontal: Constants.MARGIN_LARGE,
                                paddingHorizontal: Constants.PADDING_LARGE
                            }}
                            keyboardType="default"
                            underlineColorAndroid='transparent'
                            returnKeyType={"send"}
                            multiline={true}
                        />
                        <TouchableOpacity
                            activeOpacity={Constants.ACTIVE_OPACITY}
                            style={{
                                backgroundColor: Colors.COLOR_PRIMARY,
                                paddingHorizontal: Constants.PADDING_LARGE,
                                borderRadius: Constants.CORNER_RADIUS
                            }}
                            onPress={() => !this.props.isLoading
                                && !Utils.isNull(this.state.messageText)
                                && this.state.messageText.trim() !== ""
                                && this.onPressSendMessages()} >
                            <Text style={[commonStyles.text, { color: Colors.COLOR_WHITE }]}>Gửi</Text>
                        </TouchableOpacity>
                    </View>
                    <ModalImageViewer
                        ref={'modalImageViewer'}
                    />
                    {this.showLoadingBar(this.state.isShowLoading)}
                </Root>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    data: state.chat.data,
    isLoading: state.chat.isLoading,
    error: state.chat.error,
    errorCode: state.chat.errorCode,
    action: state.chat.action
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatView);