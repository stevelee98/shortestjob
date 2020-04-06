import React, { Component } from "react";
import { View, Text, BackHandler, Keyboard, Dimensions, TouchableOpacity, Image, Icon, Platform, TouchableHighlight, PermissionsAndroid } from "react-native";
import { Container, Root, Header, Content, Form, Item, Picker } from "native-base";
import BaseView from "containers/base/baseView";
import BackgroundShadow from "components/backgroundShadow";
import { Constants } from "values/constants";
import { Fonts } from 'values/fonts'
import TextInputCustom from "components/textInputCustom";
import { localizes } from "locales/i18n";
import { CalendarScreen } from "components/calendarScreen";
import ic_calendar_grey from "images/ic_calendar_grey.png";
import ic_image_white from "images/ic_image_white.png";
import DateUtil from "utils/dateUtil";
import { Colors } from "values/colors";
import styles from "./styles";
import commonStyles from "styles/commonStyles";
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import Utils from "utils/utils";
import StringUtil from "utils/stringUtil";
import moment, { locales } from "moment";
import ImageLoader from "components/imageLoader";
import DialogCustom from "components/dialogCustom";
import ImagePicker from "react-native-image-picker";
import ServerPath from "config/Server";
import Upload from "lib/react-native-background-upload";
import FlatListCustom from "components/flatListCustom";
import GenderType from "enum/genderType";
import screenType from "enum/screenType";
import ImageResizer from "react-native-image-resizer";
import { TextInputMask } from 'react-native-masked-text'

const CANCEL_INDEX = 2;
const FILE_SELECTOR = [localizes("camera"), localizes("image"), localizes("cancel")];
const optionsCamera = {
    title: "Select avatar",
    storageOptions: {
        skipBackup: true,
        path: "images"
    }
};

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
var HEIGHT_IMAGES = width * 0.4;

class UserInfoView extends BaseView {
    constructor(props) {
        super(props);
        const { userInfo, callBack, source, resourceUrlPathResize } = this.props.navigation.state.params;
        this.state = {
            isAlertSuccess: false,
            visibleDialog: false,
            isInvalidEmail: false,
            isEditPhoneNumber: false,
            isInvalidName: false,
            phone: userInfo.phone,
            fullName: userInfo.name,
            dayOfBirth: !Utils.isNull(userInfo.birthDate)
                ? DateUtil.convertFromFormatToFormat(
                    DateUtil.convertFromFormatToFormat(userInfo.birthDate, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE_TIME_ZONE),
                    DateUtil.FORMAT_DATE_TIME_ZONE,
                    DateUtil.FORMAT_DATE
                )
                : "",
            address: userInfo.address,
            email: userInfo.email,
            // gender: !Utils.isNull(userInfo.gender) ? userInfo.gender : GenderType.ORDER,
            source: source,
            userId: userInfo.id,
            avatarFilePath: { fileType: "", filePath: "" }
        };
        this.today = DateUtil.now();
        this.callBack = callBack;
        this.userInfo = userInfo;
        this.resourceUrlPathResizeValue = resourceUrlPathResize.textValue;
        this.onGenderChange = this.onGenderChange.bind(this);
        this.validate = this.validate.bind(this);
        this.dataAddress = [];
    }

    componentWillMount() {
        // this.getProfile();
        if (this.screen != screenType.FROM_HOME_VIEW) {
            BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        }
    }

    focusInput(text) {
        if (this.isFirstTime) return true;
        return text !== "";
    }

