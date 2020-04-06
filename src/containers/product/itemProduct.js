import React, { PureComponent } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import BaseView from 'containers/base/baseView';
import { Colors } from 'values/colors';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import { Fonts } from 'values/fonts';
import { Constants } from 'values/constants';
import StringUtil from 'utils/stringUtil';
import Utils from 'utils/utils';
import ImageLoader from 'components/imageLoader';
import StarRating from 'components/starRating';
import img_ribbon_out_of_stock from 'images/img_ribbon_out_of_stock.png';

const window = Dimensions.get('window');

const WIDTH_IMAGE_GRID = window.width / 2.5;
const WIDTH_IMAGE = window.width / 3;
const HEIGHT_IMAGE = window.width / 3;
const LINE_TITLE = 2;
const HEIGHT_TITLE = 40;
const SIZE_LOGO = 28;

export default class ItemProduct extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { data, item, index, isGridView, onPressItem, resource } = this.props
        let marginTop = Constants.MARGIN
        let marginBottom = Constants.MARGIN_LARGE + Constants.MARGIN
        let marginRight = Constants.MARGIN_X_LARGE
        let marginLeft = Constants.MARGIN_X_LARGE
        if (index % 2 == 0) {
            marginRight = Constants.MARGIN_LARGE
        } else {
            marginLeft = Constants.MARGIN_LARGE
        }

        let parseItem = null
        let ratings = null
        let views = null
        let ratingObj = null
        if (!Utils.isNull(item)) {
            parseItem = {
                price: !Utils.isNull(item.price) ? item.price.price : 0,
                originalPrice: !Utils.isNull(item.price) ? item.price.originalPrice : 0,
                priceForMember: !Utils.isNull(item.price) ? item.price.priceForMember : 0
            }
            ratings = item.reviews.reduce(this.totalStar, 0)
            views = item.reviews.length
            ratingObj = {
                ratings: Math.round(ratings / views),
                views: views
            }
        }

        const ImageItem = () => {
            let image = ""
            if (!Utils.isNull(item.resourcePaths)) {
                image = !Utils.isNull(item.resourcePaths[0]) && item.resourcePaths[0].path.indexOf('http') != -1
                    ? item.resourcePaths[0].path : resource + "=" + item.resourcePaths[0].path
            }
            return (
                <View style={isGridView ? styles.imageGrid : styles.imageList}>
                    <ImageLoader
                        resizeModeType={'cover'}
                        // resizeAtt={{ type: 'resize', isGridView ? WIDTH_IMAGE_GRID : "100%" }}
                        path={image}
                        style={[styles.image, {
                            width: isGridView ? "100%" : WIDTH_IMAGE,
                            height: isGridView ? WIDTH_IMAGE_GRID : "100%",
                            borderBottomLeftRadius: isGridView ? 0 : Constants.CORNER_RADIUS,
                            borderBottomRightRadius: 0,
                            borderTopLeftRadius: isGridView ? Constants.CORNER_RADIUS : Constants.CORNER_RADIUS,
                            borderTopRightRadius: isGridView ? Constants.CORNER_RADIUS : 0
                        }]} />
                </View>
            )
        }

        const DataItem = () => {
            return (
                <View style={styles.boxData}>
                    <StarRating ratingObj={ratingObj} styleImage={{ width: 8, height: 8 }} />
                    <Text numberOfLines={LINE_TITLE} ellipsizeMode={"tail"}
                        style={[styles.text, {
                            color: Colors.COLOR_TEXT,
                            height: HEIGHT_TITLE,
                            marginBottom: Constants.MARGIN_LARGE
                        }]}>
                        {item.name}
                    </Text>
                    <View style={[styles.priceBox, { alignItems: 'center' }]}>
                        <Text style={[styles.text, {
                            flex: 1,
                            color: Colors.COLOR_PRIMARY,
                            textAlign: 'left'
                        }]}>
                            {StringUtil.formatStringCashNoUnit(parseItem.priceForMember)}
                        </Text>
                        <Text style={[styles.text, {
                            flex: 0,
                            textAlign: 'right',
                            fontSize: Fonts.FONT_SIZE_X_SMALL,
                            color: Colors.COLOR_TEXT
                        }]}>
                            {StringUtil.formatStringCashNoUnit(parseItem.price)}
                        </Text>
                    </View>
                    <View style={[styles.priceBox, { alignItems: 'center' }]}>
                        <Text style={[styles.text, {
                            flex: 1,
                            textAlign: 'left',
                            fontSize: 8,
                            opacity: 0.5
                        }]}>
                            Dành cho thành viên
                             </Text>
                        <Text style={[styles.text, {
                            flex: 0,
                            textAlign: 'right',
                            fontSize: Fonts.FONT_SIZE_X_SMALL,
                            color: Colors.COLOR_TEXT,
                            opacity: 0.5,
                            textDecorationLine: 'line-through',
                            textDecorationStyle: 'solid'
                        }]}>
                            {StringUtil.formatStringCashNoUnit(parseItem.originalPrice)}
                        </Text>
                    </View>
                </View>
            )
        }

        return (
            !Utils.isNull(item)
                ? <View>
                    <TouchableOpacity activeOpacity={Constants.ACTIVE_OPACITY} style={{ flex: 1 }} onPress={onPressItem}>
                        {isGridView ?
                            <View style={[styles.boxGrid, {
                                marginRight: marginRight,
                                marginLeft: marginLeft,
                                width: window.width / 2 - (Constants.MARGIN_X_LARGE + Constants.MARGIN_LARGE)
                            }]}>
                                {!Utils.isNull(item)
                                    ? <View style={{ flex: 1 }}>
                                        <ImageItem />
                                        <DataItem />
                                    </View>
                                    : <View style={{ flex: 1 }} />
                                }
                            </View>
                            :
                            <View style={[styles.boxView, {
                                marginTop: marginTop,
                                marginBottom: marginBottom
                            }]}>
                                {!Utils.isNull(item)
                                    ? <View style={{ flex: 1, flexDirection: 'row' }}>
                                        <ImageItem />
                                        <DataItem />
                                    </View>
                                    : <View style={{ flex: 1 }} />
                                }
                            </View>
                        }
                    </TouchableOpacity>
                    {!item.availableToMemberOnly
                        ? <View style={{ position: 'absolute', top: 0, left: isGridView ? marginLeft - Constants.MARGIN : Constants.MARGIN_LARGE + Constants.MARGIN }}>
                            <Image style={{ width: 54, height: 54 }} source={img_ribbon_out_of_stock} />
                        </View>
                        : null
                    }
                </View>
                : null
        );
    }

    /**
     * Total star
     * @param {*} accumulator 
     * @param {*} item 
     */
    totalStar(accumulator, item) {
        return accumulator + item.star
    }
}

const styles = StyleSheet.create({
    boxView: {
        ...commonStyles.shadowOffset,
        flex: 1,
        borderRadius: Constants.CORNER_RADIUS,
        backgroundColor: Colors.COLOR_WHITE,
        marginHorizontal: Constants.MARGIN_X_LARGE,
        alignItems: 'flex-start'
    },
    boxGrid: {
        ...commonStyles.shadowOffset,
        backgroundColor: Colors.COLOR_WHITE,
        borderRadius: Constants.CORNER_RADIUS,
        marginBottom: Constants.MARGIN_X_LARGE - Constants.MARGIN,
        marginTop: Constants.MARGIN
    },
    boxData: {
        flex: 1,
        padding: Constants.MARGIN_X_LARGE
    },
    text: {
        ...commonStyles.text,
        flex: 1,
        color: Colors.COLOR_TEXT,
        margin: 0
    },
    priceBox: {
        flexDirection: 'row'
    },
    imageGrid: {
        flex: 1
    },
    imageList: {
        ...commonStyles.viewCenter
    }
});
