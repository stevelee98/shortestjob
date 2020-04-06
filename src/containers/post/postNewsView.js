import React, { Component } from "react";
import {
    ImageBackground, View, StatusBar, Image, TouchableOpacity, BackHandler, Alert,
    WebView, Linking, StyleSheet, TextInput, Dimensions, ScrollView, Keyboard, Platform,
    Modal, PermissionsAndroid
} from "react-native";
import {
    Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text,
    Card, CardItem, Item, Input, Toast, Root, Col, Form
} from "native-base";
import BaseView from "containers/base/baseView";
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import Utils from 'utils/utils'
import * as actions from 'actions/vehicleAction'
import * as commonActions from 'actions/commonActions'
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation'
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import DateUtil from "utils/dateUtil";
import ic_intro from "images/ic_intro.png";
import styles from "./styles";
import ModalDropdown from 'components/dropdown';
import I18n, { localizes } from "locales/i18n";
import { Fonts } from "values/fonts";
import FlatListCustom from 'components/flatListCustom'
import cleaningAndWashingType from "enum/cleaningAndWashingType";
import ServiceType from "enum/serviceType";
import StringUtil from "utils/stringUtil";
import { filter } from "rxjs/operators";
import subServiceType from "enum/subServiceType";
import serviceType from "enum/serviceType";
import moment from 'moment';
import GridView from 'components/gridView';
import { CalendarScreen } from "components/calendarScreen";
import SubServiceType from "enum/subServiceType";
import ScreenType from "enum/screenType";
import vehicleType from "enum/vehicleType";
// import ic_back_white from 'images/ic_back_white.png';
import ic_send_image from 'images/ic_send_image.png';
import ic_camera_blue from 'images/ic_camera_blue.png';
import areaType from "enum/areaType";
import ImagePicker from 'react-native-image-crop-picker';
import ImageCameraPicker from "react-native-image-picker";
import ServerPath from "config/Server";
import Upload from 'lib/react-native-background-upload';
import DialogCustom from "components/dialogCustom";
import TextInputCustom from "components/textInputCustom";
import { TextInputMask } from 'react-native-masked-text';
import StorageUtil from "utils/storageUtil";
import * as Progress from 'react-native-progress';
import ItemImage from "containers/sellingVehicle/items/itemImage";
import SellingVehicleResourceKind from "enum/sellingVehicleResourceKind";
import { colors } from "react-native-elements";
import Hr from "components/hr";
import screenType from "enum/screenType";
import { thisExpression } from "@babel/types";
import HTML from 'react-native-render-html';
import statusType from 'enum/statusType';
import approvalStatusType from 'enum/approvalStatusType';
import ImageResizer from "react-native-image-resizer";
import globalUtil from 'utils/global';

const screen = Dimensions.get("window");
const width = Dimensions.get('window').width
const height = Dimensions.get('window').height
const CANCEL_INDEX = 2;

var HEIGHT_IMAGES = width * 0.4
let typeImage = {
    IMAGE_CAR: 0,
    REGISTER_CAR: 1
}
let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
const optionsCamera = {
    title: "Select avatar",
    storageOptions: {
        skipBackup: true,
        path: "images"
    }
};

class PostNewsView extends BaseView {

    constructor(props) {
        super(props)

        const { screenType, vehicleId, urlPathResource } = this.props.navigation.state.params;
        this.state = {
            refreshing: false,
            enableRefresh: true,
            visibleDialog: false,
            id: null,
            title: null,
            description: null,
            price: null,
            province: null,
            provinceId: null,
            category: null,
            categoryId: null,
            imagesProduct: [],

            manufacturer: null,
            manufacturerId: null,
            carLife: null,
            modelCarId: null,
            imagesRegisterCar: [{ image: "front.jpg" }, { image: 'backSize.jpg' }],
            itemImageRegisterCarBackside: null,
            isUploading: false,
            isDisableButton: false,
            progress: 0,
            isAlertSuccess: false,
            isUpdate: false,
            isWantEdit: false,

            validateTitle: null,
            validatePrice: null,
            validateCategory: null,
            validateProvince: null,
            validateDes: null,
            validateImages: null,
            approvalStatus: null,
            isAlertExit: false,
            sellingStatus: null,
            parentCategory: {
                id: null,
                name: null
            }
        }
        this.htmlDespritons = null
        this.vehicleId = vehicleId;
        this.urlPathResource = urlPathResource;
        this.NUMBER_OF_LINES = 2
        this.maximumImages = 10
        this.maximumLengthTitle = 100
        this.imagesTemp = []
        this.imageRegisterCar = []
        this.userInfo = null
        this.indexVehicleImage = 0
        this.indexVehicleCavetImage = 0
        this.oneMB = 1048576
        this.screenType = screenType
        this.imageDelete = []
        this.imagesUpload = []
        this.imagesProductTemp = []
        this.entries = [
            {
                title: "hello",
                pathToResource: ""
            }
        ]
    }

