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
import StarRating from 'react-native-star-rating';
import { StackActions, NavigationActions } from "react-navigation";
const messageType = {
    NORMAL_MESSAGE: 1,
    IMAGE_MESSAGE: 2
}
import ic_default_user from 'images/ic_default_user.png';
const SIZE_AVATAR = 48;
const SIZE_LOGO = 32;

class ItemRate extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
        };
        const { item, index, resourceUrlPath } = this.props
        this.item = item;
        this.index = index;
        this.resourceUrlPath = resourceUrlPath;
    }

    componentWillReceiveProps = (nextProps) => {
        if (this.props != nextProps) {
            this.props = nextProps
        }
    }


    render() {
        if (!Utils.isNull(this.item.reviewer)) {
            if (!Utils.isNull(this.item.reviewer.avatarPath)) {
                var avatarReviewer = this.item.reviewer.avatarPath.indexOf("http") != -1 ? this.item.reviewer.avatarPath :
                    (typeof this.resourceUrlPath == 'string' ?
                        (this.resourceUrlPath + "/" + this.item.reviewer.avatarPath) :
                        (this.resourceUrlPath.textValue + "/" + this.item.reviewer.avatarPath))
            } else { var avatarReviewer = '' }
        } else { var avatarReviewer = '' }
        return (
            <View>
                {this.index == 0 ? null :
                    <View style={[{ borderWidth: 1, borderColor: Colors.COLOR_BACKGROUND }]}></View>
                }
                <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter, {
                    alignItems: 'flex-start', paddingTop: Constants.PADDING_X_LARGE
                }]}>
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
                        path={avatarReviewer}
                    />
                    <View style={{ flex: 1, marginRight: Constants.MARGIN_X_LARGE }}>
                        <Text style={[commonStyles.textBold, { margin: 0 }]}>{this.item.reviewer.name}</Text>
                        <View style={[{
                            flexDirection: 'row',
                            alignItems: 'center', justifyContent: 'space-between'
                        }]}>
                            <Text style={[commonStyles.text,
                            {
                                fontSize: Fonts.FONT_SIZE_XX_SMALL,
                                marginHorizontal: 0,
                                color: Colors.COLOR_GREY_LIGHT
                            }]}>
                                {DateUtil.timeAgo(this.item.createdAt)}
                            </Text>
                            <View style={[commonStyles.viewCenter, {}]}>
                                <StarRating
                                    iconSet={'MaterialIcons'}
                                    fullStar={'star'}
                                    halfStar={'star-half'}
                                    emptyStar={'star'}
                                    emptyStarColor={'#A0A5AF'}
                                    fullStarColor={Colors.COLOR_GOLD}
                                    starSize={Fonts.FONT_SIZE_MEDIUM}
                                    disabled={true}
                                    maxStars={5}
                                    rating={this.item.star}
                                    starStyle={{ margin: 0 }}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ paddingTop: Constants.PADDING_LARGE, paddingBottom: Constants.PADDING_X_LARGE }}>
                    <Text style={[commonStyles.text, { margin: 0 }]}>{this.item.content}</Text>
                </View>
            </View>
        )
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

export default ItemRate;