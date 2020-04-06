import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MapViewDirections from 'react-native-maps-directions';
import { configConstants } from 'values/configConstants';
import { Colors } from 'values/colors';

class MapDirections extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { destination, origin, onReady } = this.props
        return (
            <MapViewDirections
                destination={destination}
                origin={origin}
                apikey={configConstants.KEY_GOOGLE}
                strokeWidth={5}
                strokeColor={Colors.COLOR_PRIMARY}
                onStart={(params) => {
                    console.log(`Started routing between "${params.origin}" and "${params.destination}"`)
                }}
                onReady={onReady}
                onError={(errorMessage) => {
                    console.log('GOT AN ERROR')
                }}
            />
        );
    }
}

export default MapDirections
