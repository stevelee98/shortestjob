import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Modal, BackHandler } from 'react-native';
import ic_minus_primary from 'images/ic_minus_primary.png';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
import { Fonts } from 'values/fonts';
import { Colors } from 'values/colors';
import ic_check_white from 'images/ic_check_white.png';
import global from 'utils/global';
import StringUtil from 'utils/stringUtil';
import I18n, { localizes } from 'locales/i18n';
import BaseView from 'containers/base/baseView';
import StorageUtil from 'utils/storageUtil';
import Utils from 'utils/utils';
import statusType from 'enum/statusType';
import FlatListCustom from 'components/flatListCustom';
const width = Dimensions.get('window').width
const height = Dimensions.get('window').height
import GridView from 'components/gridView';
import ImageViewer from 'react-native-image-zoom-viewer';
import DateUtil from 'utils/dateUtil';
const PADDING_BUTTON = Constants.PADDING_X_LARGE - 4
import moment from 'moment';
// import ic_cancel_white from 'images/ic_cancel_white.png';
import firebase from 'react-native-firebase';
import ImageLoader from 'components/imageLoader';
import ic_cancel_white from 'images/ic_cancel_white.png';
// import ImageViewer from 'react-native-image-zoom-viewer';
import { StackActions, NavigationActions } from "react-navigation";
const messageType = {
    NORMAL_MESSAGE: 1,
    IMAGE_MESSAGE: 2
}
import ic_default_user from 'images/ic_default_user.png';
const SIZE_AVATAR = 48;
const SIZE_LOGO = 32;