    /**
     * Show calendar date
     */
    showCalendarDate() {
        this.showCalendar.showDateTimePicker();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    /**
     * Handle data
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.EDIT_PROFILE)) {
                    this.setState({ isAlertSuccess: true });
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.showMessage('Email đã tồn tại');
                this.email.focus();
            }
        }
    }

    componentWillUnmount() {
        if (this.screen != screenType.FROM_HOME_VIEW) {
            BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
        }
    }

    render() {
        const { source } = this.state;
        const genderValue = this.state.gender;
        let isSocial = !Utils.isNull(this.userInfo) ?
            !Utils.isNull(this.userInfo.avatarPath) ?
                (this.userInfo.avatarPath.indexOf("http") != -1 ? true : false) : false
            : false
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header, { backgroundColor: Colors.COLOR_PRIMARY }]}>
                        {this.renderHeaderView({
                            title: localizes("userInfoView.title"),
                            visibleStage: false,
                            titleStyle: { color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightHeader
                        })}
                    </Header>
                    <Content contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                        <View
                            style={{
                                paddingHorizontal: Constants.PADDING_X_LARGE,
                                backgroundColor: Colors.COLOR_WHITE
                            }}
                        >
                            {/* Avatar */}
                            <View style={[commonStyles.viewCenter, { paddingVertical: Constants.PADDING_X_LARGE }]}>
                                <TouchableOpacity style={[styles.imageSize, { overflow: "hidden" }]} activeOpacity={Constants.ACTIVE_OPACITY} onPress={this.attachFile}>
                                    <ImageLoader
                                        style={[styles.imageSize]}
                                        resizeAtt={isSocial ? null : {
                                            type: "thumbnail",
                                            width: Constants.AVATAR_WIDTH_HEIGHT,
                                            height: Constants.AVATAR_WIDTH_HEIGHT
                                        }}
                                        resizeModeType={"cover"}
                                        path={source}
                                    />
                                </TouchableOpacity>
                                <View
                                    style={[
                                        commonStyles.viewCenter,
                                        {
                                            flex: 1,
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            position: "absolute",
                                            width: "100%",
                                            height: "50%",
                                            bottom: 8,
                                            left: 36,
                                            padding: Constants.PADDING
                                        }
                                    ]}
                                >
                                    <TouchableOpacity style={{ overflow: "hidden" }} activeOpacity={Constants.ACTIVE_OPACITY} onPress={this.attachFile}>
                                        <Image source={ic_image_white} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View
                            style={{
                                backgroundColor: Colors.COLOR_WHITE,
                                marginTop: Constants.MARGIN_X_LARGE
                            }}
                        >
                            {/* Full name */}
                            <TextInputCustom
                                title={localizes("userInfoView.fullName")}
                                inputNormalStyle={{
                                    paddingVertical: Constants.PADDING_LARGE
                                }}
                                refInput={input => (this.fullName = input)}
                                isInputNormal={true}
                                placeholder={localizes("userInfoView.fillFullName")}
                                value={this.state.fullName}
                                onChangeText={fullName => this.setState({ fullName })}
                                onSubmitEditing={() => {
                                    this.email.focus();
                                }}
                                returnKeyType={"next"}
                                {...(this.focusInput(this.state.fullName) ? { autoFocus: true } : null)}
                            />
                            {/* Email */}
                            <TextInputCustom
                                title={localizes("userInfoView.email")}
                                inputNormalStyle={{
                                    paddingVertical: Constants.PADDING_LARGE
                                }}
                                refInput={input => (this.email = input)}
                                isInputNormal={true}
                                placeholder={localizes("userInfoView.fillEmail")}
                                value={this.state.email}
                                onChangeText={email => this.setState({ email })}
                                onSubmitEditing={() => {
                                    this.email.focus();
                                }}
                                returnKeyType={"next"}
                                {...(this.focusInput(this.state.email) ? { autoFocus: true } : null)}
                            />
                            {/*PhoneNumber*/}
                            <TextInputCustom
                                title={localizes("userInfoView.phone")}
                                inputNormalStyle={{
                                    paddingVertical: Constants.PADDING_LARGE
                                }}
                                refInput={input => {
                                    this.phone = input;
                                }}
                                isInputNormal={true}
                                placeholder={localizes("userInfoView.fillPhone")}
                                value={this.state.phone}
                                onChangeText={phone =>
                                    this.setState({
                                        phone: phone
                                    })
                                }
                                onSubmitEditing={() => {
                                    this.email.focus();
                                }}
                                keyboardType="phone-pad"
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                numberOfLines={1}
                                editable={false}
                            />
                            {/*Address*/}
                            <TextInputCustom
                                title={localizes("userInfoView.address")}
                                inputNormalStyle={{
                                    paddingVertical: Constants.PADDING_LARGE
                                }}
                                refInput={input => {
                                    this.address = input;
                                }}
                                isInputNormal={true}
                                placeholder={localizes("userInfoView.fillAddress")}
                                value={this.state.address}
                                onChangeText={address => this.setState({ address })}
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                numberOfLines={1}
                            />
                            {this.renderAddress}
                            {/* Day Of Birth */}
                            <View
                                style={{
                                    justifyContent: "center",
                                    position: "relative"
                                }}
                            >
                                <Text style={{
                                    fontSize: Fonts.FONT_SIZE_X_SMALL,
                                    marginLeft: Constants.MARGIN_X_LARGE,
                                    marginTop: Constants.MARGIN_12,
                                    color: Colors.COLOR_TEXT,
                                    marginBottom: 0
                                }}>{localizes("register.dayOfBirth")}</Text>
                                <TextInputMask
                                    style={{
                                        color: Colors.COLOR_TEXT,
                                        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
                                        height: 46,
                                        width: "100%",
                                        marginHorizontal: Constants.MARGIN_LARGE + 4
                                    }}
                                    ref={input => (this.dayOfBirth = input)}

