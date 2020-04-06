import React, { PureComponent } from 'react'
import { Text, View, Dimensions, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native'
import StringUtil from 'utils/stringUtil';
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';
import { Fonts } from 'values/fonts';
import ImageLoader from 'components/imageLoader';
import commonStyles from 'styles/commonStyles';
import Utils from 'utils/utils';
import global from 'utils/global';
import screenType from 'enum/screenType';

const window = Dimensions.get('window');

const WIDTH_IMAGE = window.width / 3;
const HEIGHT_IMAGE = "100%";
const LINE_TITLE = 2;
const HEIGHT_TITLE = 40;
const SIZE_LOGO = 28;

export default class ItemOrderProduct extends PureComponent {

    render() {
        const { data, item, index, resource, fromScreen, stylePrice } = this.props
        let marginTop = Constants.MARGIN
        let marginBottom = Constants.MARGIN_LARGE + Constants.MARGIN
        let marginRight = Constants.MARGIN_X_LARGE
        let marginLeft = Constants.MARGIN_X_LARGE
        if (index % 2 == 0) {
            marginRight = Constants.MARGIN_LARGE
        } else {
            marginLeft = Constants.MARGIN_LARGE
        }

        let color = null
        let size = null
        if (fromScreen == screenType.FROM_CART) {
            item.newColors.forEach((itemColor, indexColor) => {
                if (itemColor.isSelect) {
                    color = itemColor.value
                }
            })
            item.newSizes.forEach((itemSize, indexSize) => {
                if (itemSize.isSelect) {
                    size = itemSize.name
                }
            })
        } else {
            if (!Utils.isNull(item.color)) {
                color = item.color.value
            }
            if (!Utils.isNull(item.size)) {
                size = item.size.name
            }
        }

        const ImageItem = () => {
            let image = ""
            if (!Utils.isNull(item.resourcePaths)) {
                image = !Utils.isNull(item.resourcePaths[0]) && item.resourcePaths[0].path.indexOf('http') != -1
                    ? item.resourcePaths[0].path : resource + "=" + item.resourcePaths[0].path
            }
            console.log(item.resourcePaths)
            return (
                <View style={commonStyles.viewCenter}>
                    <ImageLoader
                        resizeModeType={'cover'}
                        path={image}
                        style={{
                            width: WIDTH_IMAGE,
                            height: HEIGHT_IMAGE,
                            borderBottomLeftRadius: Constants.CORNER_RADIUS,
                            borderTopLeftRadius: Constants.CORNER_RADIUS
                        }} />
                </View>
            )
        }

        const DataItem = () => {
            return (
                <View style={styles.boxData}>
                    <Text numberOfLines={LINE_TITLE} ellipsizeMode={"tail"}
                        style={[styles.text, { height: HEIGHT_TITLE }]}>
                        {item.name}
                    </Text>
                    <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                        <View style={{
                            width: 16,
                            height: 16,
                            borderRadius: Constants.CORNER_RADIUS,
                            backgroundColor: Utils.convertColor(color),
                            marginHorizontal: Constants.MARGIN
                        }}></View>
                        <Text style={[styles.info]}>{size}</Text>
                    </View>
                    <View style={[styles.priceBox, { alignItems: 'center' }]}>
                        <Text style={[styles.text, {
                            flex: 1,
                            textAlign: 'left',
                            color: Colors.COLOR_PRIMARY
                        }, stylePrice]}>
                            {StringUtil.formatStringCashNoUnit(item.price)}
                        </Text>
                        <Text style={styles.info}>x{item.quantity}</Text>
                    </View>
                </View>
            )
        }

        return (
            <View style={[styles.boxView, { marginTop: marginTop, marginBottom: marginBottom }]}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <ImageItem />
                    <DataItem />
                </View>
            </View>
        )
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
    boxData: {
        flex: 1,
        paddingHorizontal: Constants.MARGIN_X_LARGE,
        paddingVertical: Constants.PADDING_LARGE
    },
    text: {
        ...commonStyles.text,
        flex: 1
    },
    priceBox: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    info: {
        ...commonStyles.text,
        fontSize: Fonts.FONT_SIZE_XX_SMALL
    }
});