class ItemComment extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            language: 0,//0 vi,1 us,
            isModalOpened: false,
            isModalChildOpened: false,
            currentImageIndex: 0,
            avatarMemberChat: null,
            type: null,
            // imageComment: null
        };
        this.imageUrls = []
        this.W_H_SPECIAL = 42
        this.actionValue = {
            WAITING_FOR_USER_ACTION: 0,
            ACCEPTED: 1,
            DENIED: 2
        }
        const { data, item, index, navigation, resourceUrlPath, type, sellingId, avatarUser } = this.props;
        this.item = item
        this.resourceUrlPath = resourceUrlPath
    }

    componentWillReceiveProps = (nextProps) => {
        // this.requestInfoMemberChat()
        if (this.props != nextProps) {
            this.props = nextProps
        }
    }


    render() {
        const { data, item, index, navigation, resourceUrlPath, type, sellingId, avatarUser } = this.props;
        this.item = item
        this.data = data
        this.resourceUrlPath = !Utils.isNull(resourceUrlPath) ? resourceUrlPath : null
        this.state.type = type
        if (!Utils.isNull(this.item.latestComment)) {
            if (!Utils.isNull(this.item.latestComment.createdBy.avatarPath)) {
                var avatarLatest = this.item.latestComment.createdBy.avatarPath.indexOf("http") != -1 ? this.item.latestComment.createdBy.avatarPath :
                    (this.resourceUrlPath.textValue + '/' + this.item.latestComment.createdBy.avatarPath)
            } else { var avatarLatest = '' }
        } else { var avatarLatest = '' }
        if (!Utils.isNull(this.item.reviewer)) {
            if (!Utils.isNull(this.item.reviewer.avatarPath)) {
                var avatarReviewer = this.item.reviewer.avatarPath.indexOf("http") != -1 ? this.item.reviewer.avatarPath : this.resourceUrlPath.textValue + "/" + this.item.reviewer.avatarPath
            } else { var avatarReviewer = '' }
        } else { var avatarReviewer = '' }
        return (
            <View
                style={
                    this.state.type == 1 ?
                        { paddingVertical: Constants.MARGIN_X_LARGE, borderTopWidth: 1, borderTopColor: Colors.COLOR_BACKGROUND }
                        : this.state.type == 0 && index != 0 ?
                            { paddingVertical: Constants.MARGIN_X_LARGE, borderTopWidth: 1, borderTopColor: Colors.COLOR_BACKGROUND }
                            : { paddingBottom: Constants.MARGIN_X_LARGE }
                }>
                <View style={[
                    commonStyles.viewHorizontal,
                    commonStyles.viewCenter,
                    {
                        alignItems: 'flex-start'
                    }]}>
                    {this.renderImage(avatarReviewer)}
                    <View style={{ flex: 1 }}>

                        <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter, {}]}>
                            {/* name */}
                            <View style={[{ flex: 1 }, commonStyles.viewHorizontal,]}>
                                <View style={commonStyles.viewCenter}>
                                    <Text numberOfLines={2}
                                        style={
                                            // item.reviewer.name.length > 13
                                            // ? [commonStyles.text, { margin: 0, width: 90 }]
                                            // : [commonStyles.text, { margin: 0 }]
                                            [commonStyles.text, { margin: 0 }]
                                        }
                                    >{this.item.reviewer.name}
                                    </Text>
                                </View>
                                <View style={{ paddingLeft: 8 }}>
                                    <Text style={[commonStyles.textSmall, { margin: 0, color: Colors.COLOR_GREY_LIGHT }]}>{DateUtil.timeAgo(this.item.createdAt)}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center', justifyContent: 'space-between'
                        }} >
                            {/* content */}
                            <View style={[{ flex: 1 }]}>
                                <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_XX_SMALL, marginHorizontal: 0 }]}>
                                    {this.item.content}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[{ width: width * 0.15 }]}
                                onPress={() => {
                                    this.props.navigation.navigate('ReviewSellingVehicleDetail',
                                        {
                                            data: this.data,
                                            idComment: this.item.idComment,
                                            sellingId: sellingId,
                                            callBack: this.props.callBack
                                        }
                                    )
                                }}
                            >
                                {type != 1 ?
                                    <View style={{ flex: 0 }}>
                                        <Text style={[commonStyles.text, {
                                            margin: 0,
                                            color: Colors.COLOR_PRIMARY,
                                            fontSize: Fonts.FONT_SIZE_XX_SMALL, textAlign: 'right'
                                        }]}>Phản hồi</Text>
                                    </View>
                                    : null}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {/* image */}
                {!Utils.isNull(this.item.imageComment) ?
                    // <View>
                    <TouchableOpacity
                        onPress={() => { this.setState({ isModalOpened: true }) }}
                    >
                        <View style={{ paddingTop: Constants.PADDING_LARGE, paddingLeft: 65, }}>
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
                                path={resourceUrlPath.textValue + '/' + item.imageComment.pathToResource}
                            />
                        </View>
                    </TouchableOpacity>
                    // </View>
                    : null
                }
                {/* latest comment */}
                {!Utils.isNull(this.item.latestComment) ?
                    <View style={{}}>
                        {item.countChil != 1 ?
                            <View style={[commonStyles.text, { margin: 0, paddingLeft: 64, paddingTop: 10 }]}>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.props.navigation.navigate('ReviewSellingVehicleDetail',
                                            {
                                                data: this.data,
                                                idComment: this.item.idComment,
                                                sellingId: sellingId,
                                            }
                                        )
                                    }}
                                >
                                    <Text style={{ color: Colors.COLOR_PRIMARY }}>Xem {Utils.isNull(this.item.countChil) ? '' : this.item.countChil} phản hồi khác</Text>
                                </TouchableOpacity>
                            </View>
                            : null}
                        <View style={[commonStyles.viewHorizontal, { paddingLeft: 64, paddingTop: 8, }]}>
                            {this.renderImage(avatarLatest, 0)}
                            <View>
                                <Text>{Utils.isNull(this.item.latestComment) ? '' : this.item.latestComment.content}</Text>
                            </View>
                        </View>
                        {/* image latest */}
                        {!Utils.isNull(item.imageLatest) ?
                            <TouchableOpacity
                                onPress={() => { this.setState({ isModalChildOpened: true }) }}
                            >
                                <View style={{ paddingTop: Constants.PADDING_LARGE, paddingLeft: 65 }}>
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
                                        path={resourceUrlPath.textValue + '/' + (!Utils.isNull(item.imageLatest) ? item.imageLatest.pathToResource : null)}
                                    />
                                </View>
                            </TouchableOpacity>
                            : null}
                    </View>
                    : null}
                {this.renderOpenImage()}
                {this.renderOpenImageChild()}
            </View>
        )
    }

    /**
     * Render open image
     */
    renderOpenImage() {
        this.imageUrls = [{ url: this.resourceUrlPath.textValue + '/' + (!Utils.isNull(this.item.imageComment) ? this.item.imageComment.pathToResource : null) }]
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
     * Render open image child
     */
    renderOpenImageChild() {
        this.imageUrls = [{ url: this.resourceUrlPath + '/' + (!Utils.isNull(this.item.imageLatest) ? this.item.imageLatest.pathToResource : null) }]
        return (
            <Modal
                onRequestClose={() => this.setState({ isModalChildOpened: false })}
                visible={this.state.isModalChildOpened}
                transparent={true}>
                <ImageViewer
                    enableSwipeDown={true}
                    onCancel={() => {
                        this.setState({ isModalChildOpened: false })
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
                        this.setState({ isModalChildOpened: false })
                    }}
                >
                    <Image
                        style={{ resizeMode: 'contain' }}
                        source={ic_cancel_white} />
                </TouchableOpacity>
            </Modal>
        );
    }

    // render image
    renderImage(imagePath, typeImage) {
        if (typeImage == 0) {
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

const styles = StyleSheet.create({
    name: {
        borderTopLeftRadius: Constants.CORNER_RADIUS - 6,
        borderTopRightRadius: Constants.CORNER_RADIUS - 6,
        margin: 0,
        padding: Constants.PADDING_LARGE,
        backgroundColor: Colors.COLOR_WHITE
    },
    image: { backgroundColor: Colors.COLOR_WHITE, borderRadius: Constants.CORNER_RADIUS, borderBottomLeftRadius: 0, borderTopLeftRadius: 0, justifyContent: 'center', alignItems: 'center', paddingRight: Constants.PADDING_X_LARGE },

    buttonSpecial: {
        paddingHorizontal: Constants.PADDING_X_LARGE,
        paddingVertical: Constants.PADDING_LARGE,
    }
});

export default ItemComment;