import React, { Component } from "react";
import { Root, Header, Title, Content, Container, Tabs, Tab, List, Col } from "native-base";
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Dimensions,
    RefreshControl,
    processColor,
    Item,
    Input,
    Modal,
    TouchableHighlight,
    ToastAndroid,
    Picker,
    SafeAreaView,
    DeviceEventEmitter,
    NativeModules,
    ImageBackground,
    Platform
} from "react-native";
import ImagePicker from "react-native-image-picker";
import commonStyles from "styles/commonStyles";
import { Constants } from "values/constants";
import { Colors } from "values/colors";
import { localizes } from "locales/i18n";
import BaseView from "containers/base/baseView";
import ic_back_white from "images/ic_back_white.png";
import ic_cancel_white from "images/ic_cancel_white.png";
import Dialog, { DIALOG_WIDTH } from "components/dialog";
import FlatListCustom from "components/flatListCustom";
import GenderType from "enum/genderType";
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import * as productActions from "actions/productActions";
import { connect } from "react-redux";
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import Utils from "utils/utils";
import StringUtil from "utils/stringUtil";
import StorageUtil from "utils/storageUtil";
import DateUtil from "utils/dateUtil";
import styles from "./styles";
import moment from "moment";
import Upload from "lib/react-native-background-upload";
import ImageLoader from "components/imageLoader";
import { Fonts } from "values/fonts";
import ic_facebook from "images/ic_facebook.png";
import ic_google from "images/ic_google.png";
import ic_add_grey_dark from "images/ic_add_grey_dark.png";
import DialogCustom from "components/dialogCustom";
import { AccessToken, LoginManager, GraphRequest, GraphRequestManager, LoginButton } from "react-native-fbsdk";
import { GoogleSignin, GoogleSigninButton, statusCodes } from "react-native-google-signin";
import loginType from "enum/loginType";
import firebase from "react-native-firebase";
import screenType from "enum/screenType";
import { configConstants } from "values/configConstants";
import SlidingMenuType from "enum/slidingMenuType";
import ItemSlidingMenu from "./itemSlidingMenu";
import Hr from "components/hr";
import ImageViewer from 'react-native-image-zoom-viewer';
import ModalImageViewer from "containers/common/modalImageViewer";

const HEIGHT_ADDRESS_ITEM = 180;

const listSlidingMenu = [
    {
        name: localizes("userProfileView.userInfo"),
        hasChild: true,
        screen: SlidingMenuType.USER_INFO
    },
    {
        name: localizes("userProfileView.favoritePost"),
        hasChild: true,
        screen: SlidingMenuType.FAVORITE_POST
    },
    {
        name: localizes("userProfileView.myPost"),
        hasChild: true,
        screen: SlidingMenuType.MY_POST
    },
    {
        name: localizes("forgot_password.titleChangePassword"),
        hasChild: true,
        screen: SlidingMenuType.CHANGE_PASSWORD
    },
    {
        name: localizes("userProfileView.rules"),
        hasChild: true,
        screen: SlidingMenuType.RULES
    },

    { name: localizes("setting.log_out"), hasChild: false, screen: null }
];

