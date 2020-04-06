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
import ic_eyes_white from "images/ic_eyes_white.png";

const window = Dimensions.get("window");

const HEIGHT_IMAGE_GRID = window.width / 2 - Constants.MARGIN_24;
const HEIGHT_IMAGE_LIST = window.width - Constants.MARGIN_XX_LARGE;
const WIDTH = "100%";
const HEIGHT = "100%";
const LINE_TITLE = 2;
const HEIGHT_TITLE = 40;
const SIZE_LOGO = 28;

export default class ItemSellerFilter extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { data, item, index, indexCol, isGridView, onPress, resource, user, showLogin, handleRefresh, numScreen, callBack, type } = this.props;
        const ImageItem = () => {
            
            let image = "";
            let hasHttp = !Utils.isNull(item.avatarPath) && item.avatarPath.indexOf('http') != -1;
                image = hasHttp ? item.avatarPath : resource + "/" + item.avatarPath;

            console.log("id: ", item.id)
            console.log("name: ", item.name)
            console.log("image: ", image)

            let heightResize = isGridView ? HEIGHT_IMAGE_GRID : HEIGHT;
            let widthResize = isGridView ? WIDTH : 150;

            return (
                <View style={{ flex: isGridView ? 1 : 1.1 }}>
                    <ImageLoader
                        resizeModeType={"cover"}
                        // resizeAtt={{ type: "resize", height: heightResize, width: widthResize }}
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
                                ]}>
                            </Text>
                        </View>
                    </View>

                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={{ flexDirection: "row" }}>
                            {/* post's time */}
                            <Text
                                style={[
                                    styles.text,
                                    {
                                        fontSize: Fonts.FONT_SIZE_SMALL,
                                        opacity: 0.5
                                    }
                                ]}>
                            </Text>
                            <Text
                                style={[
                                    styles.text,
                                    {
                                        fontSize: Fonts.FONT_SIZE_SMALL
                                    }
                                ]}
                            ></Text>
                            {/* post's provide */}
                            <Text
                                style={[
                                    styles.text,
                                    {
                                        fontSize: Fonts.FONT_SIZE_SMALL
                                    }
                                ]}
                            ></Text>
                        </View>
                    </View>
                </View>
            );
        };

        return (
            <TouchableOpacity activeOpacity={Constants.ACTIVE_OPACITY} style={{ flex: 1 }} onPress={() => onPress(item)}>
                <View>
                    <View
                        style={[
                            styles.boxView,
                            {   height: 112,
                                marginHorizontal: Constants.MARGIN_X_LARGE
                            }
                        ]}>
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <ImageItem />
                            <DataItem />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
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
