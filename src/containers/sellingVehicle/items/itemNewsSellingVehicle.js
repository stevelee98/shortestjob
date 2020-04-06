import React, { PureComponent } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ImageBackground } from "react-native";
import BaseView from "containers/base/baseView";
import { Colors } from "values/colors";
import commonStyles from "styles/commonStyles";
import DateUtil from "utils/dateUtil";
import ic_logo_large from "images/ic_logo_large.png";
import { Fonts } from "values/fonts";
import { Constants } from "values/constants";
import StringUtil from "utils/stringUtil";
import Utils from "utils/utils";
import ImageLoader from "components/imageLoader";
import itemSellingVehicleType from "enum/itemSellingVehicleType";
import IconFavorite from "./iconFavorite";
import approvalStatusType from 'enum/approvalStatusType';
import statusType from "enum/statusType";
import pinStatus from "enum/pinStatus";
import ic_eyes_white from "images/ic_eyes_white.png";
import ic_medal_gray from "images/ic_medal_gray.png";

const window = Dimensions.get("window");

const HEIGHT_IMAGE_GRID = window.width / 2 - Constants.MARGIN_24;
const HEIGHT_IMAGE_LIST = window.width - Constants.MARGIN_XX_LARGE;
const WIDTH = "100%";
const HEIGHT = "100%";
const LINE_TITLE = 2;
const HEIGHT_TITLE = 40;
const SIZE_LOGO = 28;

