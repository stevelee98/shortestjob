import React, { PureComponent } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, ImageBackground } from 'react-native';
import BaseView from 'containers/base/baseView';
import { Colors } from 'values/colors';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import { Fonts } from 'values/fonts';
import { Constants } from 'values/constants';
import StringUtil from 'utils/stringUtil';
import Utils from 'utils/utils';
import ImageLoader from 'components/imageLoader';
import ImageInterest from 'containers/sellingVehicle/imageInterest';
import StarRating from 'components/starRating';

const window = Dimensions.get('window');

const SIZE_BOX = window.width / 2.5;
const WIDTH_IMAGE = "100%";
const HEIGHT_TITLE = 40;
const LINE_TITLE = 2;
const SIZE_LOGO = 28;

export default class ItemProductSmall extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
        }
    }


    render() {
        const { data, item, index, onPress, resource, enableLoadMore } = this.props;
        let image = ""
        if (!Utils.isNull(item.resourcePaths)) {
            image = !Utils.isNull(item.resourcePaths[0]) && item.resourcePaths[0].path.indexOf('http') != -1
                ? item.resourcePaths[0].path : resource + "=" + item.resourcePaths[0].path
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
        const DataItem = () => {
            return (
                <View style={styles.boxData}>
                    <StarRating ratingObj={ratingObj} styleImage={{ width: 8, height: 8 }} />
                    <Text numberOfLines={LINE_TITLE} ellipsizeMode={"tail"}
                        style={[styles.text, {
                            color: Colors.COLOR_TEXT,
                            height: HEIGHT_TITLE,
                            marginBottom: Constants.MARGIN_LARGE,
                            fontSize: Fonts.FONT_SIZE_MEDIUM - 1
                        }]}>
                        {item.name}
                    </Text>
                    <View style={[styles.priceBox, { alignItems: 'center' }]}>
                        <Text style={[styles.text, {
                            flex: 1,
                            color: Colors.COLOR_PRIMARY,
                            textAlign: 'left',
                            fontSize: Fonts.FONT_SIZE_MEDIUM - 1
                        }]}>
                            {StringUtil.formatStringCashNoUnit(parseItem.priceForMember)}
                        </Text>
                        <Text style={[styles.text, {
                            flex: 0,
                            textAlign: 'right',
                            fontSize: Fonts.FONT_SIZE_X_SMALL - 2,
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
                            fontSize: Fonts.FONT_SIZE_X_SMALL - 2,
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
            <TouchableOpacity activeOpacity={Constants.ACTIVE_OPACITY} style={{
                flex: 1
            }} onPress={() => onPress(item)}>
                <View style={[styles.boxView, {
                    marginLeft: index == 0 ? Constants.MARGIN_X_LARGE : Constants.MARGIN_LARGE,
                    marginRight: index == data.length - 1 ? enableLoadMore ? Constants.MARGIN_LARGE : Constants.MARGIN_X_LARGE : Constants.MARGIN_LARGE,
                    marginTop: Constants.MARGIN,
                    marginHorizontal: Constants.MARGIN_LARGE,
                    marginBottom: Constants.MARGIN_12
                }]}>
                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1 }}>
                            <ImageLoader
                                resizeModeType={'cover'}
                                path={image}
                                // resizeAtt={{ type: 'resize', height: SIZE_BOX }}
                                style={styles.imageNewProduct} />
                        </View>
                        <DataItem />
                    </View>
                </View>
            </TouchableOpacity>
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
        // ...commonStyles.shadowOffset,
        flex: 1,
        backgroundColor: Colors.COLOR_WHITE,
        // borderRadius: Constants.CORNER_RADIUS,
        width: SIZE_BOX
    },
    image: {
        width: WIDTH_IMAGE,
        height: SIZE_BOX,
        borderTopLeftRadius: Constants.CORNER_RADIUS,
        borderTopRightRadius: Constants.CORNER_RADIUS,
    },
    boxData: {
        flex: 1,
        paddingHorizontal: Constants.MARGIN_X_LARGE,
        marginVertical: Constants.MARGIN_X_LARGE - Constants.MARGIN
    },
    text: {
        ...commonStyles.text,
        color: Colors.COLOR_TEXT,
        margin: 0

    },
    logo: {
        justifyContent: 'flex-end',
        width: SIZE_LOGO,
        height: SIZE_LOGO
    },
    imageNewProduct: {
        width: "100%",
        height: window.width / 2.5,
        // borderTopLeftRadius: Constants.CORNER_RADIUS,
        // borderTopRightRadius: Constants.CORNER_RADIUS,
    },
    priceBox: {
        flexDirection: 'row'
    },
});

