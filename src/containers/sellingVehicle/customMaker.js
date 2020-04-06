import React from 'react';
import { StyleSheet, Image } from 'react-native';
import ic_vehicle_grey from 'images/ic_vehicle_grey.png';

class CustomMarker extends React.Component {
    render() {
        return (
            <Image
                source={ic_vehicle_grey}
                resizeMode="contain"
            />
        );
    }
}

export default CustomMarker;