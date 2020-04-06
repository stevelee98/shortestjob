import React, { PureComponent } from 'react';
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
const width = Dimensions.get('window').width
const height = Dimensions.get('window').height
import DateUtil from 'utils/dateUtil';
const PADDING_BUTTON = Constants.PADDING_X_LARGE - 4
import ImageLoader from 'components/imageLoader';
import ic_star from 'images/ic_star.png';
import StarRating from 'components/starRating';
import Utils from 'utils/utils';

class ItemReview extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            opacity: 0
        };
    }

    componentWillMount = () => {
    }

    componentWillReceiveProps = (nextProps) => {
    }

    render() {
        const { data, index, length } = this.props;
        let parseItem = {
            attitude: !Utils.isNull(data) ? data.title : "",
            comment: !Utils.isNull(data) ? data.content : "",
            commentator: !Utils.isNull(data) ? !Utils.isNull(data.reviewer) ? data.reviewer.name : "" : "",
            date: !Utils.isNull(data) ? data.createdAt : "",
            numberStar: !Utils.isNull(data) ? data.star : ""
        }
        return (
            <View style={[commonStyles.shadowOffset, {
                borderRadius: Constants.CORNER_RADIUS,
                backgroundColor: Colors.COLOR_WHITE,
                padding: Constants.PADDING_X_LARGE,
                marginTop: Constants.MARGIN_LARGE,
                marginBottom: index == length - 1 ? Constants.MARGIN_X_LARGE : Constants.MARGIN_LARGE,
                marginHorizontal: Constants.MARGIN_X_LARGE
            }]} >
                <View style={[commonStyles.viewHorizontal]} >
                    <Text style={[commonStyles.text, { margin: 0 }]} >{parseItem.attitude}</Text>
                    <View style={[commonStyles.viewHorizontal, {
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                    }]} >
                        <StarRating
                            styleImage={{ width: 15, height: 15 }}
                            ratingObj={{
                                ratings: parseItem.numberStar
                            }}
                            myStyleViews={[commonStyles.text, { marginRight: 0, marginLeft: 0 }]} />
                    </View>
                </View>
                <Text style={[commonStyles.text, { marginVertical: Constants.MARGIN_LARGE, marginHorizontal: 0, color: Colors.COLOR_GRAY }]} >{parseItem.comment}</Text>
                <View style={[commonStyles.viewHorizontal, {
                    justifyContent: 'space-between'
                }]} >
                    <Text style={[commonStyles.text, { margin: 0 }]} >{parseItem.commentator}</Text>
                    <Text style={[commonStyles.text, { margin: 0, color: Colors.COLOR_GRAY }]} >{
                        DateUtil.convertFromFormatToFormat(parseItem.date, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE)
                    }</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
});

export default ItemReview;