import React, { Component } from 'react';
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

const window = Dimensions.get('window');

const SIZE_BOX = window.width / 2.5;
const WIDTH_IMAGE = "100%";
const HEIGHT_TITLE = 40;
const LINE_TITLE = 2;
const SIZE_LOGO = 28;

export default class ImageInterest extends React.Component {

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
        const { image } = this.props;
        return (
            <ImageLoader
                resizeModeType={'cover'}
                path={image}
                resizeAtt={{ type: 'resize', height: SIZE_BOX }}
                style={styles.image} />
        );
    }
}

const styles = StyleSheet.create({
    image: {
        width: WIDTH_IMAGE,
        height: SIZE_BOX,
        borderTopLeftRadius: Constants.CORNER_RADIUS,
        borderTopRightRadius: Constants.CORNER_RADIUS,
    }
});

