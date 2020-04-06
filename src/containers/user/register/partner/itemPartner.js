import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Constants } from 'values/constants';
import ic_check_white from "images/ic_check_white.png";
import { Colors } from 'values/colors';
import commonStyles from 'styles/commonStyles';

class ItemPartner extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { data, item, index, onItemSelected, selected } = this.props
        let marginBottom = -Constants.MARGIN
        if (index == data.length - 1) {
            marginBottom = Constants.MARGIN
        }
        return (
            <TouchableOpacity
                key={index}
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => onItemSelected(item, index)}>
                <View style={[commonStyles.shadowOffset, {
                    backgroundColor: index == selected ? Colors.COLOR_PRIMARY : Colors.COLOR_WHITE,
                    borderRadius: Constants.CORNER_RADIUS,
                    padding: Constants.PADDING_X_LARGE,
                    paddingHorizontal: Constants.PADDING_24,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginHorizontal: Constants.MARGIN_X_LARGE,
                    marginBottom: Constants.MARGIN_X_LARGE
                }]}>
                    <Text style={[styles.text, {
                        color: index == selected ? Colors.COLOR_WHITE : Colors.COLOR_TEXT
                    }]}>{item.name}</Text>
                    <Image source={ic_check_white} />
                </View>
            </TouchableOpacity>
        );
    }
}

export default ItemPartner;
