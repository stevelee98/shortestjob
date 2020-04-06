import React, { Component } from 'react';
import { View, Text, TouchableOpacity, BackHandler, Image, RefreshControl, Platform, 
    Dimensions, Modal, PermissionsAndroid, Animated, 
    ActivityIndicator, Keyboard } from 'react-native';
import BaseView from "containers/base/baseView";
import * as actions from "actions/vehicleAction";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import * as userActions from 'actions/userActions';
import ImagePicker from 'react-native-image-crop-picker';
import ImageCameraPicker from "react-native-image-picker";
import Upload from 'lib/react-native-background-upload';
import ServerPath from "config/Server";
import { Header, Container, Root, Content } from 'native-base';
import commonStyles from 'styles/commonStyles';
import { Colors } from 'values/colors';
import FlatListCustom from 'components/flatListCustom';
import ImageViewer from 'react-native-image-zoom-viewer';
import ic_cancel_white from 'images/ic_cancel_white.png';
import { Constants } from 'values/constants';
import ItemComment from 'containers/sellingVehicle/items/ItemComment'
import ic_send_image from 'images/ic_send_image.png';
import ic_send from 'images/ic_send.png';
import ic_cancel_black from 'images/ic_cancel_black.png';
import { TextInput } from 'react-native-gesture-handler';
import ImageLoader from 'components/imageLoader';
import DateUtil from 'utils/dateUtil';
import { Fonts } from 'values/fonts';
import Utils from 'utils/utils';
import ImageResizer from "react-native-image-resizer";
import DialogCustom from "components/dialogCustom";
import { localizes } from 'locales/i18n';
import statusType from 'enum/statusType';
import StorageUtil from 'utils/storageUtil';
import screenType from "enum/screenType";

const SIZE_AVATAR = 48;
const CANCEL_INDEX = 2;
const optionsCamera = {
    title: "Select avatar",
    storageOptions: {
        skipBackup: true,
        path: "images"
    }
};

