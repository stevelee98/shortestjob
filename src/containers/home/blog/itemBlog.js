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
// import IconActionBlog from './iconActionBlog';
import Share from 'react-native-share';
import { ServerPath } from 'config/Server';
import { Fonts } from 'values/fonts';
import HTML from 'react-native-render-html';
import ImageLoader from 'components/imageLoader';
// import HTMLView from 'react-native-htmlview';
import Utils from 'utils/utils'
import { StackActions, NavigationActions } from 'react-navigation'
import StringUtil from 'utils/stringUtil';
const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

class ItemBlog extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentWillMount() {
        this.getSourceUrlPath()
    }

    gotoBlogDetail = (id, title) => {
        global.gotoBlogDetail(id, title)
    }

    render() {
        let data = this.props.data
        const htmlContent = data.content;
        // console.log('DATAAAA', this.resourceUrlPath.textValue + '/' + data.avatar_path)
        return (
            <View>
                {this.renderItemBlog(data, htmlContent)}
            </View>
        );
    }

    /**
     * Render item blog
     */
    renderItemBlog = (data, htmlContent) => {
        let content = StringUtil.clearTagHTML(htmlContent);
        let view = <View></View>
        //


        view =
            <View style={[styles.main]}>
                <TouchableOpacity
                    style={{ opacity: 0.9 }}
                    onPress={
                        () => this.props.gotoBlogDetail && this.props.gotoBlogDetail(data)
                    }
                >
                    <View>
                        <Text numberOfLines={1} style={[commonStyles.textBold, { margin: 0, }]}>{data.title}</Text>
                    </View>

                    <View style={{
                        // paddingTop: Constants.PADDING_LARGE, 
                    }}>
                        <Text style={
                            [commonStyles.text,
                            {
                                fontSize: Fonts.FONT_SIZE_X_SMALL,
                                margin: 0,
                                opacity: 0.5
                            }]
                        }>{
                                DateUtil.convertFromFormatToFormat(data.createdAt, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE)}
                        </Text>
                    </View  >

                    {/* image */}
                    {!Utils.isNull(data.avatar_path) ?
                        <View style={{ marginTop: 8, }}>
                            <ImageLoader
                                resizeModeType={"cover"}
                                style={[
                                    {
                                        width: "100%",
                                        height: height / 4,
                                    }
                                ]}
                                path={this.resourceUrlPath.textValue + '/' + data.avatar_path}
                            />
                        </View>
                        : null
                    }
                    <View style={{
                        marginVertical: Constants.MARGIN_LARGE,
                    }}>
                        <Text
                            numberOfLines={2}
                            style={[commonStyles.text, { marginLeft: 0, margin: 0, }]}>
                            {!Utils.isNull(data.summary) ? data.summary : content}
                        </Text>
                    </View>

                </TouchableOpacity>
            </View>
        return view;
    }
}

export default ItemBlog;