                                    placeholder={localizes("userInfoView.dayOfBirth")}
                                    value={this.state.dayOfBirth}
                                    onChangeText={dayOfBirth => this.setState({ dayOfBirth })}
                                    keyboardType="phone-pad"
                                    returnKeyType={"next"}
                                    blurOnSubmit={false} //focus textinput
                                    onFocus={() => this.showCalendarDate()}
                                    // hrEnable={false}
                                    type={'datetime'}
                                    options={{
                                        format: 'DD/MM/YYYY'
                                    }}
                                />
                                <TouchableHighlight
                                    onPress={() => this.showCalendarDate()}
                                    style={[
                                        commonStyles.shadowOffset,
                                        {
                                            position: "absolute",
                                            padding: Constants.PADDING_LARGE,
                                            right: Constants.PADDING_LARGE,
                                            paddingTop: Constants.PADDING_XX_LARGE + Constants.PADDING
                                        }
                                    ]}
                                    underlayColor="transparent"
                                >
                                    <Image
                                        style={{
                                            flex: 1,
                                            flexDirection: "column",
                                            justifyContent: "flex-end",
                                            resizeMode: "contain"
                                        }}
                                        source={ic_calendar_grey}
                                    />
                                </TouchableHighlight>
                            </View>
                        </View>
                        <View style={{ flex: 1, justifyContent: "flex-end" }}>
                            {this.renderCommonButton(
                                localizes("userInfoView.buttonEdit"),
                                { color: Colors.COLOR_WHITE },
                                {
                                    marginVertical: Constants.MARGIN_X_LARGE,
                                    backgroundColor: Colors.COLOR_PRIMARY,
                                    marginHorizontal: Constants.MARGIN_X_LARGE
                                },
                                () => this.validate()
                            )}
                        </View>
                    </Content>
                    {this.renderFileSelectionDialog()}
                    {this.renderAlertSuccess()}
                    {this.renderInvalidEmail()}
                    <CalendarScreen
                        maximumDate={new Date(new Date().setDate(DateUtil.now().getDate() - 1))}
                        dateCurrent={DateUtil.convertFromFormatToFormat(this.userInfo.birthDate, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE_TIME_ZONE_T)}
                        chooseDate={this.chooseDate.bind(this)}
                        ref={ref => (this.showCalendar = ref)}
                    />
                    {this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    /**
     * Attach file
     */
    attachFile = () => {
        this.showDialog();
    };

    /**
     * Show dialog
     */
    showDialog() {
        this.setState({
            visibleDialog: true
        });
    }

    /**
     * hide dialog
     */
    hideDialog() {
        this.setState({
            visibleDialog: false
        });
    }

    /**
     * Called when selected type
     * @param {*} index
     */
    onSelectedType(index) {
        if (index !== CANCEL_INDEX) {
            if (index === 0) {
                this.takePhoto();
            } else if (index === 1) {
                this.showDocumentPicker();
            }
        } else {
            this.hideDialog();
        }
    }

    /**
     * Take a photo
     */

    takePhoto = async () => {

        const hasCameraPermission = await this.hasPermission(PermissionsAndroid.PERMISSIONS.CAMERA);

        if (!hasCameraPermission) return;

        ImagePicker.launchCamera(optionsCamera, response => {
            const { error, uri, originalRotation, didCancel } = response;
            this.hideDialog();
            console.log("CHỤP XONG RỒI");
            if (uri && !error) {
                let rotation = this.rotateImage(originalRotation);
                console.log("CHỤP XONG RỒI VÀO ĐÂY + URI: ", uri);
                ImageResizer.createResizedImage(uri, 800, 600, "JPEG", 80, rotation)
                    .then(({ uri }) => {
                        let uriReplace = uri;
                        if (Platform.OS == "android") {
                            uriReplace = uri.replace("file://", "");
                        }
                        let file = {
                            fileType: "image/*",
                            filePath: uriReplace
                        };
                        console.log("URI: ", file.filePath);
                        const options = {
                            url: ServerPath.API_URL + "user/upload/avatar",
                            path: file.filePath,
                            method: "POST",
                            field: "file",
                            type: "multipart",
                            headers: {
                                "Content-Type": "application/json", // Customize content-type
                                "X-APITOKEN": global.token
                            }
                        };
                        Upload.startUpload(options)
                            .then(uploadId => {
                                console.log("Upload started");
                                Upload.addListener("progress", uploadId, data => {
                                    console.log(`Progress: ${data.progress}%`);
                                });
                                Upload.addListener("error", uploadId, data => {
                                    console.log(`Error: ${data.error}%`);
                                });
                                Upload.addListener("cancelled", uploadId, data => {
                                    console.log(`Cancelled!`);
                                });
                                Upload.addListener("completed", uploadId, data => {
                                    // data includes responseCode: number and responseBody: Object
                                    console.log("Completed!");
                                    if (!Utils.isNull(data.responseBody)) {
                                        let result = JSON.parse(data.responseBody);
                                        if (!Utils.isNull(result.data)) {
                                            this.setState({
                                                source: this.resourceUrlPathResizeValue + "=" + result.data
                                            });
                                        }
                                    }
                                });
                            })
                            .catch(error => {
                                this.saveException(error, "takePhoto");
                            });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            } else if (error) {
                console.log("The photo picker errored. Check ImagePicker.launchCamera func");
                console.log(error);
            }
        });
    };

    /**
     * Rotate image
     */
    rotateImage(orientation) {
        let degRotation;
        switch (orientation) {
            case 90:
                degRotation = 90;
                break;
            case 270:
                degRotation = -90;
                break;
            case 180:
                degRotation = 180;
                break;
            default:
                degRotation = 0;
        }
        return degRotation;
    }

    /**
     * Show document picker
     */
    showDocumentPicker = async fileType => {

        const hasCameraPermission = await this.hasPermission(PermissionsAndroid.PERMISSIONS.CAMERA);

        if (!hasCameraPermission) return;

        ImagePicker.launchImageLibrary(optionsCamera, response => {
            const { error, uri, originalRotation, didCancel } = response;
            this.hideDialog();
            if (uri && !error) {
                let rotation = 0;
                ImageResizer.createResizedImage(uri, 800, 600, "JPEG", 80, rotation).
                    then(({ uri }) => {
                        let uriReplace = uri;
                        if (Platform.OS == "android") {
                            uriReplace = uri.replace('file://', '');
                        };
                        let file = {
                            fileType: "image/*",
                            filePath: uriReplace
                        };
                        console.log("URI: ", file.filePath);
                        const options = {
                            url: ServerPath.API_URL + "user/upload/avatar",
                            path: file.filePath,
                            method: "POST",
                            field: "file",
                            type: "multipart",
                            headers: {
                                "Content-Type": "application/json", // Customize content-type
                                "X-APITOKEN": global.token
                            }
                        };
                        Upload.startUpload(options)
                            .then(uploadId => {
                                console.log("Upload started");
                                Upload.addListener("progress", uploadId, data => {
                                    console.log(`Progress: ${data.progress}%`);
                                });
                                Upload.addListener("error", uploadId, data => {
                                    console.log(`Error: ${data.error}%`);
                                });
                                Upload.addListener("cancelled", uploadId, data => {
                                    console.log(`Cancelled!`);
                                });
                                Upload.addListener("completed", uploadId, data => {
                                    // data includes responseCode: number and responseBody: Object
                                    console.log("Completed!");
                                    if (!Utils.isNull(data.responseBody)) {
                                        let result = JSON.parse(data.responseBody);
                                        console.log(
                                            "Hello!" + this.resourceUrlPathResizeValue + "=" + result.data
                                        );
                                        if (!Utils.isNull(result.data)) {
                                            this.setState({
                                                source: this.resourceUrlPathResizeValue + "=" + result.data
                                            });
                                        }
                                    }
                                });
                            })
                            .catch(error => {
                                this.saveException(error, "showDocumentPicker");
                            });
                    }).catch(err => {
                        console.log(err)
                    })
            } else if (error) {
                console.log("The photo picker errored. Check ImagePicker.launchCamera func")
                console.log(error)
            }
        });
    };

    /**
     * Date press
     */
    chooseDate(day) {
        this.setState({
            dayOfBirth: DateUtil.convertFromFormatToFormat(day, DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_DATE)
        });
    }

    /**
     * edit data & validation
     */
    onEditData = () => {
        const { phone, fullName, dayOfBirth, address, email } = this.state;
        if (Utils.isNull(fullName)) {
            this.showMessage(localizes("register.vali_fill_fullname"));
        } else if (Utils.isNull(dayOfBirth)) {
            this.showMessage(localizes("register.vali_fill_dayOfBirth"));
        } else if (!Utils.validateDate(dayOfBirth)) {
            this.showMessage(localizes("register.vali_dayOfBirth"));
        }
        else {
            let editData = {
                name: fullName.trim(),
                phone: phone,
                birthDate: DateUtil.convertFromFormatToFormat(moment(dayOfBirth, "DD-MM-YYYY").add(1, "days"), DateUtil.FORMAT_DATE, DateUtil.FORMAT_DATE_TIME_ZONE),
                address: address,
                email: !Utils.isNull(email) ? email.toLowerCase() : email
            };
            this.props.editProfile(editData);
            console.log('User\'s data upload: ', editData)
        }
    };

    /**
     * choose gender
     */
    onGenderChange(value) {
        this.setState({
            gender: value
        });
    }

    /**
     * Render file selection dialog
     */
    renderFileSelectionDialog() {
        return (
            <DialogCustom
                visible={this.state.visibleDialog}
                isVisibleTitle={true}
                isVisibleContentForChooseImg={true}
                contentTitle={localizes("userInfoView.chooseImages")}
                onTouchOutside={() => {
                    this.setState({ visibleDialog: false });
                }}
                onPressX={() => {
                    this.setState({ visibleDialog: false });
                }}
                onPressCamera={() => {
                    this.onSelectedType(0);
                }}
                onPressGallery={() => {
                    this.onSelectedType(1);
                }}
            />
        );
    }

    /**
     * Render alert add address success
     */
    renderAlertSuccess() {
        return (
            <DialogCustom
                visible={this.state.isAlertSuccess}
                isVisibleTitle={true}
                isVisibleOneButton={true}
                isVisibleContentText={true}
                contentTitle={localizes("notificationView.notification")}
                textBtn={localizes("yes")}
                contentText={localizes("userInfoView.saveSucsess")}
                onPressBtn={() => {
                    this.setState({ isAlertSuccess: false });
                    this.onBack();
                    this.callBack();
                }}
            />
        );
    }

    /**
     * render dialog when user type incorect email fomart
     */
    renderInvalidEmail() {
        return (
            <DialogCustom
                visible={this.state.isInvalidEmail}
                isVisibleTitle={true}
                isVisibleOneButton={true}
                isVisibleContentText={true}
                contentTitle={localizes("notification")}
                textBtn={localizes("yes")}
                contentText={localizes("forgot_password.invalidEmail")}
                onPressBtn={() => {
                    this.setState({ isInvalidEmail: false });
                }}
            />
        );
    }

    /**
     * validate
     */

    validate() {
        const { fullName, email, phone, address } = this.state;

        const res = phone.charAt(0);
        if (Utils.isNull(fullName) || Utils.isNull(fullName.trim())) {
            this.showMessage(localizes("register.vali_fill_fullname"));
        }
        else if (Utils.validateSpaces(fullName.trim())) {
            this.showMessage(localizes("register.vali_fill_fullname"));
        }
        // if (Utils.isNull(fullName) || Utils.validateSpaces(fullName)) {
        //     this.showMessage(localizes("register.vali_fill_fullname"));
        // } else if (StringUtil.validSpecialCharacter(fullName)) {
        //     this.showMessage(localizes("register.vali_fullname"));
        // } 
        else if (fullName.length > 50) {
            this.showMessage(localizes("register.vali_fullname_length"));
        } else if (!Utils.isNull(email) && !Utils.validateEmail(email)) {
            this.showMessage(localizes("register.vali_email"));
        } else if (Utils.isNull(phone)) {
            this.showMessage(localizes("register.vali_fill_phone"));
        } else if (phone.length != 10 || res != "0") {
            this.showMessage(localizes("register.errorPhone"));
        } else if (!Utils.validatePhone(phone)) {
            this.showMessage(localizes("register.vali_phone"));
        }
        // else if (!Utils.isNull(email) && !Utils.validateEmail(email)) {
        //     this.showMessage(localizes("register.vali_email"));
        // }
        // else if (Utils.isNull(address)) {
        //   this.showMessage(localizes("userInfoView.fillAddress"));
        // }
        else {
            this.onEditData();
        }
    }
}

const mapStateToProps = state => ({
    data: state.userProfile.data,
    action: state.userProfile.action,
    isLoading: state.userProfile.isLoading,
    error: state.userProfile.error,
    errorCode: state.userProfile.errorCode
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserInfoView);
