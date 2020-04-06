import React, { PureComponent } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, ImageBackground } from 'react-native';
import BaseView from 'containers/base/baseView';
import { Colors } from 'values/colors';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import { Fonts } from 'values/fonts';
import { Constants } from 'values/constants';
import StringUtil from 'utils/stringUtil';
import ic_logo_large from "images/ic_logo_large.png";
import Utils from 'utils/utils';
import ImageLoader from 'components/imageLoader';
import ImageInterest from '../imageInterest';

const window = Dimensions.get('window');

const SIZE_BOX = window.width / 2.5;
const WIDTH_IMAGE = "100%";
const HEIGHT_TITLE = 40;
const LINE_TITLE = 2;
const SIZE_LOGO = 28;

export default class ItemNewsSellingVehicleInterest extends PureComponent {

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
        if (!Utils.isNull(item.listImage)) {
            image = !Utils.isNull(item.listImage[0]) && item.listImage[0].pathToResource.indexOf('http') != -1
                ? item.listImage[0].pathToResource : resource + "=" + item.listImage[0].pathToResource
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
                            <ImageInterest image={image} />
                        </View>
                        <View style={styles.boxData}>
                            <Text
                                numberOfLines={LINE_TITLE}
                                ellipsizeMode={"tail"}
                                style={[styles.text, {
                                    height: HEIGHT_TITLE,
                                    fontSize: Fonts.FONT_SIZE_MEDIUM - 1
                                }]}>
                                {item.name}
                            </Text>
                            <Text style={[styles.text, {
                                color: Colors.COLOR_PRIMARY,
                                fontSize: Fonts.FONT_SIZE_MEDIUM - 1,
                                marginVertical: Constants.MARGIN / 2
                            }]}>
                                {StringUtil.formatStringCashNoUnit(item.price)}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ flex: 1, height: SIZE_LOGO }}>
                                    <Text style={[styles.text, {
                                        fontSize: Fonts.FONT_SIZE_SMALL
                                    }]}>
                                        {item.province}
                                    </Text>
                                    <Text style={[styles.text, {
                                        fontSize: Fonts.FONT_SIZE_SMALL - 1,
                                        opacity: 0.5,
                                        marginTop: -(Constants.MARGIN / 2)
                                    }]}>
                                        {DateUtil.timeAgo(item.createdAt)}
                                    </Text>
                                </View>
                                {item.accredited ? <Image source={ic_logo_large} style={styles.logo}></Image> : null}
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    boxView: {
        ...commonStyles.shadowOffset,
        flex: 1,
        backgroundColor: Colors.COLOR_WHITE,
        borderRadius: Constants.CORNER_RADIUS,
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
    }
});