    formatBytes(bytes, decimals) {
        if (bytes == 0) return '0 Bytes';
        var k = 1024,
            dm = decimals <= 0 ? 0 : decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return console.log(parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i])
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.screenType = this.props.navigation.state.params.screenType;
        const deviceLocale = I18n.locale
        this.cashType = this.state.language == 0 ? ',' : '.'; //if vietnam 1,000.us 1.000
        this.getSourceUrlPath()
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            //this callback is executed when your Promise is resolved
            console.log("user", user);
            if (!Utils.isNull(user)) {
                this.userInfo = user;
            } else {
                console.log("POST SELLING VEHICLE HAVE NOT USER");
            }
        }).catch(error => {
            this.saveException(error, 'componentWillMount')
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    componentDidMount() {
        super.componentDidMount();
        if (this.screenType == ScreenType.FROM_SELLING_VEHICLE_DETAIL) {
            this.props.getSellingVehicleDetail(this.vehicleId);
        }
        // this.getProfile();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton)
    }

    /**
     * Validate data
     */
    validateData() {
        const { provinceId, price, imagesProduct, categoryId, description, title } = this.state
        if (Utils.isNull(title) || Utils.validateSpaces(!Utils.isNull(title) ? title.trim() : title)) {
            this.setState({ validateTitle: localizes('postNewView.enterTitle') })
            this.title.focus()
            return false
        } else if (title.length > this.maximumLengthTitle) {
            this.setState({ validateTitle: localizes('postNewView.errTitle') })
            this.title.focus()
            return false
        } else if (Utils.isNull(price) || price == 0) {
            this.setState({ validatePrice: localizes('postNewView.enterPrice') })
            this.price.getElement().focus()
            return false
        } else if (price.replace(/[.]+/g, '') > 100000000000) {
            this.setState({ validatePrice: localizes('postNewView.maxPrice') })
            this.price.getElement().focus()
            return false
        } else if (Utils.isNull(categoryId)) {
            this.setState({ validateCategory: localizes('postNewView.enterCategory') })
            return false
        } else if (Utils.isNull(provinceId)) {
            this.setState({ validateProvince: localizes('postNewView.enterProvince') })
            return false
        } else if (Utils.isNull(description)) {
            this.setState({ validateDes: localizes('postNewView.enterDescription') })
            return false
        } else if (description.split(" ").length < 10) {
            this.setState({ validateDes: localizes('postNewView.enterDescriptionAtLeast') })
            return false
        } else if (description.charAt(0) == " ") {
            this.setState({ validateDes: localizes('postNewView.desStartWithSpace') })
            return false
        } else if (imagesProduct.length <= 0) {
            this.setState({ validateImages: localizes('postNewView.enterImagesCar') })
            return false
        } else if (imagesProduct.length > this.maximumImages) {
            this.setState({ validateImages: localizes('postNewView.errMaxImages') })
            return false
        } else {
            this.setState({
                validateTitle: null,
                validatePrice: null,
                validateCategory: null,
                validateProvince: null,
                validateDes: null,
                validateImages: null
            })
            return true
        }
    }

    /**
      * Handle data when request
      */
    handleData() {
        let data = this.props.data
        console.log("DATA UPDATED: ", data);
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.POST_NEWS_SELLING_VEHICLE)) {
                    if (!Utils.isNull(data)) {
                        globalUtil.idChoose = 0;
                        globalUtil.idGeneralChoose = 0;
                        this.imagesUpload = this.state.imagesProduct
                        this.setState({
                            isUploading: true
                        })
                        this.uploadVehicleImages(data.id)
                    } else {
                        this.showMessage(localizes('postNewView.messSamePost'))
                        this.setState({
                            isDisableButton: false
                        })
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_SELLING_VEHICLE_DETAIL)) {
                    console.log("GET_SELLING_VEHICLE_DETAIL", data)
                    if (!Utils.isNull(data)) {
                        if (!Utils.isNull(data.listImage)) {
                            this.imagesTemp = data.listImage;
                            this.imagesTemp.forEach(item => {
                                item.pathToResource = item.pathToResource.indexOf("http") != -1 ? item.pathToResource : this.urlPathResource + "=" + item.pathToResource;
                            });
                            if (this.imagesTemp.length == 0) {
                                this.imagesTemp = this.entries;
                            }
                        }
                        for (i = 0; i < this.imagesTemp.length; i++) {
                            this.imagesProductTemp[i] = { id: this.imagesTemp[i].id, image: this.imagesTemp[i].pathToResource + `&op=resize&w=300` }
                        }

                        this.state.id = data.id
                        this.state.price = String(data.price).toString()
                        this.state.title = data.name
                        this.state.description = data.description
                        this.state.province = data.province
                        this.state.provinceId = data.provinceId
                        this.state.sellingStatus = data.status
                        this.state.approvalStatus = data.approvalStatus
                        this.state.category = data.category
                        this.state.categoryId = data.categoriesId
                        this.state.imagesProduct = this.imagesProductTemp
                    }
                    else {
                        this.showMessage(localizes('postNewView.messTakeItem'))
                        this.setState({
                            isDisableButton: false
                        })
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.UPDATE_SELLING_VEHICLE)) {
                    if (!Utils.isNull(data)) {
                        globalUtil.idChoose = 0;
                        globalUtil.idGeneralChoose = 0;
                        if (this.imagesUpload.length !== 0) {
                            this.setState({
                                isUpdate: true,
                            })
                            this.setState({
                                isUpload: true,
                            })
                            this.uploadVehicleImages(data.id)
                        } else {
                            this.setState({
                                isUpload: false,
                                isUpdate: false,
                                isAlertSuccess: true,
                            })
                        }
                    }
                    else {
                        this.showMessage(localizes('postNewView.messSamePost'))
                        this.setState({
                            isDisableButton: false,
                            isUpdate: false
                        })
                    }

                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    /**
        * Render children
        */
    renderChildren = (node) => {
        if (node.name == "iframe") {
            node.attribs.width = screen.width - Constants.MARGIN_X_LARGE
        }
    }


    //onRefreshing
    handleRefresh = () => {
        this.setState({
            refreshing: false
        });
        this.props.getSellingVehicleDetail(this.vehicleId);
    };


    /**
     * Upload image vehicle
     * @param {*} sellingVehicleId 
     */
    uploadVehicleImages(sellingVehicleId) {
        console.log("INDEX: ", this.indexVehicleImage)
        let kind = SellingVehicleResourceKind.VEHICLE_RESOURCE
        console.log("SIZE IMAGES UPLOAD: ", this.imagesUpload)
        if (this.imagesUpload.length === 0) {
            this.setState({
                isUpload: false,
                isUploading: false,
                isAlertSuccess: true
            })
        } else {
            let filePathUrl = this.imagesUpload[this.indexVehicleImage];
            let path = filePathUrl.image;
            if (Platform.OS == "android") {
                path = filePathUrl.image.replace('file://', '');
            } else {
                path = Utils.convertLocalIdentifierIOSToAssetLibrary(filePathUrl.image, true);
            }
            const options = {
                url: ServerPath.API_URL + `vehicle/${sellingVehicleId}/resource/${kind}/upload`,
                path: path,
                method: 'POST',
                field: 'file',
                type: 'multipart',
                headers: {
                    'Content-Type': 'application/json', // Customize content-type
                    'X-APITOKEN': global.token
                },
                notification: {
                    enabled: true,
                    onProgressTitle: "Vehicle Images Uploading...",
                    autoClear: true
                }
            }
            this.processUploadVehicleImage(options, sellingVehicleId)
        }
    }

    /**
     * Process upload image
     * @param {*} options 
     */
    processUploadVehicleImage(options, sellingVehicleId) {
        Upload.startUpload(options).then((uploadId) => {
            console.log('Upload started')
            Upload.addListener('progress', uploadId, (data) => {
                console.log(`Progress: ${data.progress}%`)
                this.setState({
                    progress: data.progress / 100
                })
            })
            Upload.addListener('error', uploadId, (data) => {
                console.log(`Error: ${data.error}%`)
                this.showMessage(localizes('uploadImageError'))
            })
            Upload.addListener('cancelled', uploadId, (data) => {
                console.log(`Cancelled!`)
            })
            Upload.addListener('completed', uploadId, (data) => {
                console.log(`completed!`)
                if (this.indexVehicleImage < this.imagesUpload.length - 1) {
                    this.indexVehicleImage++
                    const timeOut = setTimeout(() => {
                        this.uploadVehicleImages(sellingVehicleId)
                    }, 200);
                } else {
                    this.setState({
                        isUploading: false,
                        isUpdate: false,
                        isAlertSuccess: true
                    })
                    console.log('Completed upload vehicle images!')
                    // let categories = [];
                    // categories.push(this.state.categoryId);
                    // let filter = {
                    //     id: this.state.id,
                    //     price: this.state.price.trim().split(".").join(""),
                    //     title: this.state.title,
                    //     description: this.state.description,
                    //     categories: categories,
                    //     provinceId: this.state.provinceId,
                    //     imagesDelete: this.imageDelete
                    // };
                    // this.props.updateSellingVehicle(filter)

                }
            })
        }).catch((err) => {
            this.saveException(err, 'processUploadVehicleImage')
            this.setState({
                isDisableButton: false
            })
        })
    }

    /**
     *  ask user want to edit post ?
     */
    areYouWantEditThisPost = () => {
        const { sellingStatus, approvalStatus } = this.state
        let content = (sellingStatus == statusType.ACTIVE && approvalStatus == approvalStatusType.APPROVED) ?
            localizes("postNewView.editInApprove")
            : (sellingStatus == statusType.DRAFT && approvalStatus == approvalStatusType.WAITING_FOR_APPROVAL) ?
                localizes("postNewView.editInWaiting")
                : localizes("postNewView.editInReject")
        return (
            <DialogCustom
                visible={this.state.isWantEdit}
                isVisibleTitle={true}
                contentTitle={localizes("confirm")}
                onPress={true}
                isVisibleTwoButton={true}
                textBtnOne={localizes("cancel")}
                textBtnTwo={localizes("yes")}
                styleTextBtnTwo={{ fontSize: Fonts.FONT_SIZE_MEDIUM }}
                styleTextBtnOne={{ fontSize: Fonts.FONT_SIZE_MEDIUM }}
                isVisibleContentText={true}
                contentText={content}

                onTouchOutside={() => {
                    this.setState({ isWantEdit: false })
                }}
                onPressX={() => {
                    this.setState({ isWantEdit: false })
                }}
                onPressBtnPositive={() => {
                    this.setState({
                        isWantEdit: false
                    });
                    this.onPressSendPost()
                }}
                onPressBtnOne={
                    () => this.setState({ isWantEdit: false })
                }
            />
        )
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
     * Layout upload file images success
     */
    renderUploadSuccess = () => {
        return (
            <DialogCustom
                visible={this.state.isAlertSuccess}
                isVisibleOneButton={true}
                isVisibleContentText={true}
                textBtn={localizes('yes')}
                contentText={this.screenType === ScreenType.FROM_HOME_VIEW ? localizes('postNewView.postNewsSuccess') : localizes('postNewView.editSuccess')}
                onPressBtn={() => {
                    this.setState({
                        isDisableButton: false,
                        isAlertSuccess: false
                    })
                    this.imageRegisterCar = []
                    this.props.navigation.goBack();
                }}
                onTouchOutside={() => {
                    this.props.navigation.goBack();
                }}
            />
        )
    }

    /**
     * Render progress upload image
     */
    renderProgressUpload = (isUploading) => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={isUploading}
                onRequestClose={() => {
                }}>
                <View style={[commonStyles.viewCenter, {
                    flex: 1
                }]} >
                    <View style={[commonStyles.viewCenter, {
                        width: width * 0.7,
                        height: height * 0.1,
                        backgroundColor: Colors.COLOR_WHITE,
                        borderRadius: Constants.CORNER_RADIUS
                    }]} >
                        <Text style={[commonStyles.textSmall]} >{localizes('postNewView.uploadingPicture')}</Text>
                        <Progress.Bar
                            style={{
                                width: width * 0.5
                            }}
                            borderColor={Colors.COLOR_PRIMARY}
                            borderWidth={1}
                            color={Colors.COLOR_PRIMARY}
                            progress={this.state.progress} />
                    </View>
                </View>
            </Modal>
        )
    }


    /**
     * Render item row
     */
    renderItemImage(item, index, parentIndex, indexInParent) {
        return (
            <ItemImage
                array={this.state.imagesProduct}
                item={item}
                index={index}
                parentIndex={parentIndex}
                indexInParent={indexInParent}
                onPressX={(itemImage) => {
                    let imagesTemps = this.state.imagesProduct
                    var index = imagesTemps.indexOf(itemImage)
                    imagesTemps.splice(index, 1);
                    if (itemImage.image.indexOf("http") === 0) {
                        this.imageDelete.push(itemImage.id);
                    }
                    this.setState({
                        imagesProduct: imagesTemps,
                        validateImages: imagesTemps.length <= 10 ? null : this.state.validateImages
                    })
                }}
            />
        )
    }

    /*
     * Send a post
     */
    onPressSendPost() {
        const code = StringUtil.randomString(5, chars)
        if (this.screenType === ScreenType.FROM_HOME_VIEW) {
            if (this.validateData()) {
                this.setState({
                    isDisableButton: true,
                })
                let categories = []
                categories.push(this.state.categoryId)
                let filter = {
                    "code": code,
                    "price": this.state.price.trim().split('.').join(""),
                    "title": this.state.title,
                    "provinceId": this.state.provinceId,
                    "description": this.state.description,
                    "categories": categories
                }
                console.log("FILTER UPLOAD NEW POST: ", filter)
                this.props.postNewsSellingVehicle(filter)
            }
        } else {
            if (this.validateData()) {
                const { imagesProduct } = this.state
                this.setState({
                    isDisableButton: true,
                    isUpdate: true,
                });
                let categories = [];
                categories.push(this.state.categoryId);
                let filter = {
                    id: this.state.id,
                    price: this.state.price.trim().split(".").join(""),
                    title: this.state.title,
                    description: this.state.description,
                    categories: categories,
                    provinceId: this.state.provinceId,
                    imagesDelete: this.imageDelete
                };
                for (i = 0; i < imagesProduct.length; i++) {
                    if (imagesProduct[i].image.indexOf("http") !== 0) {
                        this.imagesUpload.push({ image: imagesProduct[i].image });
                    }
                }
                this.props.updateSellingVehicle(filter)
            }
        }
    }

    /**
     * Choose a province: 
     */
    gotoProvince = () => {
        this.props.navigation.navigate("CategoryGeneral", {
            onChangeValue: this.onChangeValueProvince,
            type: areaType.WARD_STRING,
            screen: screenType.FROM_SELLING_MY_POST_NEW
        })
    }

    /**
     * Change value province
     */
    onChangeValueProvince = (provinceId, provinceName) => {
        this.setState({
            province: provinceName,
            provinceId,
            validateProvince: null
        })
    }

    /**
     * Go to category
     */
    gotoCategory = () => {
        this.props.navigation.navigate("ProductCategory", {
            callBack: this.onChangeCategory,
            gotoBack: null,
            parentCategory: this.state.parentCategory,
            sttRequest: 1,
            screen: screenType.FROM_SELLING_MY_POST_NEW
        })
    }

    /**
     * Change text category
     */
    onChangeCategory = (categoryId, category, parentCategory) => {
        this.setState({
            categoryId,
            category,
            validateCategory: null,
            parentCategory
        })
    }

    /**
     * Change value car life
     */
    onChangeCarLife = (modelCarId, carLife) => {
        this.setState({ modelCarId, carLife })
    }

    /**
     * Handler back button
     */
    handlerBackButton() {
        console.log(this.className, 'back pressed')
        if (this.props.navigation) {
            this.onBack()
        } else {
            return false
        }
        return true
    }

    /**
     * On back
     */
    onBack() {
        const { provinceId, price, imagesProduct, categoryId, description, title } = this.state
        if (Utils.isNull(title) && Utils.isNull(price) && Utils.isNull(categoryId) && Utils.isNull(provinceId) && Utils.isNull(description) && Utils.isNull(imagesProduct)) {
            console.log('1')
            if (this.props.navigation) {
                this.props.navigation.goBack()
                globalUtil.idChoose = 0;
                globalUtil.idGeneralChoose = 0;
            }
        } else {
            console.log('2')
            this.setState({ isAlertExit: true })
            globalUtil.idChoose = 0;
            globalUtil.idGeneralChoose = 0;
        }
    }

    /**
     * Render alert Exit App
     */
    renderAlertExit() {
        return (
            <DialogCustom
                visible={this.state.isAlertExit}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={"Thông báo"}
                textBtnOne={"Không, cảm ơn"}
                textBtnTwo={"Thoát"}
                contentText={"Bạn có chắc muốn dừng đăng bài?"}
                onTouchOutside={() => { this.setState({ isAlertExit: false }) }}
                onPressX={() => { this.setState({ isAlertExit: false }) }}
                onPressBtnPositive={() => {
                    this.props.navigation.goBack(),
                        this.setState({ isAlertExit: false })
                }}
            />
        )
    }

    /**
     * Attach file
     */
    attachFile = () => {
        console.log('kkkk')
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
                console.log('CHUP HINH')
                this.hideDialog();
            } else if (index === 1) {
                // this.showDocumentPicker();
                this.onChooseImageSelling(typeImage.IMAGE_CAR)
                this.hideDialog();
            }
        } else {
            this.hideDialog();
        }
    }

    /**
     * Choose image car
     * @param {*} typeImage 
     * @param {*} index // for type == typeImage.REGISTER_CAR
     */
    onChooseImageSelling(type, index) {
        const { imagesProduct } = this.state
        if (imagesProduct.length <= this.maximumImages - 1) {
            ImagePicker.openPicker({
                width: type == typeImage.IMAGE_CAR ? HEIGHT_IMAGES : HEIGHT_IMAGES * 1.5,
                height: 600,
                multiple: true,
                waitAnimationEnd: false,
                includeExif: true,
                forceJpg: true,
                mediaType: 'photo',
                compressImageQuality: 0.8
            }).then((images) => {
                console.log("images: ", images)
                this.imagesTemp = this.state.imagesProduct
                let count = 0
                let maxSizeUpload = this.maxFileSizeUpload.numericValue

                if (type == typeImage.IMAGE_CAR) {
                    images.forEach(element => {
                        console.log("element.size: ", element.size)
                        this.formatBytes(element.size);
                        if (element.size / this.oneMB > maxSizeUpload) {
                            count++
                        } else {
                            this.imagesTemp.push({
                                "image": element.path
                            })
                            if (this.imagesTemp.length > this.maximumImages) {
                                this.imagesTemp = this.imagesTemp.slice(0, this.maximumImages)
                            }
                        }
                    });
                    console.log("THIS. IMAGES TEMP: ", this.imagesTemp);
                    this.setState({
                        imagesProduct: this.imagesTemp,
                        validateImages: null
                    })
                    console.log("THIS>STATE. IMAGES PRODUCT: ", this.state.imagesProduct);
                    if (count > 0) {
                        this.showMessage("Có " + count + " ảnh lớn hơn " + maxSizeUpload + " MB")
                    }
                    count = 0
                } else {
                    if (index == 0) {
                        if (images.size / this.oneMB > maxSizeUpload) {
                            count++
                        } else {
                            this.setState({
                                itemImageRegisterCarFront: images.path,
                                validateImages: null
                            })
                        }
                    } else {
                        if (images.size / this.oneMB > maxSizeUpload) {
                            count++
                        } else {
                            this.setState({
                                itemImageRegisterCarBackside: images.path
                            })
                        }
                    }
                    if (count > 0) {
                        this.showMessage("Có " + count + " ảnh lớn hơn " + maxSizeUpload + " MB")
                    }
                    count = 0
                }
                if (imagesProduct.length > this.maximumImages) {
                    this.setState({ validateImages: localizes('postNewView.errMaxImages') })
                }
            }).catch(e => this.saveException(e, 'onChooseImageSelling'));
        }
    }

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
     * Take a photo
     */

    takePhoto = async () => {

        const hasCameraPermission = await this.hasPermission(PermissionsAndroid.PERMISSIONS.CAMERA);

        if (!hasCameraPermission) return;

        ImageCameraPicker.launchCamera(optionsCamera, response => {
            const { error, uri, originalRotation, didCancel } = response;
            this.hideDialog();
            console.log("CHỤP XONG RỒI");
            if (uri && !error) {
                let rotation = this.rotateImage(originalRotation);
                console.log("CHỤP XONG RỒI VÀO ĐÂY + URI: ", uri);
                ImageResizer.createResizedImage(uri, 800, 600, "JPEG", 80, rotation)
                    .then(({ uri }) => {
                        let uriReplace = uri;
                        this.imagesTemp = this.state.imagesProduct
                        // if (Platform.OS == "android") {
                        //     uriReplace = uri.replace("file://", "");
                        // }
                        let file = {
                            fileType: "image/*",
                            filePath: uriReplace
                        };
                        console.log("URI: ", file.filePath);

                        this.imagesTemp.push({
                            "image": file.filePath
                        })
                        if (this.imagesTemp.length > this.maximumImages) {
                            this.imagesTemp = this.imagesTemp.slice(0, this.maximumImages)
                        }
                        this.setState({
                            imagesProduct: this.imagesTemp,
                            validateImages: null
                        })
                        // const options = {
                        //     url: ServerPath.API_URL + "user/upload/avatar",
                        //     path: file.filePath,
                        //     method: "POST",
                        //     field: "file",
                        //     type: "multipart",
                        //     headers: {
                        //         "Content-Type": "application/json", // Customize content-type
                        //         "X-APITOKEN": global.token
                        //     }
                        // };
                        // Upload.startUpload(options)
                        //     .then(uploadId => {
                        //         console.log("Upload started");
                        //         Upload.addListener("progress", uploadId, data => {
                        //             console.log(`Progress: ${data.progress}%`);
                        //         });
                        //         Upload.addListener("error", uploadId, data => {
                        //             console.log(`Error: ${data.error}%`);
                        //         });
                        //         Upload.addListener("cancelled", uploadId, data => {
                        //             console.log(`Cancelled!`);
                        //         });
                        //         Upload.addListener("completed", uploadId, data => {
                        //             // data includes responseCode: number and responseBody: Object
                        //             console.log("Completed!");
                        //             if (!Utils.isNull(data.responseBody)) {
                        //                 let result = JSON.parse(data.responseBody);
                        //                 if (!Utils.isNull(result.data)) {
                        //                     this.setState({
                        //                         source: this.resourceUrlPathResizeValue + "=" + result.data
                        //                     });
                        //                 }
                        //             }
                        //         });
                        //     })
                        //     .catch(error => {
                        //         this.saveException(error, "takePhoto");
                        //     });
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

    render() {
        const { validateTitle, validatePrice, validateProvince, validateCategory, validateImages, validateDes } = this.state;
        console.log('dôdodododododo', this.state.imagesProduct)
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            visibleBack: true,
                            onBack: () => this.onBack(),
                            visibleStage: false,
                            title: this.screenType == ScreenType.FROM_HOME_VIEW ? localizes("postNewView.titleNewPost") : localizes("postNewView.titleEditPost"),
                            renderRightMenu: this.renderRightHeader
                        })}
                    </Header>
                    <Content
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1 }}
                        style={{ flex: 1 }}
                    >
                        <View style={{ flex: 1, marginTop: Constants.MARGIN_X_LARGE }}>
                            {/* Choose images */}
                            <View style={{
                                backgroundColor: Colors.COLOR_WHITE,
                                marginBottom: Constants.PADDING_X_LARGE
                            }}>
                                <Text style={[commonStyles.text, { textAlign: 'center', marginTop: Constants.MARGIN_X_LARGE, }]}>{localizes('postNewView.tenPicture')}</Text>
                                <FlatListCustom
                                    horizontal={true}
                                    style={[{
                                        marginTop: Constants.MARGIN_LARGE,
                                        backgroundColor: Colors.COLOR_TRANSPARENT
                                    }]}
                                    data={this.state.imagesProduct}
                                    renderItem={this.renderItemImage.bind(this)}
                                    enableRefresh={this.state.enableRefresh}
                                    keyExtractor={item => item.code}
                                    showsHorizontalScrollIndicator={false}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        this.attachFile()
                                        // this.onChooseImageSelling(typeImage.IMAGE_CAR)
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Constants.MARGIN_24, marginTop: Constants.PADDING_12 - Constants.DIVIDE_HEIGHT_MEDIUM, }}>
                                        <Image source={ic_camera_blue} />
                                        <Text style={{
                                            fontSize: Constants.FONT_SIZE_X_MEDIUM,
                                            color: Colors.COLOR_PRIMARY, marginLeft: Constants.MARGIN_LARGE,
                                        }}>{localizes('postNewView.titlePicture')}</Text>
                                    </View>
                                </TouchableOpacity>
                                {!Utils.isNull(validateImages) ? <Text style={{
                                    fontSize: Fonts.FONT_SIZE_X_SMALL,
                                    color: Colors.COLOR_RED,
                                    textAlign: "center",
                                    marginBottom: Constants.MARGIN_X_LARGE
                                }}>{validateImages}</Text> : null}
                            </View>

                            {/* Tile */}
                            <View>
                                <TextInputCustom
                                    title={localizes('postNewView.title')}
                                    warnTitle={validateTitle}
                                    autoCapitalize={"sentences"}
                                    refInput={r => (this.title = r)}
                                    value={this.state.title}
                                    onChangeText={(text) => { this.setState({ title: text, validateTitle: null }) }}
                                    onSubmitEditing={() => {
                                        this.price.getElement().focus()
                                    }}
                                    isInputNormal={true}
                                    placeholder={localizes('postNewView.titleFill')}
                                    keyboardType="default"
                                    returnKeyType={"next"}
                                    isValidate={!Utils.isNull(validateTitle) ? true : false}
                                />

                            </View>
                            {/* Price */}
                            <View style={{ backgroundColor: Colors.COLOR_WHITE }}>
                                {Utils.isNull(validatePrice)
                                    ?
                                    <Text style={{
                                        fontSize: Fonts.FONT_SIZE_X_SMALL,
                                        marginLeft: Constants.MARGIN_X_LARGE,
                                        marginTop: Constants.PADDING_12,
                                        color: Colors.COLOR_TEXT
                                    }}>{localizes('postNewView.titlePrice')}</Text>
                                    : <Text style={{ fontSize: Fonts.FONT_SIZE_X_SMALL, color: Colors.COLOR_RED, marginLeft: Constants.MARGIN_X_LARGE, marginTop: Constants.PADDING_12 }}>
                                        {validatePrice}
                                    </Text>
                                }
                                <TextInputMask
                                    ref={ref => this.price = ref}
                                    underlineColorAndroid={Colors.COLOR_TRANSPARENT}
                                    type={'money'}
                                    options={{
                                        precision: 0,
                                        separator: '.',
                                        delimiter: '',
                                        unit: '',
                                        suffixUnit: ''
                                    }}
                                    value={this.state.price}
                                    onChangeText={text => {
                                        text == 0 ?
                                            this.setState({ price: null })
                                            : this.setState({ price: text, validatePrice: null })
                                    }}
                                    style={[commonStyles.inputText, { fontSize: Fonts.FONT_SIZE_X_MEDIUM }]}
                                    placeholder={localizes('postNewView.titlePriceFill')}
                                    keyboardType="numeric"
                                    returnKeyType={"next"}
                                    onSubmitEditing={this.gotoCategory}
                                />
                                <Hr color={Colors.COLOR_BACKGROUND} style={{ marginHorizontal: Constants.MARGIN_X_LARGE, }} />
                            </View>

                            {/* Category */}
                            <TextInputCustom
                                title={localizes('postNewView.titleCategory')}
                                warnTitle={validateCategory}
                                isInputAction={true}
                                myBackgroundColor={Colors.COLOR_WHITE}
                                onPress={this.gotoCategory}
                                touchSpecialStyle={[commonStyles.touchInputSpecial]}
                                inputSpecialStyle={styles.inputSpecial}
                                imageSpecialStyle={styles.imageSpecial}
                                placeholder={localizes('postNewView.titleCategoryFill')}
                                value={this.state.category}
                                onChangeText={(text) => { this.setState({ category: text }) }}
                                isValidate={!Utils.isNull(validateCategory) ? true : false}
                            />
                            {/* City */}
                            <TextInputCustom
                                title={localizes('postNewView.titleLocation')}
                                warnTitle={validateProvince}
                                refInput={r => (this.province = r)}
                                isInputAction={true}
                                onPress={this.gotoProvince}
                                myBackgroundColor={Colors.COLOR_WHITE}
                                touchSpecialStyle={[commonStyles.touchInputSpecial]}
                                inputSpecialStyle={styles.inputSpecial}
                                imageSpecialStyle={styles.imageSpecial}
                                placeholder={localizes('postNewView.titleLocationFill')}
                                onChangeText={(text) => { this.setState({ province: text }) }}
                                value={this.state.province}
                                isValidate={!Utils.isNull(validateProvince) ? true : false}
                            />
                            {/* Description information */}
                            <TextInputCustom
                                title={localizes('postNewView.titleDescrip')}
                                warnTitle={validateDes}
                                ref={r => (this.description = r)}
                                value={Utils.isNull(this.state.description) ? this.state.description : StringUtil.clearTagHTML(this.state.description)}
                                onChangeText={(text) => { this.setState({ description: text, validateDes: null }) }}
                                onSubmitEditing={() => {
                                }}
                                isMultiLines={true}
                                placeholder={localizes('postNewView.titleDescripFill')}
                                keyboardType="default"
                                editable={true}
                                numberOfLines={this.NUMBER_OF_LINES}
                                multiline={true}
                                underlineColorAndroid="transparent"
                                isValidate={!Utils.isNull(validateDes) ? true : false}
                            />
                            {/* Button Send request */}
                            <View style={{ backgroundColor: Colors.COLOR_BACKGROUND }}>
                                {
                                    this.renderCommonButton(
                                        this.screenType == ScreenType.FROM_HOME_VIEW ? localizes('postNewView.postSelling') : localizes('postNewView.buttonEdit'),
                                        { color: Colors.COLOR_WHITE },
                                        {
                                            marginHorizontal: Constants.MARGIN_X_LARGE,
                                            backgroundColor: Colors.COLOR_PRIMARY,
                                            shadowColor: Colors.COLOR_PRIMARY
                                        },
                                        () => {
                                            this.screenType == ScreenType.FROM_HOME_VIEW ?
                                                this.onPressSendPost()
                                                :
                                                this.setState({ isWantEdit: true })
                                        },
                                        null,
                                        //() => { this.onPressSendPost() },
                                        this.state.isDisableButton //disableButton
                                    )
                                }
                            </View>
                            {this.renderUploadSuccess()}
                        </View>
                    </Content>
                    {this.renderFileSelectionDialog()}
                    {this.showLoadingBar(this.state.isUpdate)}
                    {!this.state.isUploading ? this.showLoadingBar(this.props.isLoading) : null}
                    {this.renderProgressUpload(this.state.isUploading)}
                    {this.renderAlertExit()}
                    {this.areYouWantEditThisPost(this.state.isWantEdit)}
                </Root>
            </Container>
        );
    }
}


const mapStateToProps = state => ({
    data: state.postNews.data,
    isLoading: state.postNews.isLoading,
    error: state.postNews.error,
    errorCode: state.postNews.errorCode,
    action: state.postNews.action
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(PostNewsView);