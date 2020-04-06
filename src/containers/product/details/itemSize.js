import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Modal, BackHandler } from 'react-native';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
import { Fonts } from 'values/fonts';
import { Colors } from 'values/colors';
import ic_check_white from 'images/ic_check_white.png';
import global from 'utils/global';
import StringUtil from 'utils/stringUtil';
import I18n from 'locales/i18n';
import BaseView from 'containers/base/baseView';
const width = Dimensions.get('window').width - (Constants.MARGIN_XX_LARGE * 2.5)
const height = Dimensions.get('window').height
import DateUtil from 'utils/dateUtil';
const PADDING_BUTTON = Constants.PADDING_X_LARGE - 4
import ImageLoader from 'components/imageLoader';

class ItemSize extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            opacity: 0,
            indexColor: 0
        };
    }

    componentWillMount = () => {
    }

    componentWillReceiveProps = (nextProps) => {
        if (this.props != nextProps) {
            this.props = nextProps
        }
    }

    render() {
        const { data, index, onChooseColor, indexChose } = this.props;
        let parseItem = {
            size: data.name,
            length: data.length
        }
        let numberRowRender = 4
        return (
            <TouchableOpacity
                onPress={onChooseColor}
                style={[commonStyles.viewCenter, {
                    marginRight: index == parseItem.length - 1 ? 0 : Constants.MARGIN_24,
                    marginLeft: index == 0 ? Constants.MARGIN_24 : 0,
                    // width: width / numberRowRender,
                    paddingVertical: Constants.PADDING,
                    paddingHorizontal: Constants.PADDING_LARGE,
                    backgroundColor: parseItem.code,
                    borderRadius: Constants.CORNER_RADIUS,
                    borderColor: indexChose == index ? Colors.COLOR_GRAY : Colors.COLOR_TRANSPARENT,
                    borderWidth: 1
                }]}>
                <Text style={[commonStyles.text, {
                }]} >{parseItem.size}</Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
});

export default ItemSize;