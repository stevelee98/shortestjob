import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import BaseView from 'containers/base/baseView';
import { Colors } from 'values/colors';
import ic_google_map from 'images/ic_google_map.png';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import { Fonts } from 'values/fonts';
import { Constants } from 'values/constants';

const WIDTH = 225
const HEIGHT = 180

export default class AddressItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { data, item, index, onSetAddress } = this.props;
        let marginLeft = Constants.MARGIN_LARGE
        let marginRight = Constants.MARGIN_LARGE
        if (index == 0) {
            marginLeft = Constants.MARGIN_LARGE
        }
        if (index == data.length - 1) {
            marginRight = Constants.MARGIN_X_LARGE
        }
        return (
            <TouchableOpacity activeOpacity={Constants.ACTIVE_OPACITY} style={{ flex: 1 }} onPress={() => onSetAddress(item)}>
                <View style={[commonStyles.shadowOffset, {
                    backgroundColor: item.isDefault ? Colors.COLOR_GREEN_LIGHT : Colors.COLOR_WHITE,
                    paddingHorizontal: Constants.PADDING_X_LARGE,
                    paddingVertical: Constants.PADDING_12,
                    alignItems: 'flex-start',
                    width: WIDTH,
                    height: HEIGHT,
                    borderRadius: Constants.CORNER_RADIUS,
                    marginLeft: marginLeft,
                    marginRight: marginRight,
                    marginTop: Constants.MARGIN
                }]}>
                    <View>
                        <Text numberOfLines={2} style={[commonStyles.textBold, {
                            color: item.isDefault ? Colors.COLOR_WHITE : Colors.COLOR_TEXT
                        }]}>{item.name} </Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <Text style={[commonStyles.text, { color: item.isDefault ? Colors.COLOR_WHITE : Colors.COLOR_TEXT, marginBottom: 0 }]}>{item.phone}</Text>
                        <Text
                            style={[commonStyles.text, { color: item.isDefault ? Colors.COLOR_WHITE : Colors.COLOR_TEXT, marginTop: 0 }]}
                            numberOfLines={4}>
                            {item.address}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}
