import React, { Component } from "react";
import {
    ImageBackground, View, StatusBar, Image, TouchableOpacity, BackHandler, Alert,
    WebView, Linking, StyleSheet, TextInput, Dimensions, ScrollView, Keyboard, Platform,
    Modal
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
import moment from 'moment';;
import GridView from 'components/gridView';

import { CalendarScreen } from "components/calendarScreen";
import SubServiceType from "enum/subServiceType";
import screenType from "enum/screenType";
import carType from "enum/carType";
import vehicleType from "enum/vehicleType";
import ic_home_white from 'images/ic_home_white.png';
import ic_back_white from 'images/ic_back_white.png';
import ic_send_image from 'images/ic_send_image.png';
import ItemImage from "./items/itemImage";
import areaType from "enum/areaType";
import ImagePicker from 'react-native-image-crop-picker';
import ServerPath from "config/Server";
import Upload from 'lib/react-native-background-upload';
import DialogCustom from "components/dialogCustom";
import TextInputCustom from "components/textInputCustom";
import { TextInputMask } from 'react-native-masked-text'
import StorageUtil from "utils/storageUtil";
import * as Progress from 'react-native-progress';
import SellingVehicleResourceKind from "enum/sellingVehicleResourceKind";

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

var HEIGHT_IMAGES = width * 0.4
let typeImage = {
    IMAGE_CAR: 0,
    REGISTER_CAR: 1
}
let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

class SellingVehiclePostView extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            enableRefresh: true,
            province: null,
            provinceId: null,
            manufacturer: null,
            manufacturerId: null,
            carLife: null,
            modelCarId: null,
            price: null,
            imagesCar: [],
            imagesRegisterCar: [{ image: "front.jpg" }, { image: 'backSize.jpg' }],
            title: null,
            description: null,
            itemImageRegisterCarFront: null,
            itemImageRegisterCarBackside: null,
            progressUploadVehicle: 0,
            progressUploadVehicleCavet: 0,
            isUploading: false,
            isDisableButton: false,
            progress: 0
        }
        this.NUMBER_OF_LINES = 10
        this.maximumImages = 5
        this.maximumLengthTitle = 100
        // this.countSuccessVehicle = 0
        // this.countSuccessVehicleCavet = 0
        this.imagesTemp = []
        this.imageRegisterCar = []
        this.userInfo = null
        this.indexVehicleImage = 0
        this.indexVehicleCavetImage = 0
        // this.maxFileSize = null
        this.oneMB = 1048576
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
        super.componentDidMount()
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
        // this.setState({
        //     isDisableButton: false
        // })
    }

    /**
     * Validate data
     */
    validateData() {
        const { province, manufacturer, carLife, price, imagesCar,
            itemImageRegisterCarFront, itemImageRegisterCarBackside, title } = this.state
        if (Utils.isNull(province)) {
            this.showMessage(localizes('sellingVehicle.enterProvince'))
            return false
        } else if (Utils.isNull(manufacturer)) {
            this.showMessage(localizes('registerMembership.enterManufactureCar'))
            return false
        } else if (Utils.isNull(carLife)) {
            this.showMessage(localizes('registerMembership.enterCarLife'))
            return false
        } else if (Utils.isNull(price) || price == 0) {
            this.showMessage(localizes('sellingVehicle.enterPrice'))
            // this.price.getElement()._root.focus()
            const el = this.refs.price.getElement()
            el.focus()
            return false
        } else if (imagesCar.length <= 0) {
            this.showMessage(localizes('sellingVehicle.enterImagesCar'))
            return false
        } else if (imagesCar.length > this.maximumImages) {
            this.showMessage(localizes('sellingVehicle.errMaxImages'))
            return false
        } else if (Utils.isNull(itemImageRegisterCarFront) || Utils.isNull(itemImageRegisterCarBackside)) {
            this.showMessage(localizes('sellingVehicle.enterImagesRegisterCar'))
            return false
        } else if (Utils.isNull(title)) {
            this.showMessage(localizes('sellingVehicle.enterTitle'))
            this.title.focus()
            return false
        } else if (title.length > this.maximumLengthTitle) {
            this.showMessage(localizes('sellingVehicle.errTitle'))
            this.title.focus()
            return false
        }
        return true
    }

    /**
      * Handle data when request
      */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.POST_NEWS_SELLING_VEHICLE)) {
                    if (!Utils.isNull(data)) {
                        this.setState({
                            isUploading: true
                        })
                        this.uploadVehicleImages(data.id)
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    /**
     * Upload image vehicle
     * @param {*} sellingVehicleId 
     */
    uploadVehicleImages(sellingVehicleId) {
        console.log("INDEX: ", this.indexVehicleImage)
        let kind = SellingVehicleResourceKind.VEHICLE_RESOURCE
        let filePathUrl = this.state.imagesCar[this.indexVehicleImage];
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
        this.processUploadVehicleImage(options, sellingVehicleId);
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
                // this.countSuccessVehicle++
                if (this.indexVehicleImage < this.state.imagesCar.length - 1) {
                    this.indexVehicleImage++
                    const timeOut = setTimeout(() => {
                        this.uploadVehicleImages(sellingVehicleId)
                    }, 200);
                } else {
                    console.log('Completed upload vehicle images!')
                    this.imagesTemp = []
                    this.uploadVehicleCavetImages(sellingVehicleId)
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
     * Upload image vehicle cavet
     * @param {*} sellingVehicleId
     */
    uploadVehicleCavetImages(sellingVehicleId) {
        console.log("INDEX CAVET: ", this.indexVehicleCavetImage)
        let kind = SellingVehicleResourceKind.CA_VET
        let filePathUrl = this.imageRegisterCar[this.indexVehicleCavetImage];
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
                    onProgressTitle: "Vehicle Cavet Images Uploading...",
                    autoClear: true
                }
            }
        this.processUploadVehicleImage(options, sellingVehicleId);
    }

    /**
     * Process upload cavet image
     * @param {*} options 
     */
    processUploadCavetImage(options, sellingVehicleId) {
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
                console.log('Completed!')
                if (this.indexVehicleCavetImage < this.imageRegisterCar.length - 1) {
                    this.indexVehicleCavetImage++
                    const timeOut = setTimeout(() => {
                        this.uploadVehicleCavetImages(sellingVehicleId)
                    }, 200);
                } else {
                    this.setState({
                        isUploading: false
                    })
                }
            })
        }).catch((err) => {
            this.saveException(err, 'processUploadCavetImage')
            this.setState({
                isDisableButton: false
            })
        })
    }

    /**
     * Layout upload file images success
     */
    renderUploadSuccess = () => {
        if ((this.indexVehicleImage == this.state.imagesCar.length - 1)
            && this.indexVehicleCavetImage == this.imageRegisterCar.length - 1 && !this.state.isUploading) {
            return (
                <DialogCustom
                    visible={true}
                    isVisibleOneButton={true}
                    isVisibleContentText={true}
                    textBtn={"Đồng ý"}
                    contentText={localizes('sellingVehicle.postNewsSuccess')}
                    onPressBtn={() => {
                        let filterPostLiked = {
                            "paging": {
                                "pageSize": Constants.PAGE_SIZE,
                                "page": 0
                            },
                            "userId": this.userInfo.id
                        }
                        this.props.getPostLiked(filterPostLiked)
                        this.onBack()
                        this.setState({
                            isDisableButton: false
                        })
                        this.imageRegisterCar = []
                    }}
                />
            )
        }
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
                        <Text style={[commonStyles.textSmall]} >Đang tải ảnh lên...</Text>
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
        return (<ItemImage
            array={this.state.imagesCar}
            item={item}
            index={index}
            parentIndex={parentIndex}
            indexInParent={indexInParent}
            onPressX={(itemImage) => {
                let imagesTemps = this.state.imagesCar
                var index = imagesTemps.indexOf(itemImage)
                imagesTemps.splice(index, 1);
                this.setState({
                    imagesCar: imagesTemps
                })
            }}
        />)
    }

    /**
     * onPress send a post sale car
     */
    onPressSendPost() {
        const codeSellingVehicle = StringUtil.randomString(5, chars)
        console.log("CODE: ", codeSellingVehicle)
        if (this.validateData()) {
            this.imageRegisterCar.push(
                { "image": this.state.itemImageRegisterCarFront },
                { "image": this.state.itemImageRegisterCarBackside }
            )
            this.setState({
                isDisableButton: true,
            })
            this.filter = {
                "code": codeSellingVehicle,
                "provinceId": this.state.provinceId,
                "manufacturerId": this.state.manufacturerId,
                "modelVehicleId": this.state.modelCarId,
                "price": this.state.price.trim().split('.').join(""),
                "title": this.state.title,
                "description": this.state.description
            }
            this.props.postNewsSellingVehicle(this.filter)
        }
    }

    /**
     * Choose image car
     * @param {*} typeImage 
     * @param {*} index // for type == typeImage.REGISTER_CAR
     */
    onChooseImageCar(type, index) {
        ImagePicker.openPicker({
            width: type == typeImage.IMAGE_CAR ? HEIGHT_IMAGES : HEIGHT_IMAGES * 1.5,
            height: 600,
            multiple: type == typeImage.IMAGE_CAR ? true : false,
            waitAnimationEnd: false,
            includeExif: true,
            forceJpg: true,
            mediaType: 'photo',
            compressImageQuality: 0.8
        }).then((images) => {
            console.log("images: ", images)
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
                    }
                });
                this.setState({
                    imagesCar: this.imagesTemp
                })
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
                            itemImageRegisterCarFront: images.path
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
        }).catch(e => this.saveException(e, 'onChooseImageCar'));
    }

    /**
     * Choose a province: 
     */
    gotoProvince = () => {
        this.props.navigation.navigate("CategoryGeneral", {
            onChangeValue: this.onChangeValueProvince,
            type: areaType.PROVINCE_STRING
        })
    }

    /**
     * Change value province
     */
    onChangeValueProvince = (provinceId, provinceName) => {
        this.setState({
            province: provinceName,
            provinceId
        })
    }

    /**
     * Go to Manufacturer
     */
    gotoManufacturer = () => {
        this.props.navigation.navigate("CategoryGeneral", {
            onChangeValue: this.onChangeManufacturer,
            type: carType.CAR_MANUFACTURER
        })
    }

    /**
     * Change text Manufacturer
     */
    onChangeManufacturer = (manufacturerId, manufacturer) => {
        this.setState({ manufacturerId, manufacturer })
    }

    /**
     * Go to Car Life
     */
    gotoCarLife = () => {
        this.props.navigation.navigate("CategoryGeneral", {
            onChangeValue: this.onChangeCarLife,
            type: carType.CAR_LIFE,
            manufactureId: this.state.manufacturerId
        })
    }

    /**
     * Change value car life
     */
    onChangeCarLife = (modelCarId, carLife) => {
        this.setState({ modelCarId, carLife })
    }

    render() {
        return (
            <Container style={styles.container}>
                <Root>
                    <View style={{ flexGrow: 1 }}>
                        <Header style={[{ backgroundColor: Colors.COLOR_WHITE, borderBottomWidth: 0 }]}>
                            <View style={styles.headerBody}>
                                {/*Back button*/}
                                <TouchableOpacity
                                    style={{
                                        paddingVertical: '100%',
                                        paddingLeft: Constants.PADDING_LARGE,
                                    }}
                                    onPress={() => {
                                        this.onBack()
                                    }}>
                                    <Image source={ic_back_white} />
                                </TouchableOpacity>
                                <Text style={[commonStyles.title, { flex: 1, textAlign: "center", margin: 0, padding: 0 }]}>ĐĂNG TIN</Text>
                                <TouchableOpacity
                                    style={{
                                        paddingVertical: '100%',
                                        paddingRight: Constants.PADDING_LARGE,
                                    }}
                                    onPress={() => {
                                        this.props.navigation.navigate('Main')
                                    }}>
                                    <Image source={ic_home_white} />
                                </TouchableOpacity>
                            </View>
                        </Header>
                        <Content contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }} >
                            <View style={{ flex: 1, marginTop: Constants.MARGIN_LARGE }}>
                                {/* City */}
                                <TextInputCustom
                                    refInput={r => (this.province = r)}
                                    isInputAction={true}
                                    onPress={this.gotoProvince}
                                    placeholderTextColor={Colors.COLOR_WHITE}
                                    myBackgroundColor={Colors.COLOR_WHITE}
                                    touchSpecialStyle={[commonStyles.touchInputSpecial, commonStyles.marginForShadow]}
                                    inputSpecialStyle={styles.inputSpecial}
                                    imageSpecialStyle={styles.imageSpecial}
                                    placeholder={"Thành phố"}
                                    onChangeText={(text) => { this.setState({ province: text }) }}
                                    value={this.state.province}
                                />
                                {/* manufacturer */}
                                <TextInputCustom
                                    refInput={r => (this.manufacturer = r)}
                                    isInputAction={true}
                                    placeholderTextColor={Colors.COLOR_TEXT}
                                    myBackgroundColor={Colors.COLOR_WHITE}
                                    onPress={this.gotoManufacturer}
                                    touchSpecialStyle={[commonStyles.touchInputSpecial, commonStyles.marginForShadow]}
                                    inputSpecialStyle={styles.inputSpecial}
                                    imageSpecialStyle={styles.imageSpecial}
                                    placeholder={localizes('registerMembership.holderManufacturer')}
                                    value={this.state.manufacturer}
                                    onChangeText={(text) => { this.setState({ manufacturer: text }) }}
                                />
                                {/* car life */}
                                <TextInputCustom
                                    disabled={Utils.isNull(this.state.manufacturer)}
                                    refInput={r => (this.manufacturer = r)}
                                    isInputAction={true}
                                    onPress={this.gotoCarLife}
                                    myBackgroundColor={
                                        Utils.isNull(this.state.manufacturer)
                                            ? Colors.COLOR_WHITE_DISABLE
                                            : Colors.COLOR_WHITE}
                                    placeholderTextColor={
                                        Utils.isNull(this.state.manufacturer)
                                            ? Colors.COLOR_PLACEHOLDER_TEXT_DISABLE
                                            : Colors.COLOR_TEXT}
                                    touchSpecialStyle={[commonStyles.touchInputSpecial, commonStyles.marginForShadow]}
                                    inputSpecialStyle={styles.inputSpecial}
                                    imageSpecialStyle={styles.imageSpecial}
                                    placeholder={localizes('registerMembership.holderCarLife')}
                                    value={this.state.carLife}
                                    onChangeText={(text) => { this.setState({ carLife: text }) }}
                                    onSubmitEditing={() => {
                                        // this.price.focus();
                                    }}
                                />
                                {/* price  */}
                                <TextInputMask
                                    placeholder={"Giá"}
                                    keyboardType="numeric"
                                    ref={"price"}
                                    placeholderTextColor={Colors.COLOR_TEXT}
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
                                            : this.setState({ price: text })
                                    }}
                                    style={[commonStyles.text,
                                    commonStyles.shadowOffset,
                                    commonStyles.inputText,
                                    commonStyles.touchInputSpecial,
                                    commonStyles.marginForShadow, {
                                        // elevation: 0
                                    }]}
                                />
                                {/* choose images */}
                                <View>
                                    <Text style={[commonStyles.text, {
                                        marginLeft: Constants.MARGIN_24,
                                        marginTop: Constants.MARGIN_LARGE,
                                    }]} >Hình ảnh xe (Tối đa 5 tấm)
                                        </Text>
                                    <FlatListCustom
                                        horizontal={true}
                                        showsHorizontalScrollIndicator={false}
                                        // ListHeaderComponent={
                                        //     <HeaderFlatlist onChooseImageCar={() => this.onChooseImageCar(typeImage.IMAGE_CAR)} />
                                        // }
                                        style={[{
                                            backgroundColor: Colors.COLOR_TRANSPARENT
                                        }]}
                                        data={this.state.imagesCar}
                                        renderItem={this.renderItemImage.bind(this)}
                                        enableRefresh={this.state.enableRefresh}
                                        keyExtractor={item => item.code}
                                        showsVerticalScrollIndicator={false}
                                    />
                                </View>
                                {/* Choose register car image */}
                                <View style={{
                                    marginTop: Constants.MARGIN,
                                    marginBottom: Constants.MARGIN_12,
                                }}>
                                    <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter, {
                                        justifyContent: 'flex-start',
                                        flex: 0,
                                        marginHorizontal: Constants.MARGIN_24
                                    }]} >
                                        <Text style={[commonStyles.text, { margin: 0 }]} >Hình cavet xe
                                            <Text style={[commonStyles.textSmallItalic, {
                                                margin: 0, color: Colors.COLOR_RED
                                            }]} > ** Lưu ý:
                                            <Text style={[commonStyles.textSmallBold, { margin: 0, color: Colors.COLOR_RED }]} > H2 Decal
                                            <Text style={[commonStyles.textSmallItalic, { margin: 0, color: Colors.COLOR_RED }]} > cam kết bảo mật hình ảnh của bạn </Text>
                                                </Text>
                                            </Text>
                                        </Text>
                                    </View>
                                    <View style={{ marginTop: Constants.MARGIN }}>
                                        <ScrollView
                                            showsHorizontalScrollIndicator={false}
                                            horizontal={true}>
                                            <TouchableOpacity
                                                style={[styles.imageRegisterCar, commonStyles.shadowOffset, commonStyles.marginForShadow, {
                                                    marginRight: Constants.MARGIN_LARGE
                                                }]}
                                                activeOpacity={Constants.ACTIVE_OPACITY}
                                                onPress={() => { this.onChooseImageCar(typeImage.REGISTER_CAR, 0) }} >
                                                <View style={[{
                                                    width: HEIGHT_IMAGES * 1.5, height: HEIGHT_IMAGES,
                                                    borderRadius: Constants.CORNER_RADIUS,
                                                    backgroundColor: Colors.COLOR_WHITE
                                                }]}>
                                                    {
                                                        !Utils.isNull(this.state.itemImageRegisterCarFront)
                                                            ? <Image source={{ uri: this.state.itemImageRegisterCarFront }}
                                                                style={[{
                                                                    borderRadius: Constants.CORNER_RADIUS,
                                                                    width: '100%', height: '100%',
                                                                }]}
                                                                resizeMode={"cover"} />
                                                            :
                                                            <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter]} >
                                                                <Image source={ic_send_image} />
                                                                <Text style={[commonStyles.text, {
                                                                    color: Colors.COLOR_PLACEHOLDER_TEXT_DISABLE
                                                                }]} >Mặt trước</Text>
                                                            </View>
                                                    }
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.imageRegisterCar, commonStyles.shadowOffset, commonStyles.marginForShadow, {
                                                    marginLeft: Constants.MARGIN_LARGE
                                                }]}
                                                activeOpacity={Constants.ACTIVE_OPACITY}
                                                onPress={() => { this.onChooseImageCar(typeImage.REGISTER_CAR, 1) }} >
                                                <View style={[{
                                                    width: HEIGHT_IMAGES * 1.5, height: HEIGHT_IMAGES,
                                                    borderRadius: Constants.CORNER_RADIUS,
                                                    backgroundColor: Colors.COLOR_WHITE
                                                }]}>
                                                    {
                                                        !Utils.isNull(this.state.itemImageRegisterCarBackside)
                                                            ? <Image source={{ uri: this.state.itemImageRegisterCarBackside }}
                                                                style={[{
                                                                    borderRadius: Constants.CORNER_RADIUS,
                                                                    width: '100%', height: '100%',
                                                                }]}
                                                                resizeMode={"cover"} />
                                                            : <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter]} >
                                                                <Image source={ic_send_image} />
                                                                <Text style={[commonStyles.text, { color: Colors.COLOR_PLACEHOLDER_TEXT_DISABLE }]} >Mặt sau</Text>
                                                            </View>
                                                    }
                                                </View>
                                            </TouchableOpacity>
                                        </ScrollView>
                                    </View>
                                </View>
                                {/* Tile */}
                                <TextInputCustom
                                    autoCapitalize={"sentences"}
                                    inputNormalStyle={[commonStyles.touchInputSpecial, commonStyles.marginForShadow]}
                                    refInput={r => (this.title = r)}
                                    value={this.state.title}
                                    onChangeText={(text) => { this.setState({ title: text }) }}
                                    onSubmitEditing={() => {
                                        this.description.focus();
                                    }}
                                    isInputNormal={true}
                                    placeholder={"Tiêu đề (tối đa 100 kí tự)"}
                                    keyboardType="default"
                                />
                                {/* description information */}
                                <TextInput
                                    style={[commonStyles.touchInputSpecial, commonStyles.inputText, commonStyles.shadowOffset, commonStyles.marginForShadow, {
                                        textAlignVertical: "top",
                                        height: 250,
                                    }]}
                                    ref={r => (this.description = r)}
                                    value={this.state.description}
                                    onChangeText={(text) => { this.setState({ description: text }) }}
                                    onSubmitEditing={() => {
                                    }}
                                    isMultiLines={true}
                                    placeholder={"Mô tả chi tiết"}
                                    keyboardType="default"
                                    editable={true}
                                    numberOfLines={this.NUMBER_OF_LINES}
                                    multiline={true}
                                />
                                {/* Button Send request */}
                                <View style={{
                                    marginBottom: Constants.MARGIN_X_LARGE
                                }}>
                                    {
                                        this.renderCommonButton(
                                            'GỬI BÀI ĐĂNG',
                                            {
                                                color: Colors.COLOR_WHITE,
                                            },
                                            {
                                                marginHorizontal: Constants.MARGIN_X_LARGE,
                                                backgroundColor: Colors.COLOR_PRIMARY,
                                                shadowColor: Colors.COLOR_PRIMARY
                                            },
                                            () => { this.onPressSendPost() },
                                            false, //isBtnLogOut
                                            false, //isBtnRegister
                                            this.state.isDisableButton //disableButton
                                        )
                                    }
                                </View>
                                {this.renderUploadSuccess()}
                            </View>
                        </Content>
                        {!this.state.isUploading ? this.showLoadingBar(this.props.isLoading) : null}
                        {this.renderProgressUpload(this.state.isUploading)}
                    </View>
                </Root>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    data: state.sellingVehiclePost.data,
    isLoading: state.sellingVehiclePost.isLoading,
    error: state.sellingVehiclePost.error,
    errorCode: state.sellingVehiclePost.errorCode,
    action: state.sellingVehiclePost.action
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(SellingVehiclePostView);