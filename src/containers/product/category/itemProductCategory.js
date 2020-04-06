import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import BaseView from 'containers/base/baseView';
import { Colors } from 'values/colors';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import { Fonts } from 'values/fonts';
import { Constants } from 'values/constants';
import StringUtil from 'utils/stringUtil';
import Utils from 'utils/utils';
import ImageLoader from 'components/imageLoader';
import ic_default_user from 'images/ic_default_user.png';

const window = Dimensions.get('window');

const SIZE_BOX = window.width / 2.5;
const WIDTH_IMAGE = "100%";
const HEIGHT_IMAGE = "100%";
const LINE_TITLE = 2;
const SIZE_LOGO = 28;

export default class ItemProductType extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { data, item, index, onPressItem, isGridView, resource } = this.props;
        let marginTop = Constants.MARGIN
        let marginRight = Constants.MARGIN_X_LARGE
        let marginLeft = Constants.MARGIN_X_LARGE
        if (index % 2 == 0) {
            marginRight = Constants.MARGIN_LARGE
        } else {
            marginLeft = Constants.MARGIN_LARGE
        }
        let pathResource = !Utils.isNull(item)
            ? !Utils.isNull(item.logoPath)
                ? {
                    uri: item.logoPath.indexOf('http') != -1 ? item.logoPath : (!Utils.isNull(resource) ? resource : null) + "/" + item.logoPath
                } : ic_default_user
            : null
        const DataItem = () => {
            return (
                <View style={{ flex: 1 }}>
                    <ImageBackground source={pathResource} style={[styles.cardView]} imageStyle={{ borderRadius: Constants.CORNER_RADIUS }}>
                        <View style={styles.boxData}>
                            <Text numberOfLines={LINE_TITLE} ellipsizeMode={"tail"}
                                style={[styles.text, {
                                    textAlign: 'left',
                                    color: Colors.COLOR_WHITE,
                                    fontSize: Fonts.FONT_SIZE_X_MEDIUM,
                                    height: 48
                                }]}>
                                {item.name}
                            </Text>
                        </View>
                    </ImageBackground>
                </View>
            )
        }

        return (
            !Utils.isNull(item)
                ? <TouchableOpacity activeOpacity={Constants.ACTIVE_OPACITY} style={{ flex: 1 }} onPress={onPressItem}>
                    {isGridView
                        ? <View style={[styles.boxView, {
                            marginRight: marginRight,
                            marginLeft: marginLeft,
                            marginTop: marginTop,
                            width: window.width / 2 - (Constants.MARGIN_X_LARGE + Constants.MARGIN_LARGE)
                        }]}>
                            <DataItem />
                        </View>
                        : <View style={[styles.boxView, {
                            marginRight: index == data.length - 1 ? Constants.MARGIN_X_LARGE : Constants.MARGIN_LARGE,
                            marginLeft: index == 0 || index == 1 ? Constants.MARGIN_X_LARGE : Constants.MARGIN_LARGE,
                            marginTop: index % 2 != 0 ? Constants.MARGIN : 0,
                            width: window.width - (Constants.MARGIN_XX_LARGE)
                        }]}>
                            <DataItem />
                        </View>
                    }
                </TouchableOpacity>
                : isGridView
                    ? <View style={[styles.boxView, {
                        marginRight: marginRight,
                        marginLeft: marginLeft,
                        marginTop: marginTop,
                        width: window.width / 2 - (Constants.MARGIN_X_LARGE + Constants.MARGIN_LARGE),
                        backgroundColor: Colors.COLOR_TRANSPARENT
                    }]} />
                    : <View style={[styles.boxView, {
                        marginRight: index == data.length - 1 ? Constants.MARGIN_X_LARGE : Constants.MARGIN_LARGE,
                        marginLeft: index == 0 || index == 1 ? Constants.MARGIN_X_LARGE : Constants.MARGIN_LARGE,
                        marginTop: index % 2 != 0 ? Constants.MARGIN : 0,
                        width: window.width - (Constants.MARGIN_XX_LARGE),
                        backgroundColor: Colors.COLOR_TRANSPARENT
                    }]} />
        );
    }
}

const styles = StyleSheet.create({
    cardView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    boxView: {
        flex: 1,
        backgroundColor: Colors.COLOR_WHITE,
        marginBottom: Constants.MARGIN_LARGE + Constants.MARGIN,
        borderRadius: Constants.CORNER_RADIUS
    },
    image: {
        width: WIDTH_IMAGE,
        height: HEIGHT_IMAGE
    },
    boxData: {
        width: "100%",
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: Constants.MARGIN_X_LARGE,
        paddingBottom: Constants.MARGIN_XX_LARGE * 2,
        borderRadius: Constants.CORNER_RADIUS
    },
    text: {
        ...commonStyles.textBold,
        color: Colors.COLOR_TEXT,
        margin: 0

    },
    logo: {
        justifyContent: 'flex-end',
        width: SIZE_LOGO,
        height: SIZE_LOGO
    }
});
