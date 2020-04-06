import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, Linking, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { ParallaxImage } from 'react-native-snap-carousel';
import styles from './styles';
import ImageLoader from 'components/imageLoader';
import bannerType from 'enum/bannerType';
import actionClickBannerType from 'enum/actionClickBannerType';
import BaseView from 'containers/base/baseView';
import { StackActions, NavigationActions } from 'react-navigation'
import commonStyles from 'styles/commonStyles';
import global from 'utils/global';
import Utils from 'utils/utils';
import BackgroundShadow from 'components/backgroundShadow';
import { Constants } from 'values/constants';
const widthDevice = Dimensions.get('window').width;

export default class SliderEntry extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        const { data, resourceUrlPath } = this.props;
        return (
            <TouchableOpacity
                activeOpacity={1}
                style={styles.slideInnerContainer}
                onPress={() => { this.handleClickBanner(data) }}
            >
                <View style={[styles.imageContainer]}>
                    <ImageLoader
                        style={styles.image}
                        resizeModeType={"cover"}
                        resizeAtt={{ type: 'resize', width: 0.75 * widthDevice }}
                        path={!Utils.isNull(data.pathToResource) && data.pathToResource.indexOf('http') != -1
                            ? data.pathToResource : resourceUrlPath + "=" + data.pathToResource}
                    />
                </View>
            </TouchableOpacity>
        );
    }

    /**
     * Handle click banner
     */
    handleClickBanner(data) {
        switch (data.actionOnClickType) {
            case actionClickBannerType.DO_NOTHING:
                global.openModalBanner(data)
                break;
            case actionClickBannerType.GO_TO_SCREEN:

                break;
            case actionClickBannerType.OPEN_OTHER_APP:
                Linking.openURL('https://www.facebook.com/n/?ToHyun.TQT')
                break;
            case actionClickBannerType.OPEN_URL:
                this.props.navigation.navigate("QuestionAnswer", {
                    actionTarget: data.actionTarget
                })
                break;

            default:
                break;
        }
    }
}
