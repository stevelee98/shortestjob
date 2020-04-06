import React, { Component } from 'react';
import {
    View, Text, Image, BackHandler,
    RefreshControl,
    TouchableOpacity,
    PermissionsAndroid,
    Dimensions, Keyboard, ActivityIndicator,
    Platform
} from 'react-native';
import BaseView from 'containers/base/baseView';
import styles from './styles';
import commonStyles from 'styles/commonStyles';
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';
import Utils from 'utils/utils';
import { TextInput } from 'react-native-gesture-handler';
import ic_send from 'images/ic_send.png';
import ic_send_image from 'images/ic_send_image.png';
import { Container, Root, Content } from 'native-base';
import FlatListCustom from 'components/flatListCustom';
import ItemComment from '../items/ItemComment';
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import StorageUtil from 'utils/storageUtil';
import DialogCustom from 'components/dialogCustom';
import { localizes } from 'locales/i18n';
import ImagePicker from 'react-native-image-crop-picker';
import ImageCameraPicker from "react-native-image-picker";
import ic_cancel_black from 'images/ic_cancel_black.png';
import ServerPath from 'config/Server';
import Upload from 'lib/react-native-background-upload';
import ImageResizer from "react-native-image-resizer";
import ImageLoader from 'components/imageLoader';

const SIZE_AVATAR = 48;
const CANCEL_INDEX = 2;
const optionsCamera = {
    title: "Select avatar",
    storageOptions: {
        skipBackup: true,
        path: "images"
    }
};

