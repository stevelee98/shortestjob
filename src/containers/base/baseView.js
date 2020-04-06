import React, { Component } from "react";
import {
    BackHandler, ImageBackground, View, StatusBar, DeviceEventManager, Image, ActivityIndicator,
    TouchableOpacity, Dimensions, Platform, Alert, Linking, NetInfo, DeviceEventEmitter, Keyboard,
    NativeModules, PermissionsAndroid
} from "react-native";
import {
    Root, Form, Textarea, Container, Header, Title, Left, Icon, Right,
    Button, Body, Content, Text, Card, CardItem,
    Fab, Footer, Input, Item, ActionSheet, Spinner,
} from "native-base";
import { StackActions, NavigationActions } from 'react-navigation';
import { Constants } from "values/constants";
import HeaderView from "containers/common/headerView";
import commonStyles from 'styles/commonStyles';
import { Colors } from "values/colors";
import { ErrorCode } from "config/errorCode";
import { localizes } from "locales/i18n";
import StorageUtil from "utils/storageUtil";
import firebase, { Notification, NotificationOpen } from 'react-native-firebase';
import ExamQuestionSectionType from "enum/examQuestionSectionType"
import formalType from "enum/formalType";
import DateUtil from "utils/dateUtil";
import Utils from 'utils/utils'
import Toast from 'react-native-root-toast';
import DeviceInfo from 'react-native-device-info';
import VersionNumber from 'react-native-version-number';
import statusType from "enum/statusType";
import myGlobal from "utils/global"
import { AccessToken, LoginManager, GraphRequest, GraphRequestManager, LoginButton } from 'react-native-fbsdk';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import StringUtil from "utils/stringUtil";
import { async } from "rxjs/internal/scheduler/async";
import { Fonts } from "values/fonts";
import imageRatio from "enum/imageRatio";
import userType from 'enum/userType';
import MapCustomView from "containers/map/mapCustomView";
import notificationType from "enum/notificationType";
import messageType from "enum/messageType";
import screenType from "enum/screenType";

const screen = Dimensions.get("window");

const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Main' })],
});

const resetActionLogin = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Login' })],
});

const CHANNEL_ID = 'aaChannelId'
const CHANNEL_NAME = 'Thông báo chung'

/**
 * Base view class
 */
class BaseView extends Component {

    constructor(props) {
        super(props);
        this.className = this.constructor.name;
        this.resourceUrlPath = {};
        this.resourceUrlPathResize = {};
        this.hotline = {};
        this.userAdmin = {};
        this.maxFileSizeUpload = {};
        this.quantityCart = 0;
    }

    goto() {

    }

    render() {
        return (
            <View></View>
        );
    }

    /**
     * Show toast message
     * @param {*} message 
     * @param {*} duration 
     * @param {*} type 
     */
    // ToastAndroid.show('A pikachu appeared nearby !', ToastAndroid.SHORT);
    showMessage(message, duration = 30000, type = 'warning') {
        try {
            // if (!global.isShowToastAlert) {
            //     global.isShowToastAlert = true
            Toast.show(message, {
                duration: Toast.durations.LONG,
                position: Toast.positions.CENTER,
            });
            // } 
            // setTimeout(() => { 
            //     global.isShowToastAlert = false
            // }, duration)
        } catch (e) {
            this.saveException(e, "showMessage")
        }
    }

    /**
     * Go to login screen
     */
    goLoginScreen() {
        this.props.navigation.dispatch(resetActionLogin)
    }

    //Show login view
    showLoginView(route) {
        if (!Utils.isNull(route)) {
            this.props.navigation.navigate('Login', {
                router: {
                    name: route.routeName,
                    params: route.params
                }
            })
        } else {
            this.props.navigation.navigate('Login')
        }
    }

    //Save exception
    saveException(error, func) {
        let filter = {
            className: this.props.navigation ? this.props.navigation.state.routeName : this.className,
            exception: error.message + " in " + func,
            osVersion: DeviceInfo.getSystemVersion(),
            appVersion: VersionNumber.appVersion
        }
        console.log(filter)
        this.props.saveException(filter)
    }