export default class ItemNewsSellingVehicle extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { data, item, index, indexCol, banner, isGridView, onPress, resource, user, showLogin, handleRefresh, numScreen, callBack, type } = this.props;
        const ImageItem = () => {
            let image = "";
            if (!Utils.isNull(item.listImage)) {
                image =
                    !Utils.isNull(item.listImage[0]) && item.listImage[0].pathToResource.indexOf("http") != -1
                        ? item.listImage[0].pathToResource
                        : resource + "=" + item.listImage[0].pathToResource;
            }
            let heightResize = isGridView ? HEIGHT_IMAGE_GRID : HEIGHT;
            let widthResize = isGridView ? WIDTH : 150;

            return (
                <View style={{ flex: isGridView ? 1 : 1.1 }}>
                    <ImageLoader
                        resizeModeType={"cover"}
                        resizeAtt={{ type: "resize", height: heightResize, width: widthResize }}
                        path={image}
                        style={[
                            styles.image,
                            {
                                height: heightResize,
                                borderTopLeftRadius: Constants.CORNER_RADIUS,
                                borderTopRightRadius: isGridView ? Constants.CORNER_RADIUS : 0,
                                borderBottomLeftRadius: !isGridView ? Constants.CORNER_RADIUS : 0
                            }
                        ]}
                    />
                    <View
                        style={[commonStyles.viewHorizontal, {
                            position: 'absolute', bottom: -Constants.MARGIN_X_LARGE,
                            marginLeft: Constants.MARGIN_LARGE
                        }]}
                    >
                        <View style={[{ marginBottom: Constants.MARGIN_X_LARGE }]}>
                            <Image source={ic_eyes_white} />
                        </View>
                        <Text ellipsizeMode={"tail"}
                            style={[commonStyles.text, {
                                textAlign: 'left',
                                color: Colors.COLOR_WHITE,
                                fontSize: Fonts.FONT_SIZE_X_MEDIUM,
                                height: 40,
                                marginLeft: Constants.MARGIN
                            }]}>
                            {item.viewCount}
                        </Text>
                    </View>
                </View>
            );
        };

        const DataItem = () => {
            return (
                <View style={styles.boxData}>
                    <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={{ flex: 1, }}>
                            {/* item's name */}
                            <Text numberOfLines={LINE_TITLE} ellipsizeMode={"tail"} style={[styles.text]}>
                                {item.name}
                            </Text>
                            {/* item's cash */}
                            <Text
                                style={[
                                    styles.text,
                                    {
                                        color: Colors.COLOR_RED_LIGHT,
                                        height: HEIGHT_TITLE
                                    }
                                ]}
                            >
                                {StringUtil.formatStringCashNoUnit(item.price)}
                            </Text>
                        </View>
                        {/* item's icon */}
                        <View>
                            {item.accredited ? <Image source={ic_logo_large} style={styles.logo} /> : null}
                            <IconFavorite
                                item={item}
                                user={user}
                                showLogin={showLogin}
                                handleRefresh={handleRefresh}
                                callBack={callBack}
                            />
                        </View>
                    </View>
                   
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <Text style={[commonStyles.textSmall, { margin: 0, marginTop: Constants.MARGIN, color: Colors.COLOR_GREY_LIGHT }]}>
                            {this.getStateApproval(item.status, item.approvalStatus)}
                        </Text>
                        <View style={{ flexDirection: "row" }}>
                            {/* icon pin post */}
                            { item.pinStatus == pinStatus.PIN_POST ?
                            <View style={{ flexDirection: "row" }}>
                            <Image source = {ic_medal_gray} />
                            <Text
                                style={[
                                    styles.text,
                                    {
                                        fontSize: Fonts.FONT_SIZE_SMALL
                                    }
                                ]}
                            > | </Text>
                            </View> : null }
                            {/* post's time */}
                            <Text
                                style={[
                                    styles.text,
                                    {
                                        fontSize: Fonts.FONT_SIZE_SMALL,
                                        opacity: 0.5
                                    }
                                ]}
                            >
                                {/* {DateUtil.timeAgo(numScreen == null ? item.createdAt : item.deletedAt)} */}
                                {DateUtil.convertFromFormatToFormat(numScreen == null ? item.createdAt : item.deletedAt, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE_TIME_ZONE_A)}
                            </Text>
                            <Text
                                style={[
                                    styles.text,
                                    {
                                        fontSize: Fonts.FONT_SIZE_SMALL
                                    }
                                ]}
                            > | </Text>
                            {/* post's provide */}
                            <Text
                                style={[
                                    styles.text,
                                    {
                                        fontSize: Fonts.FONT_SIZE_SMALL
                                    }
                                ]}
                            >
                                {item.province}
                            </Text>
                        </View>
                    </View>
                </View>
            );
        };

        const BannerAds = () => {
            let heightImage = isGridView ? HEIGHT_IMAGE_GRID * Utils.sizeBanner(item.ratio) : HEIGHT_IMAGE_LIST * Utils.sizeBanner(item.ratio);
            let image = !Utils.isNull(banner) 
                && banner.length > 0 && !Utils.isNull(banner[0].pathToResource) 
                    ? banner[0].pathToResource.indexOf("http") != -1 
                    ? banner[0].pathToResource : resource + "=" + banner[0].pathToResource : "";
            return (
                <View style={{ flex: 1 }}>
                    <ImageLoader
                        resizeModeType={"cover"}
                        path={image}
                        resizeAtt={{ type: 'resize', height: heightImage }}
                        style={[
                            styles.image,
                            {
                                height: heightImage,
                                borderRadius: Constants.CORNER_RADIUS
                            }
                        ]}
                    />
                </View>
            );
        };

        return (
            <TouchableOpacity activeOpacity={Constants.ACTIVE_OPACITY} style={{ flex: 1 }} onPress={() => onPress(item)}>
                {isGridView
                    ? <View
                        style={[
                            styles.boxView,
                            {
                                marginLeft: indexCol == 0 ? Constants.MARGIN_X_LARGE : Constants.MARGIN_LARGE,
                                marginRight: indexCol == 1 ? Constants.MARGIN_X_LARGE : Constants.MARGIN_LARGE
                            }
                        ]}
                    >
                        {item.itemType == itemSellingVehicleType.ITEM_SELLING_VEHICLE
                            ? <View style={{ flex: 1 }}>
                                <ImageItem />
                                <DataItem />
                            </View>
                            : <BannerAds />
                        }
                    </View>
                    :
                    /* selling item */
                    <View>
                        <View
                            style={[
                                styles.boxView,
                                item.itemType == itemSellingVehicleType.ITEM_SELLING_VEHICLE || type == itemSellingVehicleType.ITEM_SELLING_VEHICLE
                                    ? {
                                        height: 112,
                                        marginHorizontal: Constants.MARGIN_X_LARGE
                                    } : { marginHorizontal: Constants.MARGIN_X_LARGE }
                            ]}
                        >
                            {item.itemType == itemSellingVehicleType.ITEM_SELLING_VEHICLE || type == itemSellingVehicleType.ITEM_SELLING_VEHICLE
                                ?
                                <View style={{ flex: 1, flexDirection: "row" }}>
                                    <ImageItem />
                                    <DataItem />
                                </View>
                                :
                                <BannerAds />
                            }
                        </View>
                    </View>

                }
            </TouchableOpacity>
        );
    }

    /**
     * Get state approval
     */
    getStateApproval(sellingStatus, approvalStatus) {
        if (sellingStatus == statusType.ACTIVE && approvalStatus == approvalStatusType.APPROVED) {
            // return "Đã được duyệt";
            return "";
        } else if (sellingStatus == statusType.DRAFT && approvalStatus == approvalStatusType.WAITING_FOR_APPROVAL) {
            return "Đang chờ duyệt";
        } else if (sellingStatus == statusType.ACTIVE && approvalStatus == approvalStatusType.REJECTED) {
            return "Đã bị từ chối";
        } else if (sellingStatus == statusType.DELETE) {
            return "Đã xoá";
        } else {
            return "";
        }
    }
}

const styles = StyleSheet.create({
    boxView: {
        flex: 1,
        borderRadius: Constants.CORNER_RADIUS,
        backgroundColor: Colors.COLOR_WHITE,
        marginTop: Constants.MARGIN_LARGE,
        marginBottom: Constants.MARGIN_LARGE
    },
    image: {
        width: WIDTH,
        height: HEIGHT
    },
    boxData: {
        flex: 2,
        paddingHorizontal: Constants.MARGIN_X_LARGE,
        marginVertical: Constants.MARGIN_LARGE
    },
    text: {
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
        color: Colors.COLOR_TEXT,
        margin: 0
    },
    logo: {
        justifyContent: "flex-end",
        width: SIZE_LOGO,
        height: SIZE_LOGO
    }
});
