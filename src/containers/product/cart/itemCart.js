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
import ic_delete_white from 'images/ic_delete_white.png';

const window = Dimensions.get('window');

const WIDTH_IMAGE = window.width / 2.7;
const HEIGHT_IMAGE = "100%";
const LINE_TITLE = 2;
const SIZE_LOGO = 28;

export default class ItemCart extends PureComponent {

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            if (nextProps.isPressDelete) {
                this.scrollView.scrollTo({ x: 40 });
            } else {
                this.scrollView.scrollTo({ x: 0 });
            }
        }
    }

    render() {
        const { data, item, index, onPressItem, resource, onPressDeleteItem } = this.props
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

        const ImageItem = () => {
            let image = ""
            if (!Utils.isNull(item.resourcePaths)) {
                image = !Utils.isNull(item.resourcePaths[0]) && item.resourcePaths[0].path.indexOf('http') != -1
                    ? item.resourcePaths[0].path : resource + "=" + item.resourcePaths[0].path
            }
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
                        style={styles.text}>
                        {item.name}
                    </Text>
                    <View style={[styles.priceBox, { alignItems: 'center' }]}>
                        <Text style={[styles.text, {
                            textAlign: 'left',
                            color: Colors.COLOR_PRIMARY
                        }]}>
                            {StringUtil.formatStringCashNoUnit(item.price)}
                        </Text>
                        <Text style={[styles.text, {
                            fontSize: Fonts.FONT_SIZE_XX_SMALL,
                            opacity: 0.5,
                            textDecorationLine: 'line-through',
                            textDecorationStyle: 'solid'
                        }]}>
                            {StringUtil.formatStringCashNoUnit(item.originalPrice)}
                        </Text>
                    </View>
                    <View style={[{ flexDirection: 'row', alignItems: 'flex-start', marginTop: Constants.MARGIN_X_LARGE }]}>
                        <View style={styles.boxInfo}>
                            <Text style={styles.info}>Màu sắc</Text>
                            <View style={{
                                width: 16,
                                height: 16,
                                borderRadius: Constants.CORNER_RADIUS,
                                backgroundColor: Utils.convertColor(color),
                            }}></View>
                        </View>
                        <View style={styles.boxInfo}>
                            <Text style={styles.info}>Kích cỡ</Text>
                            <Text style={styles.info}>{size}</Text>
                        </View>
                        <View style={styles.boxInfo}>
                            <Text style={styles.info}>Số lượng</Text>
                            <Text style={styles.info}>{item.quantity}</Text>
                        </View>
                    </View>
                </View>
            )
        }

        return (
            <ScrollView
                onScroll={event => {
                    global.positionX = event.nativeEvent.contentOffset.x
                }}
                ref={ref => this.scrollView = ref}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[commonStyles.viewCenter]}
                horizontal={true}
                style={{ flex: 1, flexDirection: 'row' }} >
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    style={{ flex: 1, width: window.width }}
                    onPress={onPressItem}
                >
                    <View style={[styles.boxView, {
                        marginTop: marginTop,
                        marginBottom: marginBottom
                    }]}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <ImageItem />
                            <DataItem />
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ marginRight: Constants.MARGIN_X_LARGE }}
                    onPress={onPressDeleteItem}
                    activeOpacity={Constants.ACTIVE_OPACITY}>
                    <Image source={ic_delete_white} />
                </TouchableOpacity>
            </ScrollView>
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
        padding: Constants.MARGIN_X_LARGE
    },
    text: {
        ...commonStyles.text,
        flex: 1,
        margin: 0
    },
    priceBox: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    boxInfo: {
        flex: 1, alignItems: 'flex-start'
    },
    info: {
        ...commonStyles.text,
        fontSize: Fonts.FONT_SIZE_XX_SMALL,
        margin: 0
    }
});