    componentWillMount() {
        console.log("I am Base View", this.props)
        Dimensions.addEventListener('change', this.onChangedOrientation)
        this.getSourceUrlPath();
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.onChangedOrientation)
        NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectionChange)
        if (this.messageListener != undefined) {
            this.messageListener();
        }
        if (this.notificationListener != undefined) {
            this.notificationListener();
        }
        if (this.notificationOpenedListener != undefined) {
            this.notificationOpenedListener();
        }
        if (this.notificationDisplayedListener != undefined) {
            this.notificationDisplayedListener();
        }
    }

    onChangedOrientation = (e) => {

    }

    /**
     * Go to notification
     * @param {*} className 
     * @param {*} params 
     * @param {*} isNavigate 
     */
    goToScreen(data, isInBackground = false) {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then((user) => {
            if (!Utils.isNull(user) && user.status == statusType.ACTIVE) {
                if (this.props.navigation) {   
                    if (data.type == notificationType.MESSAGE_NOTIFICATION) {
                        this.userMember = {
                            id: !Utils.isNull(data.sellerId) ? Number(data.sellerId) : Number(myGlobal.userAdminId),
                            name: !Utils.isNull(data.sellerName) ? data.sellerName : myGlobal.nameMemberChat,
                            avatarPath: !Utils.isNull(data.sellerPath) ? data.sellerPath : myGlobal.adminPath
                        }
                        this.props.navigation.navigate("Chat", {
                            userMember: this.userMember,
                            conversationId: Number(data.conversationId)
                        });
                    } else if (data.type == notificationType.COMMENT_NOTIFICATION) {
                        var obj = JSON.parse(Utils.cloneObject(data.data));
                        if(!(Utils.isNull(obj.productId) && Utils.isNull(obj.sellerId)))
                        this.props.navigation.navigate("SellingVehicleDetail", {
                            vehicleId: obj.productId,
                            sellerId: obj.sellerId
                        })
                    } else if(data.type == notificationType.FEEDBACK_COMMENT_NOTIFICATION) {
                        var obj = JSON.parse(Utils.cloneObject(data.data));
                        this.props.navigation.navigate('ReviewSellingVehicleDetail', {
                            idComment: Number(obj.parentReviewId),                 
                            sellingId: Number(obj.sellingId),                      
                        });
                    } 
                    else {
                        this.props.navigation.navigate("Notification");
                    }
                }
            }
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error roles: ' + error);
        });
    }

    /**
     * Sign out GG
     */
    signOutGG = async (data) => {
        try {
            if (!Utils.isNull(data)) {
                await GoogleSignin.signOut();
            }
        } catch (error) {
            this.saveException(error, "signOutGG")
        }
    };

    /**
     * Sign out FB
     */
    signOutFB = async (data) => {
        if (!Utils.isNull(data)) {
            LoginManager.logOut()
        }
    };

    /**
     * Handler back button
     */
    handlerBackButton = () => {
        console.log(this.className, 'back pressed')
        if (this.props.navigation) {
            this.onBack()
        } else {
            return false
        }
        return true
    }

    /**
     * Back pressed
     * True: not able go back
     * False: go back
     */
    onBackPressed() {
        return false
    }

    /**
     * On back
     */
    onBack = () => {
        if (this.props.navigation) {
            this.props.navigation.goBack()
        }
    }

    /**
     * Go to home screen
     */
    goHomeScreen() {
        this.props.navigation.dispatch(resetAction)
    }

    /**
     * Show cart
     */
    showCart = () => {
        this.props.navigation.navigate("Cart")
    }

    /**
     * Go home
     */
    goHome = () => {
        this.props.navigation.navigate("Main")
    }

    /**
     * Render header view
     * default: visibleBack = true
     * onBack, stageSize, initialIndex
     *
     * @param {*} props 
     */
    renderHeaderView(props = {}) {
        const defaultProps = {
            visibleBack: true,
            onBack: this.onBack,
            shadowOffset: { height: 6, width: 3 },
            shadowOpacity: 0.25,
            elevation: Constants.SHADOW
        }
        const newProps = { ...defaultProps, ...props }
        return <HeaderView {...newProps} />
    }

    /**
     * Render right header
     */
    renderRightHeader = () => {
        return (
            <View style={{ padding: Constants.PADDING_X_LARGE + Constants.PADDING }} />
        )
    }

    /**
     * Render map view
     *
     * @param {*} props 
     */
    renderMapView(props = {}) {
        const defaultProps = {
            visibleMakerMyLocation: true,
            visibleLoadingBar: true,
            visibleButtonLocation: true
        }
        const newProps = { ...defaultProps, ...props }
        return <MapCustomView onRef={(ref) => { this.map = ref }} {...newProps} />
    }

    /**
     * Common button have 100% width with opacity when clicked
     * @param {*} title 
     * @param {*} titleStyle 
     * @param {*} buttonStyle 
     */
    renderCommonButton(title = '', titleStyle = {}, buttonStyle = {}, onPress = null, icon, disableButton, viewStyle = {}, isLoading = false, enabledLoading = false) {
        let onPressItem = onPress ? onPress : this.onPressCommonButton.bind(this)
        return (
            <View style={[viewStyle]}>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    disabled={disableButton}
                    onPress={onPress}
                    style={[commonStyles.shadowOffset, commonStyles.buttonStyle, buttonStyle, {
                        margin: 0
                    }]}>
                    <View style={[commonStyles.viewHorizontal, { flex: 0 }]}>
                        <View style={[{
                            // backgroundColor: Colors.COLOR_RED,
                            // textAlign: 'left'
                        }]}>
                            {!Utils.isNull(icon) ? <Image source={icon} /> : null}
                        </View>
                        {!isLoading && !enabledLoading
                            ? <Text style={[commonStyles.text, titleStyle]} >
                                {title}
                            </Text>
                            : <ActivityIndicator color={Colors.COLOR_WHITE} animating size="large" />
                        }
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    onPressCommonButton() {
    }

    /**
     * Go next screen
     * @param {*} className 
     * @param {*} params 
     * @param {*} isNavigate 
     */
    goNextScreen(className, params = this.props.navigation.state.params, isNavigate = true) {
        if (isNavigate)
            this.props.navigation.navigate(className, params)
        else
            this.props.navigation.push(className, params)
    }

    /**
     * get new notification
     */
    countNewNotification = () => {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then((user) => {
            console.log("user roles success", user)
            if (this.props.countNewNotification && !Utils.isNull(user) && user.status == statusType.ACTIVE) {
                this.props.countNewNotification()
            }
        }).catch((error) => {
            console.log(error)
        });
    }

    /**
     * Logout
     */
    logout() {
        StorageUtil.deleteItem(StorageUtil.USER_PROFILE);
        StorageUtil.storeItem(StorageUtil.USER_PROFILE, null);
        StorageUtil.deleteItem(StorageUtil.USER_TOKEN);
        StorageUtil.storeItem(StorageUtil.USER_TOKEN, null);
        StorageUtil.deleteItem(StorageUtil.FIREBASE_TOKEN);
        StorageUtil.storeItem(StorageUtil.FIREBASE_TOKEN, null);
        global.token = "";
        global.firebaseToken = "";
        firebase.notifications().setBadge(0);
        myGlobal.badgeCount = 0;
        firebase.auth().signOut();
    }

    /**
     * Authentication firebase
     */
    async signInWithCustomToken(userId) {
        console.log("FIREBASE TOKEN: ", global.firebaseToken)
        if (!Utils.isNull(global.firebaseToken) & !Utils.isNull(userId)) {
            if (Platform.OS === "android") {
                await firebase.auth().signInWithCustomToken(global.firebaseToken).catch(function (error) {
                    console.warn("Error auth: " + error.code + " - " + error.message);
                });
            } else {
                var view = NativeModules.AppDelegate
                await view.loginAuthenFirebase(global.firebaseToken)
            }
        }
    }

    // /**
    //  * put info of user to firebase
    //  * @param {*} userId 
    //  * @param {*} userName 
    //  * @param {*} avatarPath 
    //  */
    // putUserInfoToFirebase(userId, userName, avatarPath) {
    //     firebase.database().ref(`/users`)
    //         .child(userId)
    //         .set({
    //             name: userName,
    //             avatar: avatarPath,
    //             isOnline: true
    //         });
    // }

    /**
     * Handle error
      @param {} errorCode 
     */
    handleError(errorCode, error) {
        switch (errorCode) {
            case ErrorCode.ERROR_COMMON:
                this.showMessage(localizes("error_in_process"))
                break
            case ErrorCode.NO_CONNECTION:
                NetInfo.isConnected.fetch().done(
                    (isConnected) => {
                        if (isConnected) {
                            this.showMessage(localizes("error_connect_to_server"))
                        } else {
                            this.showMessage(localizes("error_network"))
                        }
                    })
                break
            case ErrorCode.UN_AUTHORIZE:
            case ErrorCode.AUTHENTICATE_REQUIRED:
                Alert.alert(
                    'Thông báo',
                    'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!',
                    [
                        {
                            text: 'Hủy', onPress: () => { }
                        },
                        {
                            text: 'OK', onPress: () => {
                                this.logout()
                                this.showLoginView()
                            }
                        }
                    ],
                    { cancelable: false },
                );
                break
            default:
        }
    }

    /**
     * Handle connection change
     */
    handleConnectionChange = (isConnected) => {
        console.log(`is connected: ${isConnected}`)
    }

    /**
     * Open screen call
     * @param {*} phone 
     */
    renderCall(phone) {
        let url = `tel:${phone}`;
        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
                console.log('Can\'t handle url: ' + url);
            } else {
                return Linking.openURL(url);
            }
        }).catch(err =>
            this.saveException(err, "renderCall")
        );
    }

    /**
     * Open screen sms
     * @param {*} phone 
     * @param {*} message
     */
    renderSMS(phone, message) {
        Linking.openURL(`sms:${phone}?body=${message}`)
    }

    /**
     * Show loading bar
     * @param {*} isShow 
     */
    showLoadingBar(isShow) {
        return isShow ? < Spinner style={{ position: 'absolute', top: (screen.height - 200) / 2, left: 0, right: 0, bottom: 0 }} color={Colors.COLOR_PRIMARY} ></Spinner> : null
    }

    /**
     * Get source url path
     */
    getSourceUrlPath = () => {
        StorageUtil.retrieveItem(StorageUtil.MOBILE_CONFIG).then((faq) => {
            if (!Utils.isNull(faq)) {
                this.resourceUrlPath = faq.find(x => x.name == 'resource_url_path') || {}
                console.log('resource_url_path', this.resourceUrlPath)
                this.resourceUrlPathResize = faq.find(x => x.name == 'resource_url_path_resize') || {}
                console.log('resource_url_path_resize', this.resourceUrlPathResize)
                this.hotline = faq.find(x => x.name == 'hotline') || {}
                console.log('hotline', this.hotline)
                this.userAdmin = faq.find(x => x.name == 'user_admin_id') || {}
                console.log('userAdmin', this.userAdmin)
                this.maxFileSizeUpload = faq.find(x => x.name == 'max_file_size_upload') || {}
                console.log('maxFileSizeUpload', this.maxFileSizeUpload)
            }
        }).catch((error) => {
            this.saveException(error, "getSourceUrlPath")
        });
    }

    /**
     * Get cart
     */
    getCart() {
        StorageUtil.retrieveItem(StorageUtil.CART).then((carts) => {
            if (!Utils.isNull(carts)) {
                this.quantityCart = carts.reduce(this.totalQuantity, 0)
                this.props.getAllCart({
                    carts: carts,
                    quantity: this.quantityCart
                })
            } else {
                this.quantityCart = 0
                this.props.getAllCart({
                    carts: [],
                    quantity: 0
                })
            }
        }).catch((error) => {
            this.saveException(error, 'getCart')
        })
    }

    /**
     * Has permission
     */
    hasPermission = async (permissions) => {
        if (Platform.OS === 'ios' ||
            (Platform.OS === 'android' && Platform.Version < 23)) {
            return true;
        }

        const hasPermission = await PermissionsAndroid.check(
            permissions
        );

        if (hasPermission) return true;

        const status = await PermissionsAndroid.request(
            permissions
        );

        if (status === PermissionsAndroid.RESULTS.GRANTED) return true;

        if (status === PermissionsAndroid.RESULTS.DENIED) {
            console.log("Permission denied by user.");
        } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            console.log("Permission revoked by user.");
        }

        return false;
    }

    /**
     * Total quantity
     * @param {*} accumulator 
     * @param {*} item 
     */
    totalQuantity(accumulator, item) {
        return accumulator + item.quantity
    }

    /**
     * Total price
     * @param {*} accumulator 
     * @param {*} item 
     */
    totalPriceCart(accumulator, item) {
        return accumulator + (item.price * item.quantity)
    }

    async componentDidMount() {
        this.checkPermission();
        this.createNotificationListeners(); //add this line
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    }

    //1
    async checkPermission() {
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.getToken();
        } else {
            this.requestPermission();
        }
    }

    //2
    async requestPermission() {
        try {
            await firebase.messaging().requestPermission();
            // User has authorised
            this.getToken();
        } catch (error) {
            // User has rejected permissions
        }
    }

    //3
    async getToken() {
        let fcmToken = null;
        StorageUtil.retrieveItem(StorageUtil.FCM_TOKEN).then((token) => {
            fcmToken = token
            if (!fcmToken) {
                // Get token
                firebase.messaging().getToken().then((token) => {
                    StorageUtil.storeItem(StorageUtil.FCM_TOKEN, token)
                    this.refreshToken()
                });
                if (fcmToken) {
                    // user has a device token
                    // await AsyncStorage.setItem('fcmToken', fcmToken);
                    StorageUtil.storeItem(StorageUtil.FCM_TOKEN, fcmToken)
                }
            }
        })
        // Get token when referesh
        firebase.messaging().onTokenRefresh((token) => {
            StorageUtil.storeItem(StorageUtil.FCM_TOKEN, token)
            this.refreshToken()
        });
    }

    /**
     * Refresh token
     */
    refreshToken = () => {
        StorageUtil.retrieveItem(StorageUtil.FCM_TOKEN).then((token) => {
            if (this.props.postUserDeviceInfo && !Utils.isNull(token)) {
                StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then((user) => {
                    if (!Utils.isNull(user) && user.status == statusType.ACTIVE) {
                        // const deviceId = DeviceInfo.getDeviceId();
                        let filter = {
                            deviceId: "",
                            deviceToken: token
                        }
                        this.props.postUserDeviceInfo(filter)
                    }
                }).catch((error) => {
                    //this callback is executed when your Promise is rejected
                    console.log('Promise is rejected with error roles: ' + error);
                });
            } else {
                console.log('token null')
            }
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error: ' + error);
        });
    }


    /**
     * Create notification listener
     */
    async createNotificationListeners() {
        /*
         * Triggered for data only payload in foreground
         * */
        this.messageListener = firebase.messaging().onMessage((message) => {
            // Process your message as required
        });

        /*
         * Triggered when a particular notification has been received in foreground
         * */
        this.notificationListener = firebase.notifications().onNotification(async (notification) => {
            if (myGlobal.atMessage) {

            } else {
                console.log("Notification base foreground", notification);
                const localNotification = new firebase.notifications.Notification({
                    sound: 'default',
                    show_in_foreground: true
                })
                    .setNotificationId(notification._notificationId)
                    .setTitle(notification._title)
                    .setSubtitle(notification._subtitle)
                    .setBody(notification._body)
                    .setData(notification._data)
                    .android.setSmallIcon('@drawable/ic_notification')
                    .android.setPriority(firebase.notifications.Android.Priority.High);
                if (Platform.OS === 'android' && localNotification.android.channelId == null) {
                    const channel = new firebase.notifications.Android.Channel(
                        CHANNEL_ID,
                        CHANNEL_NAME,
                        firebase.notifications.Android.Importance.Max
                    ).setDescription('In stock channel');
                    // Create the channel
                    firebase.notifications().android.createChannel(channel);
                    localNotification.android.setChannelId(channel.channelId);
                    localNotification.android.setColor(Colors.COLOR_PRIMARY);
                }
                try {
                    await firebase.notifications().displayNotification(localNotification);
                    notification._android.setAutoCancel(true)
                    this.countNewNotification() // count nti
                } catch (e) {
                    console.log('catch', e)
                }
            }
        });

        /*
         * Process your notification as required
         * */
        this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification) => {
            // Process your notification as required
            // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
        });

        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            console.log("Notification base background", notificationOpen);
            firebase.notifications().removeAllDeliveredNotifications();
            this.countNewNotification() // count nti
            this.goToScreen(notificationOpen.notification._data, true);
        });

        /*
         * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
         * */
        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            console.log("Notification base closed", notificationOpen);
            StorageUtil.retrieveItem(StorageUtil.NOTIFICATION_ID).then((id) => {
                if (id != notificationOpen.notification._notificationId) {
                    setTimeout(() => {
                        this.goToScreen(notificationOpen.notification._data);
                    }, 1000)
                }
            }).catch((error) => {
                console.log(error)
            })
            StorageUtil.storeItem(StorageUtil.NOTIFICATION_ID, notificationOpen.notification._notificationId);
        }
    }

    /**
     * Register keyboard event
     */
    registerKeyboardEvent() {
        Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
        Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
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
}

export default BaseView;