class ReviewSellingVehicleDetailView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            messageText: '',
            imagesProduct: null,
            isModalOpened: false,
            visibleDialog: false
        };
        this.reviewsTempDetail = []
        this.reviews = []
        const { idComment, data, sellingId, callBack } = this.props.navigation.state.params;
        this.callBack = callBack;
        this.sellingId = sellingId
        this.idComment = idComment
        this.scrollY = new Animated.Value(0)
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        this.getSourceUrlPath();
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            //this callback is executed when your Promise is resolved
            if (!Utils.isNull(user) && user.status == statusType.ACTIVE) {            
                this.userInfo = user
            }
        })
            .catch(error => {
                //this callback is executed when your Promise is rejected
                this.saveException(error, 'componentDidMount')
            });
        this.props.getReviewsOfProductAtResponse(
            this.filter = {
                productId: this.sellingId,
                paging: {
                    pageSize: Constants.PAGE_SIZE,
                    page: 0
                },
                parentReviewId: this.idComment
            })
        this.props.getParentReview(this.idComment);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }
    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.SEND_REVIEW_SELLING_RESPONSE)) {
                    if (data) {
                        console.log('success', this.sellingId)
                        this.imagesUpload = this.state.imagesProduct
                        !Utils.isNull(this.imagesUpload) ? this.uploadVehicleImages(data.idComment) : null
                        this.onPressCancel();
                        this.reviewsTempDetail = []
                        this.props.getReviewsOfProductAtResponse(
                            this.filter = {
                                productId: this.sellingId,
                                paging: {
                                    pageSize: Constants.PAGE_SIZE,
                                    page: 0
                                },
                                parentReviewId: this.idComment
                            })
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_REVIEWS_OF_PRODUCT_RESPONSE)) {
                    if (!Utils.isNull(data.data)) {
                        this.isLoadMore = this.state.enableLoadMore = !(data.data.length < Constants.PAGE_SIZE);
                        if(this.filter.paging.page == 0 ) {
                            this.reviewsTempDetail = [];
                        }
                        if (data.data.length > 0) {
                            data.data.forEach((item, index) => {
                                this.reviewsTempDetail.push({ ...item })
                            });
                            this.reviews = this.reviewsTempDetail;
                        }
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_PARENT_REVIEW)) {
                    if(!Utils.isNull(data)) {
                        this.dataItem = data;
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    //onRefreshing
    handleRefresh = () => {
        this.setState({ messageText: null })
        this.reviewsTempDetail = []
        this.setState({
            refreshing: false
        });
        if (!Utils.isNull(this.sellingId)) {
            this.props.getReviewsOfProductAtResponse(
                this.filter = {
                    productId: this.sellingId,
                    paging: {
                        pageSize: Constants.PAGE_SIZE,
                        page: 0
                    },
                    parentReviewId: this.idComment
                })
        }
    };

    /**
     * Is scroll to end
     */
    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
    }


    // Sent Comment image
    /**
     * Choose image car
     * @param {*} typeImage 
     * @param {*} index // for type == typeImage.REGISTER_CAR
     */
    onChooseImageSelling(type, index) {
        const { imagesProduct } = this.state
        console.log('as', imagesProduct)
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
                // console.log("images: ", this.maxFileSizeUpload)
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
        this.processUploadVehicleImage(options, commentId);
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
                this.handleRefresh()
            })
        }).catch((err) => {
            this.saveException(err, 'processUploadVehicleImage')
            this.setState({
                isDisableButton: false
            })
        })
    }

    render() {
        const { idComment, data, sellingId } = this.props.navigation.state.params;
        this.avatarUser = !Utils.isNull(this.userInfo) ? this.userInfo.avatarPath.indexOf("http") != -1 
        ? this.userInfo.avatarPath : this.resourceUrlPath.textValue + '/' + this.userInfo.avatarPath : "";
        this.data = data;
        if (!Utils.isNull(this.dataItem) && !Utils.isNull(this.dataItem.reviewer.avatarPath)) {
            var avatarParent = this.dataItem.reviewer.avatarPath.indexOf("http") != -1 ? this.dataItem.reviewer.avatarPath :
                (this.resourceUrlPath.textValue + '/' + this.dataItem.reviewer.avatarPath)
        } else { var avatarParent = '' }
        return (
            <Container style={styles.container}>
                <Root>
                    {/* {Header home view} */}
                    <Header hasTabs style={[commonStyles.header, { backgroundColor: Colors.COLOR_PRIMARY }]}>
                        {this.renderHeaderView({
                            title: 'Phản hồi',
                            visibleStage: false,
                            titleStyle: { color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightHeader
                        })}
                    </Header>
                    <Content
                        onScroll={Animated.event(
                            [{
                                nativeEvent: { contentOffset: { y: this.scrollY } }
                            }],
                            {
                                listener: (event) => {
                                    if (this.isCloseToBottom(event.nativeEvent)) {
                                        this.loadMoreComment();
                                    }
                                }
                            },
                            { useNativeDriver: true }
                        )}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                    >
                        <View style={{ paddingVertical: Constants.MARGIN_X_LARGE, }}>
                            {/* item parent */}
                            {this.renderParentReview(avatarParent)}
                            {/* comments */}
                            <View style={[styles.viewChild, {
                                // marginTop: Constants.MARGIN_X_LARGE 
                                backgroundColor: Colors.COLOR_WHITE

                            }]}
                            >
                                <FlatListCustom
                                    showsVerticalScrollIndicator={false}
                                    style={{
                                        flexGrow: 1, flex: 1,
                                        paddingRight: Constants.PADDING_X_LARGE,
                                        paddingLeft: 78,
                                        backgroundColor: Colors.COLOR_WHITE
                                    }}
                                    // enableLoadMore={this.state.enableLoadMore}
                                    // enableRefresh={this.state.enableRefresh}
                                    // onLoadMore={() => {
                                    //     this.loadMoreComment();
                                    // }}
                                    horizontal={false}
                                    data={this.reviews}
                                    renderItem={this.renderItemComment}
                                />
                                {this.state.enableLoadMore ? this.renderLoadingLoadMore() : null}
                                {this.showLoadingBar(this.props.isLoading)}
                            </View>
                        </View>
                    </Content>
                    {/* image when chose */}
                    {!Utils.isNull(this.state.imagesProduct) ?
                        <View style={{
                            position: 'relative', backgroundColor: Colors.COLOR_WHITE,
                            borderTopColor: Colors.COLOR_BACKGROUND, borderTopWidth: 1,
                        }}>
                            <View style={{
                                paddingTop: Constants.MARGIN_LARGE,
                                paddingLeft: Constants.MARGIN_X_LARGE
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
                                    top: Constants.MARGIN_LARGE + 2,
                                    right: 202,
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

                    {/* Add comment */}
                    <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter, {
                        flex: 0, backgroundColor: Colors.COLOR_WHITE,
                        paddingLeft: Constants.MARGIN_X_LARGE, height: Constants.HEADER_HEIGHT,
                        borderTopColor: Colors.COLOR_BACKGROUND, borderTopWidth: 1,
                    }]}>
                        {this.renderImage(this.avatarUser, 0)}
                        <TextInput style={[commonStyles.text, {
                            borderRadius: 0, width: '100%'
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
                        />
                        {!Utils.isNull(this.state.messageText) && this.state.messageText !== "" || !Utils.isNull(this.state.imagesProduct) ?
                            <TouchableOpacity
                                style={{ marginRight: Constants.MARGIN_X_LARGE }}
                                onPress={() => {
                                    if (!Utils.isNull(this.userInfo)) {
                                        this.props.sendReviewSellingAtResponse({
                                            review: this.state.messageText,                                         
                                            productId: sellingId,
                                            parentReviewId: idComment,
                                            parentReviewerId: !Utils.isNull(this.dataItem) && this.dataItem.reviewer.id
                                        })
                                        this.setState({ messageText: null })
                                        this.handleRefresh();
                                    } else { this.showLoginView(); }
                                }
                                }
                            >
                                <Image
                                    source={ic_send}
                                    resizeMode={'cover'}
                                />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity
                                style={{ marginRight: Constants.MARGIN_X_LARGE }}
                                onPress={() => {
                                    this.attachFile()
                                    // this.onChooseImageSelling(0)
                                }}
                            >
                                <Image
                                    source={ic_send_image}
                                    resizeMode={'cover'}
                                />
                            </TouchableOpacity>
                        }
                    </View>
                    {this.renderOpenImage()}
                    {this.renderFileSelectionDialog()}
                </Root>
            </Container>
        );
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
     * On back
     */
    onBack = () => {
        if (this.props.navigation) {
            if (this.callBack != null) {
                this.callBack();
            }
            this.props.navigation.goBack();
        }
    }

    /**
     * Load more comment
     */
    loadMoreComment = () => {
        if (this.isLoadMore) {
            this.isLoadMore = false;
            this.filter.paging.page += 1
            this.props.getReviewsOfProductAtResponse(this.filter);
        }
        this.state.enableLoadMore = false;
    };

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
                        // this.imagesTemp = this.state.imagesProduct
                        let file = {
                            fileType: "image/*",
                            filePath: uriReplace
                        };
                        console.log("URI: ", file.filePath);

                        this.imagesTemp = {
                            "image": file.filePath
                        }
                        this.setState({ imagesProduct: this.imagesTemp })
                        // this.imagesTemp.push({
                        //     "image": file.filePath
                        // })
                        // if (this.imagesTemp.length > this.maximumImages) {
                        //     this.imagesTemp = this.imagesTemp.slice(0, this.maximumImages)
                        // }
                        // this.setState({
                        //     imagesProduct: this.imagesTemp,
                        //     validateImages: null
                        // })
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
     * Render open image
     */
    renderOpenImage() {
        this.imageUrls = [{ url: this.resourceUrlPath.textValue + '/' + (!Utils.isNull(this.dataItem) && !Utils.isNull(this.dataItem.imageComment) ? this.dataItem.imageComment.pathToResource : null) }]
        return (
            <Modal
                onRequestClose={() => this.setState({ isModalOpened: false })}
                visible={this.state.isModalOpened}
                transparent={true}>
                <ImageViewer
                    enableSwipeDown={true}
                    onCancel={() => {
                        this.setState({ isModalOpened: false })
                    }}
                    imageUrls={this.imageUrls}
                // index={indexZoom}
                />
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: Constants.MARGIN_XX_LARGE,
                        right: Constants.MARGIN_X_LARGE
                    }}
                    onPress={() => {
                        this.setState({ isModalOpened: false })
                    }}
                >
                    <Image
                        style={{ resizeMode: 'contain' }}
                        source={ic_cancel_white} />
                </TouchableOpacity>
            </Modal>
        );
    }

    /** 
    * Cancel sent comment image
    */
    onPressCancel = () => {
        this.setState({
            imagesProduct: null
        })
    }

    // render item
    renderItemComment = (item, index, parentIndex, indexInParent) => {
        return (
            <ItemComment
                item={item}
                type={1}
                index={index}
                resourceUrlPath={this.resourceUrlPath}
                data={this.reviews}
            />
        )
    }
    // render parent review
    renderParentReview (avatarParent) {
        return (
        <View>
        <View
         style={
            {
                paddingVertical: Constants.MARGIN_X_LARGE, backgroundColor: Colors.COLOR_WHITE,
                paddingHorizontal: Constants.PADDING_X_LARGE,
            }
        }>
            <View style={[
                commonStyles.viewHorizontal,
                commonStyles.viewCenter,
                {
                    alignItems: 'flex-start'
                }]}>
                {this.renderImage(avatarParent)}
            <View style={{ flex: 1 }}>
                <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter, {}]}>
                    {/* name */}
                    <View style={[{ flex: 1 }, commonStyles.viewHorizontal,]}>
                        <Text style={                                      
                            [commonStyles.text, { margin: 0 }]
                        }>
                        {!Utils.isNull(this.dataItem) && this.dataItem.reviewer.name}</Text>
                        <View style={{ paddingLeft: 8, }}>
                            <Text style={[commonStyles.textSmall, { margin: 0, color: Colors.COLOR_GREY_LIGHT }]}>{DateUtil.timeAgo(!Utils.isNull(this.dataItem) && this.dataItem.createdAt)}</Text>
                        </View>
                    </View>
                </View>
                {/* content */}
                <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_XX_SMALL, marginHorizontal: 0 }]}>
                    {!Utils.isNull(this.dataItem) && this.dataItem.content}
                </Text>
            </View>
            </View>
            </View>
            {/* image */}
            {!Utils.isNull(this.dataItem) && !Utils.isNull(this.dataItem.imageComment) ?
            <TouchableOpacity
                onPress={() => { this.setState({ isModalOpened: true }) }}
            >
                <View style={{
                    paddingHorizontal: Constants.PADDING_X_LARGE,
                    backgroundColor: Colors.COLOR_WHITE,
                    paddingBottom: Constants.PADDING_LARGE, paddingLeft: 78,
                }}>
                <ImageLoader
                    resizeModeType={"cover"}
                    // resizeAtt={{ type: "thumbnail", width: SIZE_AVATAR, height: SIZE_AVATAR }}
                    style={[
                        {
                        width: 200,
                        height: 100,
                        borderRadius: 10,
                        marginRight: Constants.MARGIN_X_LARGE,
                        borderRadius: Constants.PADDING_24
                        }
                    ]}
                    path={this.resourceUrlPath.textValue + '/' + !Utils.isNull(this.dataItem) && this.dataItem.imageComment.pathToResource}
                />
                </View>
            </TouchableOpacity> : null }
        </View>
        );
    }

    // render image
    renderImage(imagePath, type) {
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
        } else {
            return (
                <ImageLoader
                    resizeModeType={"cover"}
                    style={[
                        {
                            width: SIZE_AVATAR,
                            height: SIZE_AVATAR,
                            marginRight: Constants.MARGIN_X_LARGE,
                            borderRadius: Constants.PADDING_24
                        }
                    ]}
                    path={imagePath}
                />
            );
        }
    }
}

const mapStateToProps = state => ({
    data: state.reviewSellingVehicleDetail.data,
    isLoading: state.reviewSellingVehicleDetail.isLoading,
    error: state.reviewSellingVehicleDetail.error,
    errorCode: state.reviewSellingVehicleDetail.errorCode,
    action: state.reviewSellingVehicleDetail.action,
    count: state.reviewSellingVehicleDetail.count
});

const mapDispatchToProps = {
    ...actions,
    ...userActions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ReviewSellingVehicleDetailView);