class TabCommentView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            messageText: null,
            imagesProduct: null,
            user: null,
            visibleDialog: false,
            isLoadMoreChild: false,
            isSendComment: false,
        };
        const { vehicleId, isLoadMoreChild } = this.props;
        const { callBack } = this.props.navigation.state.params;
        this.callBack = callBack;
        this.vehicleId = vehicleId;
        this.isLoadMore = false;
        this.reviews = [];
        this.reviewsTemp = [];
        this.filter = {
            productId: this.vehicleId,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            }
        };
        this.imagesUpload = null;
    }

    componentDidMount() {
        const { navigation } = this.props;
        this.getSourceUrlPath();
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            if (!Utils.isNull(user)) {
                this.setState({ user: user })
            }
        }).catch(error => {
            this.saveException(error, 'componentDidMount')
        });
        this.props.getReviewsOfProduct(this.filter);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.state.isLoadMoreChild = nextProps.isLoadMoreChild;
            if(this.state.isLoadMoreChild) {
                this.state.isLoadMoreChild = false;
                this.loadMoreComment();
            } else {
                this.handleData();
            }
        }
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    //onRefreshing
    handleRefresh = () => {
        this.setState({
            refreshing: false
        });
        if (!Utils.isNull(this.vehicleId)) {
            // Get comment
            this.props.getReviewsOfProduct(this.filter = {
                productId: this.vehicleId,
                paging: {
                    pageSize: Constants.PAGE_SIZE,
                    page: 0
                }
            });
        }
    };

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.SEND_REVIEW_SELLING)) {
                    if (!Utils.isNull(data)) {
                        this.imagesUpload = this.state.imagesProduct;
                        !Utils.isNull(this.imagesUpload) ? this.uploadVehicleImages(data.idComment) : null;
                        this.onPressCancel();
                        if(this.filter.paging.page > 0) {
                            this.filter.paging.page = 0;
                        }
                        this.props.getReviewsOfProduct(this.filter);
                        this.setState({ messageText: null });
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_REVIEWS_OF_PRODUCT)) {        
                    if (!Utils.isNull(data.data)) {
                        if(this.state.isSendComment || this.filter.paging.page == 0) {
                            this.reviewsTemp = [];
                            this.state.isSendComment = false;
                        }     
                        if (data.data.length > 0) {
                            this.isLoadMore = this.state.enableLoadMore = !(data.data.length < Constants.PAGE_SIZE);
                            if(data.data.length + Constants.PAGE_SIZE * Math.floor(this.reviews.length / Constants.PAGE_SIZE) > this.reviews.length) {
                                data.data.forEach((item, index) => {
                                    this.reviewsTemp.push({ ...item })
                                });
                                this.reviews = this.reviewsTemp;
                                this.state.enableLoadMore = true;
                            }
                            
                        }
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    /**
     * Render (load more)
     */
    renderLoadingLoadMore = () => {
        return (
            <View
                style={{ marginBottom: Constants.MARGIN_X_LARGE }}>
                <ActivityIndicator color={Colors.COLOR_PRIMARY} animating size="large" />
            </View>
        )
    }

    /** 
    * Cancel sent comment image
    */
    onPressCancel = () => {
        this.setState({
            imagesProduct: null
        })
    }

    /**
     * Choose image car
     * @param {*} typeImage 
     * @param {*} index // for type == typeImage.REGISTER_CAR
     */
    onChooseImageSelling(type, index) {
        const { imagesProduct } = this.state
        console.log('as', ImagePicker)
        if (imagesProduct == null) {
            ImagePicker.openPicker({
                width: 40,
                height: 60,
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
                let maxSizeUpload = 10
                // this.maxFileSizeUpload.numericValue
                console.log("images: ", maxSizeUpload)

                if (type == 0) {
                    images.forEach(element => {
                        console.log("element.size: ", element.size)
                        // this.formatBytes(element.size);
                        if (element.size / this.oneMB > maxSizeUpload) {
                            count++
                        } else {
                            this.imagesTemp = {
                                "image": element.path
                            }

                            // if (this.imagesTemp.length > 1) {
                            //     this.imagesTemp = this.imagesTemp.slice(0, 1)
                            // }
                        }
                    });
                    console.log("THIS. IMAGES TEMP: ", this.imagesTemp);
                    this.setState({
                        imagesProduct: this.imagesTemp,
                        // validateImages: null
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
                                // validateImages: null
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
                // if (imagesProduct.length > this.maximumImages) {
                //     this.setState({ validateImages: localizes('postNewView.errMaxImages') })
                // }
            }).catch(e => this.saveException(e, 'onChooseImageSelling'));
        }
    }

    /**
     * Upload image vehicle
     * @param {*} commentId 
     */
    uploadVehicleImages(commentId) {
        let filePathUrl = this.imagesUpload;
        let path = filePathUrl.image;
        if (Platform.OS == "android") {
            path = filePathUrl.image.replace('file://', '');
        } else {
            path = Utils.convertLocalIdentifierIOSToAssetLibrary(filePathUrl.image, true);
        }
        const options = {
            url: ServerPath.API_URL + `vehicle/${commentId}/comment/image`,
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
        this.processUploadVehicleImage(options, commentId)
    }

    /**
     * Process upload image
     * @param {*} options 
     */
    processUploadVehicleImage(options, commentId) {
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
                this.handleRefresh();
            })
        }).catch((err) => {
            this.saveException(err, 'processUploadVehicleImage')
            this.setState({
                isDisableButton: false
            })
        })
    }

    render() {
        if (!Utils.isNull(this.state.user)) {
            if (!Utils.isNull(this.state.user.avatarPath)) {
                var avatarUser = this.state.user.avatarPath.indexOf("http") != -1 ? this.state.user.avatarPath :
                    (this.resourceUrlPath.textValue + '/' + this.state.user.avatarPath)
            } else { var avatarUser = '' }
        } else { var avatarUser = '' }
        return (
            <Container style={styles.container}>
                <Root>
                    {/* <Content contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }} showsVerticalScrollIndicator={false}> */}
                        {/* Add comment */}
                        <View style={[
                            commonStyles.viewHorizontal,
                            commonStyles.viewCenter,
                            {
                                alignItems: 'flex-start', paddingHorizontal: Constants.MARGIN_X_LARGE
                            }]}>
                            <View style={[{ flex: 1 },
                            commonStyles.viewHorizontal, commonStyles.viewCenter
                            ]}>
                                {/* avatar user */}

                                {this.renderImage(avatarUser, 0)}

                                <TextInput style={[commonStyles.text, {
                                    flex: 1, borderRadius: 0
                                }]}
                                    // editable={!this.state.isShowLoading}
                                    // selectTextOnFocus={!this.state.isShowLoading}
                                    placeholder='Để lại bình luận'
                                    placeholderTextColor={Colors.COLOR_DRK_GREY}
                                    ref={r => (this.messageInput = r)}
                                    value={this.state.messageText}
                                    onChangeText={(text) => {
                                        this.setState({ messageText: text })
                                    }}
                                    onSubmitEditing={() => {
                                        Keyboard.dismiss()
                                        // this.onPressSendMessages()
                                    }}
                                    style={{ flex: 1, height: Constants.HEIGHT_INPUT }}
                                    keyboardType="default"
                                    underlineColorAndroid='transparent'
                                    returnKeyType={"send"}
                                    multiline={true}
                                    enablesReturnKeyAutomatically={true}
                                    editable={true}
                                />

                                {
                                    !Utils.isNull(this.state.messageText) && this.state.messageText !== "" || !Utils.isNull(this.state.imagesProduct) ?
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (!Utils.isNull(this.state.user)) {
                                                    // this.state.isSendComment = true;
                                                    this.setState({isSendComment: true});
                                                    this.props.sendReviewSelling({
                                                        review: this.state.messageText,
                                                        productId: this.props.sellingItemId,
                                                        sellerId: this.props.sellerId,
                                                        title: this.props.vehicleName
                                                    });
                                                    Keyboard.dismiss();
                                                } else { this.showLoginView(); }
                                            }
                                            }
                                        >
                                            <View>
                                                <Image
                                                    source={ic_send}
                                                    resizeMode={'cover'}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity
                                            style={{ marginRight: Constants.MARGIN_LARGE }}
                                            onPress={() => {
                                                this.attachFile();
                                            }}>
                                            <Image
                                                source={ic_send_image}
                                                resizeMode={'cover'}
                                            />
                                        </TouchableOpacity>
                                }

                            </View>
                        </View>

                        {/* image */}
                        {!Utils.isNull(this.state.imagesProduct) ?
                            <View style={{ position: 'relative', marginLeft: Constants.MARGIN_X_LARGE, marginBottom: Constants.MARGIN_X_LARGE }}>
                                <View style={{
                                    // paddingLeft: 125
                                }}>
                                    <Image
                                        source={{ uri: !Utils.isNull(this.state.imagesProduct) ? this.state.imagesProduct.image : null }}
                                        resizeMode={"cover"}
                                        style={{
                                            width: Dimensions.get('window').width * 0.4,
                                            height: Dimensions.get('window').width * 0.4,
                                            borderRadius: 10,
                                        }}
                                    />
                                </View>
                                <TouchableOpacity
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    onPress={this.onPressCancel}
                                    style={{
                                        position: 'absolute',
                                        top: Constants.MARGIN_LARGE - 5,
                                        right: 205,
                                        backgroundColor: Colors.COLOR_DRK_GREY,
                                        borderRadius: 10 / 2,
                                        padding: Constants.PADDING,
                                    }} >
                                    <Image
                                        resizeMode={"center"}
                                        source={ic_cancel_black}
                                        style={[{
                                            height: 10,
                                            width: 10,
                                            borderRadius: 10 / 2,
                                        }]} />
                                </TouchableOpacity>
                            </View>
                            : null}

                        <View style={{
                            borderWidth: 0.5,
                            borderColor: Colors.COLOR_BACKGROUND
                        }} />

                        {/* comments */}
                        {!Utils.isNull(this.reviews) ?
                            <View style={[styles.viewChild, {
                                flex: 1,
                                paddingBottom: 0
                            }]}>
                                <FlatListCustom
                                    showsVerticalScrollIndicator={false}
                                    inverted={false}
                                    style={{
                                        flexGrow: 1, flex: 1
                                    }}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.state.refreshing}
                                            onRefresh={this.handleRefresh}
                                        />
                                    }
                                    horizontal={false}
                                    data={this.reviews}
                                    renderItem={this.renderItemComment.bind(this)}
                                    navigation={this.props.navigation}
                                />
                                {this.state.enableLoadMore ? this.renderLoadingLoadMore() : null}
                            </View>
                            : null}
                        {this.renderFileSelectionDialog()}
                </Root>
            </Container>
        );
    }

    /**
     * Load more comment
     */
    loadMoreComment = () => {
        if (this.isLoadMore) {
            this.isLoadMore = false;
            this.filter.paging.page += 1;
            this.props.getReviewsOfProduct(this.filter);       
        }
        this.state.enableLoadMore = false;
    };

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
                        let file = {
                            fileType: "image/*",
                            filePath: uriReplace
                        };
                        console.log("URI: ", file.filePath);

                        this.imagesTemp = {
                            "image": file.filePath
                        }
                        this.setState({ imagesProduct: this.imagesTemp })
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
                this.hideDialog();
            } else if (index === 1) {
                this.onChooseImageSelling(0)
                this.hideDialog();
            }
        } else {
            this.hideDialog();
        }
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
        * Render Image
        * @param {*} imagePath
        * @param {*} type // 0: image avatar, 1: image logo vehicle
        */
    renderImage(imagePath, type, typeImage) {
        // let isSocial = !Utils.isNull(this.avatarPath) ? (this.avatarPath.indexOf("http") != -1 ? true : false) : false
        if (type == 0) {
            return (
                <ImageLoader
                    resizeModeType={"cover"}
                    style={[
                        {
                            width: SIZE_AVATAR / 2,
                            height: SIZE_AVATAR / 2,
                            marginRight: Constants.MARGIN_X_LARGE,
                            borderRadius: Constants.PADDING_24
                        }
                    ]}
                    path={imagePath}
                />
            );
        }
    }

    /**
     * render Item comment
     */
    renderItemComment = (item, index, parentIndex, indexInParent) => {
        if (!Utils.isNull(this.state.user)) {
            if (!Utils.isNull(this.state.user.avatarPath)) {
                var avatarUser = this.state.user.avatarPath.indexOf("http") != -1 ? this.state.user.avatarPath :
                    (this.resourceUrlPath.textValue + '/' + this.state.user.avatarPath)
            } else { var avatarUser = '' }
        } else { var avatarUser = '' }
        return (
            <ItemComment
                data={this.reviews}
                item={item}
                index={index}
                type={0}
                navigation={this.props.navigation}
                avatarUser={avatarUser}
                resourceUrlPath={this.resourceUrlPath}
                sellingId={this.vehicleId}
                callBack={this.handleRefresh}
            />
        )
    }

}

const mapStateToProps = state => ({
    data: state.tabComment.data,
    action: state.tabComment.action,
    isLoading: state.tabComment.isLoading,
    error: state.tabComment.error,
    errorCode: state.tabComment.errorCode
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TabCommentView);