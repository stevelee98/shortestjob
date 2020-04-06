import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, WebView, Dimensions } from 'react-native';
import BaseView from 'containers/base/baseView';
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import i18n, { localizes } from "locales/i18n";
import styles from './styles';
import global from 'utils/global';
import DateUtil from "utils/dateUtil";
import Share from 'react-native-share';
import { ServerPath } from 'config/Server';
import { Fonts } from 'values/fonts';
import HTML from 'react-native-render-html';
import ImageLoader from 'components/imageLoader';
import Utils from 'utils/utils'
import { StackActions, NavigationActions } from 'react-navigation'
const deviceHeight = Dimensions.get("window").height;

class ItemReport extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentWillMount() {
    }


    render() {
        let { item, index, data } = this.props
        return (
            <View style={{
            }}>
                {this.renderItemBlog(item, index, data)}
            </View>
        );
    }

    /**
     * Render item blog
     */
    renderItemBlog = (item, index, data) => {
        let view = <View></View>

        view =
            <TouchableOpacity
                onPress={
                    () => this.props.gotoReasonReport && this.props.gotoReasonReport(item)
                }
            >
                <View style={[styles.itemReport, {
                    borderBottomWidth: index == data.length - 1 ? 0 : Constants.BORDER_WIDTH,
                    borderColor: Colors.COLOR_BACKGROUND
                }]}>
                    <Text numberOfLines={1}
                        style={[commonStyles.text, { margin: 0, }]}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        return view;
    }
}

export default ItemReport;
