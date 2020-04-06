import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Constants } from 'values/constants';

export default class LocationItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { item, onSetAddress } = this.props;
        return (
            <TouchableOpacity
                onPress={onSetAddress}
                block>
                <View style={{ padding: Constants.PADDING_LARGE }}>
                    <Text>{item.description}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}