class UserProfileView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            visibleDialog: false,
            source: "",
            txtAccountName: "",
            txtDateOfBird: "",
            txtPhoneNumber: "",
            txtEmail: "",
            user: null,
            userFB: null,
            userGG: null,
            enableRefresh: false,
            refreshing: false,
            isAlert: false,
            isAlertSocial: false,
            loginType: null,
            isLoadingChat: false,
        };
        this.userInfo = null;
        this.dataAccount = {};
        this.orders = [];
        this.dataAddress = [];
        this.dataPartner = null;
        this.userIdCurrent = null;
        this.filter = {
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
            userId: null
        };
        this.avatar = null;
        this.isSocial = false

    }

    componentWillMount() {
        super.componentWillMount();
        this.getSourceUrlPath();
        this.getProfile();
    }

    /**
     * Get profile user
     */
    getProfile() {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE)
            .then(user => {
                //this callback is executed when your Promise is resolved
                console.log("user", user);
                if (!Utils.isNull(user)) {
                    this.userInfo = user;
                    this.props.getUserProfile(user.id);
                    this.handleGetProfile(user);
                }
            })
            .catch(error => {
                //this callback is executed when your Promise is rejected
                this.saveException(error, "getProfile");
            });
    }

    // handle get profile
    handleGetProfile(user) {
        this.userInfo = user;
        this.setState({
            user: user,
            txtEmail: user.email,
            txtAccountName: user.name,
            txtDateOfBird: !Utils.isNull(user.birthDate)
                ? DateUtil.convertFromFormatToFormat(user.birthDate, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE)
                : null,
            txtPhoneNumber: user.phone,
            userFB: user.fbId,
            userGG: user.ggId
        });
    }

    //onRefreshing
    handleRefresh = () => {
        this.props.getUserProfile(this.userInfo.id);
        this.setState({
            refreshing: false
        });
    };

    /**
     * Handle data
     */
    handleData() {
        let data = this.props.data;
        console.log("DATA Profile", data);
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_USER_INFO)) {
                    this.dataAccount = data;
                    this.dataAddress = [];
                    if (!Utils.isNull(data.userAddresses)) {
                        data.userAddresses.forEach(item => {
                            this.dataAddress.push(item);
                        });
                    }
                    this.handleGetProfile(this.dataAccount);
                    this.userIdCurrent = this.dataAccount.id;
                    if (!Utils.isNull(data.partner)) {
                        this.dataPartner = data.partner;
                    }
                    this.handleGetProfile(this.dataAccount);
                    this.userIdCurrent = this.dataAccount.id;
                    if (!Utils.isNull(data)) {
                        this.avatar = data.avatarPath;
                        console.log("Avatar Path: ", !Utils.isNull(data.avatarPath));
                        const resourceUrlPathResize = !Utils.isNull(this.resourceUrlPathResize) ? this.resourceUrlPathResize.textValue : null;
                        this.state.source =
                            !Utils.isNull(data.avatarPath) && data.avatarPath.indexOf("http") != -1
                                ? data.avatarPath
                                : this.resourceUrlPathResize.textValue + "=" + data.avatarPath;
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.EDIT_PROFILE)) {
                    // this.showMessage(localizes("userProfileView.edit_infor_success"));
                } else if (this.props.action == getActionSuccess(ActionEvent.LOGIN_FB)) {
                    this.dataAccount = data;
                    this.setState({
                        userFB: this.dataAccount.fbId,
                        userGG: this.dataAccount.ggId
                    });
                } else if (this.props.action == getActionSuccess(ActionEvent.LOGIN_GOOGLE)) {
                    this.dataAccount = data;
                    this.setState({
                        userFB: this.dataAccount.fbId,
                        userGG: this.dataAccount.ggId
                    });
                }
            }
            // else if (this.props.errorCode == ErrorCode.USER_EXIST_TRY_LOGIN_FAIL) {
            //     if (this.state.loginType == loginType.FACEBOOK) {
            //         this.showMessage(localizes("userProfileView.existFacebook"));
            //         this.signOutFB(this.state.loginType);
            //     } else {
            //         this.showMessage(localizes("userProfileView.existGoogle"));
            //         this.signOutGG(this.state.loginType);
            //     }
            // } 
            else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    async componentDidMount() {
        // in this example, there are line, bar, candle, scatter, bubble in this combined chart.
        // according to MpAndroidChart, the default data sequence is line, bar, scatter, candle, bubble.
        // so 4 should be used as dataIndex to highlight bubble data.
        // if there is only bar, bubble in this combined chart.
        // 1 should be used as dataIndex to highlight bubble data.
        this.setState({
            ...this.state,
            highlights: [{ x: 1, y: 150, dataIndex: 1 }, { x: 2, y: 106, dataIndex: 1 }]
        });
        this.setState({
            ...this.state,
            highlights2: [{ x: 1, y: 150, dataIndex: 1 }, { x: 2, y: 106, dataIndex: 1 }]
        });
        DeviceEventEmitter.addListener("RNUploaderProgress", data => {
            let bytesWritten = data.totalBytesWritten;
            let bytesTotal = data.totalBytesExpectedToWrite;
            let progress = data.progress;

            console.log("upload progress: " + progress + "%");
        });

        //await GoogleSignin.hasPlayServices({ autoResolve: true });
        await GoogleSignin.configure({
            iosClientId: configConstants.KEY_IOS_CLIENT_ID_GOOGLE
            // Id: '114828036014-fgmqgjg3qg99s2afaq0fq2rqop25nbu8.apps.googleusercontent.com'
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    /**
     * show dialog logout
     */
    logoutDialog = () => (
        <DialogCustom
            visible={this.state.isAlert}
            isVisibleTitle={true}
            isVisibleContentText={true}
            isVisibleTwoButton={true}
            contentTitle={"Xác nhận"}
            textBtnOne={"Hủy"}
            textBtnTwo={"Đăng xuất"}
            contentText={localizes("slidingMenu.want_out")}
            onTouchOutside={() => {
                this.setState({ isAlert: false });
            }}
            onPressX={() => {
                this.setState({ isAlert: false });
            }}
            onPressBtnPositive={() => {
                StorageUtil.retrieveItem(StorageUtil.FCM_TOKEN)
                    .then(token => {
                        if (token != undefined) {
                            // const deviceId = DeviceInfo.getDeviceId();
                            let filter = {
                                deviceId: "",
                                deviceToken: token
                            };
                            this.props.deleteUserDeviceInfo(filter); // delete device info
                        } else {
                            console.log("token null");
                        }
                    })
                    .catch(error => {
                        //this callback is executed when your Promise is rejected
                        this.saveException(error, "logoutDialog");
                    });
                StorageUtil.deleteItem(StorageUtil.USER_PROFILE)
                    .then(user => {
                        console.log("user setting", user);
                        if (Utils.isNull(user)) {
                            this.showMessage(localizes("setting.logoutSuccess"));
                            this.setState({ isAlert: false });
                            this.logout();
                            this.goHomeScreen();
                        } else {
                            this.showMessage(localizes("setting.logoutFail"));
                        }
                    })
                    .catch(error => {
                        this.saveException(error, "logoutDialog");
                    });
                this.signOutFB(this.state.userFB);
                this.signOutGG(this.state.userGG);
            }}
        />
    );

    /**
     * show dialog cancel connect social
     */
    cancelConnectDialog = () => (
        <DialogCustom
            visible={this.state.isAlertSocial}
            isVisibleTitle={true}
            isVisibleContentText={true}
            isVisibleTwoButton={true}
            contentTitle={"Hủy liên kết"}
            textBtnOne={"Không"}
            textBtnTwo={"Có"}
            contentText={this.state.loginType == loginType.FACEBOOK ? "Bạn có muốn hủy liên kết Facebook không?" : "Bạn có muốn hủy liên kết Google không?"}
            onTouchOutside={() => {
                this.setState({ isAlertSocial: false });
            }}
            onPressX={() => {
                this.setState({ isAlertSocial: false });
            }}
            onPressBtnPositive={() => {
                const { user } = this.state;
                let data = {
                    email: user.email,
                    phone: user.phone,
                    avatarPath: user.photo,
                    socialId: null,
                    gender: GenderType.MALE,
                    token: "",
                    rememberToken: "",
                    name: user.name,
                    birthDate: user.birthDate
                };
                this.state.loginType == loginType.FACEBOOK ? this.props.loginFacebook(data) : this.props.loginGoogle(data);
                this.setState({
                    isAlertSocial: false
                });
                this.signOutFB(this.state.loginType);
                this.signOutGG(this.state.loginType);
            }}
        />
    );

    /**
     * Render View
     */
    render() {
        const { user } = this.state;
        let height = Platform.OS === "ios" ? Constants.STATUS_BAR_HEIGHT : 0;
        return (
            <Container style={styles.container}>
                <Root>
                    <View style={{ paddingTop: height, flexGrow: 1 }}>
                        <Content
                            ref={e => {
                                this.fScroll = e;
                            }}
                            contentContainerStyle={{ flexGrow: 1 }}
                            style={{ flex: 1 }}
                            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.handleRefresh} />}
                        >
                            <ScrollView>
                                {this.renderHeaderUser()}
                                {this.renderSlidingMenu()}
                                {/* {this.renderAddress()} */}
                                {this.logoutDialog()}
                                {/* {this.cancelConnectDialog()} */}
                            </ScrollView>
                        </Content>
                        <ModalImageViewer
                            ref={'modalImageViewer'}
                        />
                    </View>
                    {this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    /**
     * On click Avatar
     */
    onClickAvatar() {
        let index = 0;
        let images = [{ path: this.avatar }]
        this.refs.modalImageViewer.showModal(images, index)
    }

    /**
     * Render header user
     */
    renderHeaderUser = () => {
        const { source, txtPhoneNumber, txtAccountName, userFB, userGG } = this.state;
        let isSocial = !Utils.isNull(this.avatar) ? (this.avatar.indexOf("http") != -1 ? true : false) : false
        return (
            <View
                style={{
                    flexDirection: "row",
                    backgroundColor: Colors.COLOR_WHITE,
                    marginBottom: Constants.MARGIN_X_LARGE,
                    padding: Constants.PADDING_X_LARGE
                }}
            >
                <TouchableOpacity style={{ position: "relative" }}
                    onPress={() => {
                        this.onClickAvatar();
                    }}
                >
                    <ImageLoader
                        style={[styles.imageSizeAvatar]}
                        resizeAtt={isSocial ? null : {
                            type: 'thumbnail',
                            width: Constants.AVATAR_WIDTH_HEIGHT,
                            height: Constants.AVATAR_WIDTH_HEIGHT
                        }}
                        resizeModeType={"cover"}
                        path={source}
                    />
                </TouchableOpacity>
                <View style={{ marginLeft: Constants.MARGIN_LARGE }}>
                    <Text
                        style={[
                            commonStyles.textBold,
                            {
                                fontSize: Fonts.FONT_SIZE_X_MEDIUM,
                                color: Colors.COLOR_BLACK,
                                margin: 0,
                                flexDirection: "row",
                                marginBottom: Constants.MARGIN,
                                alignItems: "center",
                                marginHorizontal: Constants.MARGIN
                            }
                        ]}
                    >
                        {txtAccountName}
                    </Text>
                    <Text
                        style={[
                            commonStyles.text,
                            {
                                flexDirection: "row",
                                fontSize: Fonts.FONT_SIZE_MEDIUM,
                                marginBottom: Constants.MARGIN,
                                alignItems: "center",
                                marginHorizontal: Constants.MARGIN
                            }
                        ]}
                    >
                        {StringUtil.formatPhoneSpace(txtPhoneNumber)}
                    </Text>
                </View>
            </View>
        );
    };

    /**
     * render menu
     */

    renderSlidingMenu() {
        return (
            <View
                style={{
                    marginBottom: Constants.MARGIN_LARGE,
                    backgroundColor: Colors.COLOR_WHITE,
                    paddingHorizontal: Constants.PADDING_X_LARGE
                }}
            >
                <FlatListCustom
                    style={{
                        paddingVertical: Constants.PADDING
                    }}
                    horizontal={false}
                    data={!Utils.isNull(this.state.txtAccountName) ? listSlidingMenu : listSlidingMenu.slice(0, listSlidingMenu.length - 1)}
                    itemPerCol={1}
                    renderItem={this.renderItemSlide.bind(this)}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        );
    }

    /**
     * renderItem flatlist
     */
    renderItemSlide(item, index, parentIndex, indexInParent) {
        return (
            <View>
                <ItemSlidingMenu
                    data={!Utils.isNull(this.state.txtAccountName) ? listSlidingMenu : listSlidingMenu.slice(0, listSlidingMenu.length - 1)}
                    item={item}
                    index={index}
                    navigation={this.props.navigation}
                    userInfo={this.userInfo}
                    callBack={() => this.getUserProfile()}
                    resourceUrlPathResize={this.resourceUrlPathResize}
                    source={this.state.source}
                    onLogout={() => this.setState({ isAlert: true })}
                />
                {index != listSlidingMenu.length - 1 ? <Hr color={Colors.COLOR_BACKGROUND} /> : null}
            </View>
        );
    }

    /**
     * Render partner
     */
    renderPartner = () => {
        return (
            <View style={{ marginTop: Constants.MARGIN_LARGE }}>
                <Text style={[commonStyles.text, { paddingHorizontal: Constants.PADDING_X_LARGE }]}>Đơn vị</Text>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() =>
                        this.props.navigation.navigate("RegisterPartner", {
                            refreshProfile: this.getUserProfile.bind(this),
                            data: null,
                            titlePartner: localizes("registerPartner.note")
                        })
                    }
                >
                    <View
                        style={[
                            commonStyles.shadowOffset,
                            {
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                backgroundColor: Colors.COLOR_WHITE,
                                shadowColor: Colors.COLOR_BLUE,
                                borderRadius: Constants.CORNER_RADIUS + 4,
                                paddingHorizontal: Constants.PADDING_24,
                                paddingVertical: Constants.PADDING_X_LARGE,
                                marginHorizontal: Constants.MARGIN_X_LARGE,
                                marginTop: Constants.MARGIN,
                                marginBottom: Constants.MARGIN_X_LARGE
                            }
                        ]}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_XX_MEDIUM, margin: 0 }]}>
                                {!Utils.isNull(this.dataPartner) ? this.dataPartner.name : localizes("userProfileView.choosePartner")}
                            </Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }} />
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render address
     */
    renderAddress = () => {
        return (
            <View style={{ marginTop: Constants.MARGIN_LARGE }}>
                <Text style={[commonStyles.text, { paddingHorizontal: Constants.PADDING_X_LARGE, marginBottom: 0 }]}>Địa chỉ</Text>
                {this.dataAddress.length != 0 ? (
                    <View>
                        <FlatListCustom
                            onRef={ref => {
                                this.listAddressRef = ref;
                            }}
                            style={{
                                paddingVertical: Constants.PADDING
                            }}
                            horizontal={true}
                            data={this.dataAddress}
                            itemPerCol={1}
                            renderItem={this.renderItemAddress.bind(this)}
                            showsHorizontalScrollIndicator={false}
                            ListHeaderComponent={() => (
                                <TouchableOpacity
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    style={[
                                        commonStyles.viewCenter,
                                        commonStyles.shadowOffset,
                                        {
                                            paddingHorizontal: Constants.PADDING_LARGE,
                                            backgroundColor: Colors.COLOR_WHITE,
                                            height: HEIGHT_ADDRESS_ITEM,
                                            borderRadius: Constants.CORNER_RADIUS,
                                            marginLeft: Constants.MARGIN_X_LARGE,
                                            marginTop: Constants.MARGIN,
                                            margin: Constants.MARGIN_LARGE,
                                            marginBottom: Constants.MARGIN_X_LARGE
                                        }
                                    ]}
                                    onPress={() => {
                                        this.gotoAddAddress();
                                    }}
                                    block
                                >
                                    <View style={{ padding: Constants.PADDING_LARGE }}>
                                        <Image resizeMode={"cover"} source={ic_add_grey_dark} />
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                ) : (
                        <TouchableOpacity
                            activeOpacity={Constants.ACTIVE_OPACITY}
                            style={[
                                commonStyles.shadowOffset,
                                {
                                    flexDirection: "row",
                                    backgroundColor: Colors.COLOR_WHITE,
                                    alignItems: "center",
                                    borderRadius: Constants.CORNER_RADIUS + 4,
                                    padding: Constants.MARGIN_LARGE,
                                    marginHorizontal: Constants.MARGIN_X_LARGE,
                                    marginBottom: Constants.MARGIN_X_LARGE,
                                    marginTop: Constants.MARGIN_LARGE
                                }
                            ]}
                            onPress={() => {
                                this.gotoAddAddress();
                            }}
                            block
                        >
                            <View style={{ padding: Constants.PADDING_LARGE }}>
                                <Image resizeMode={"contain"} source={ic_add_grey_dark} />
                            </View>
                            <View style={{ flex: 1, alignItems: "center" }}>
                                <Text
                                    style={[
                                        commonStyles.text,
                                        {
                                            color: Colors.COLOR_DRK_GREY,
                                            marginVertical: 0,
                                            marginLeft: -Constants.MARGIN_X_LARGE
                                        }
                                    ]}
                                >
                                    Thêm địa chỉ của bạn
                            </Text>
                            </View>
                        </TouchableOpacity>
                    )}
            </View>
        );
    };

    // Get User Profile
    getUserProfile() {
        this.props.getUserProfile(this.userInfo.id);
        !Utils.isNull(this.listAddressRef) ? this.listAddressRef.scrollToOffset({ animated: true, offset: 0 }) : null;
    }

    gotoAddAddress = data => {
        this.props.navigation.navigate("AddAddress", {
            refreshProfile: this.getUserProfile.bind(this),
            dataAddress: data
        });
    };

    /**
     * Render item
     * @param {*} item
     * @param {*} index
     * @param {*} parentIndex
     * @param {*} indexInParent
     */
    renderItemAddress(item, index, parentIndex, indexInParent) {
        return <AddressItem data={this.dataAddress} item={item} index={index} onSetAddress={this.gotoAddAddress.bind(this)} />;
    }

    /**
     * Login via Facebook
     */
    loginFacebook = async () => {
        const { user } = this.state;
        console.log("Connect Facebook");
        this.setState({ loginType: loginType.FACEBOOK });
        try {
            LoginManager.logInWithReadPermissions(["public_profile", "email"]).then(result => {
                if (result.isCancelled) {
                    return;
                }
                AccessToken.getCurrentAccessToken().then(data => {
                    console.log(data); // output 1:
                    const responseInfoCallback = (error, profile) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("Data facebook: ", profile); // output 2:
                            let data = {
                                email: profile.email,
                                phone: user.phone,
                                socialId: profile.id,
                                gender: GenderType.MALE
                            };
                            this.props.loginFacebook(data);
                        }
                    };
                    const accessToken = data.accessToken;
                    const infoRequest = new GraphRequest(
                        "/me",
                        {
                            accessToken,
                            parameters: {
                                fields: {
                                    string: "name,gender,email"
                                }
                            }
                        },
                        responseInfoCallback
                    );
                    new GraphRequestManager().addRequest(infoRequest).start();
                });
            });
        } catch (error) {
            this.saveException(error, "loginFacebook");
        }
    };

    /**
     * Login via Google
     */
    loginGoogle = async () => {
        const { user } = this.state;
        console.log("Connect Google");
        this.setState({ loginType: loginType.GOOGLE });
        try {
            await GoogleSignin.signOut();
            GoogleSignin.signIn()
                .then(dataUser => {
                    console.log("Data google: ", dataUser);
                    let data = {
                        email: dataUser.email,
                        phone: user.phone,
                        socialId: dataUser.id,
                        gender: GenderType.MALE
                    };
                    this.props.loginGoogle(data);
                })
                .catch(err => {
                    this.saveException(err, "loginGoogle");
                })
                .done();
        } catch (error) {
            this.saveException(error, "loginGoogle");
        }
    };
}

const mapStateToProps = state => ({
    data: state.userProfile.data,
    action: state.userProfile.action,
    isLoading: state.userProfile.isLoading,
    error: state.userProfile.error,
    errorCode: state.userProfile.errorCode,
    screen: state.userProfile.screen
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserProfileView);
