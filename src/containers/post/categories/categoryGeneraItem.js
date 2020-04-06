import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import ic_minus_primary from 'images/ic_minus_primary.png';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
import { Fonts } from 'values/fonts';
import { Colors } from 'values/colors';
import ic_check_white from 'images/ic_check_white.png';
import ic_next_grey from 'images/ic_next_grey.png';
import global from 'utils/global';
import StringUtil from 'utils/stringUtil';
import I18n from 'locales/i18n';
import BaseView from 'containers/base/baseView';
import Utils from 'utils/utils';

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

class CategoryGeneraItem extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            language: 0,//0 vi,1 us
        };
        this.widthAndHeigh = Constants.MARGIN_XX_LARGE
    }

    componentWillMount = () => {
        const deviceLocale = I18n.locale
        if (deviceLocale == 'en-US' || deviceLocale == 'en' || deviceLocale == 'en-UK') {
            this.setState({
                language: 1
            })
        }
    }

    render() {
        const { data, item, index, onChangeValue, sttRequest, isProduct } = this.props;
        let parseItem = {
            name: item.name,
            id: item.id,
            logoPath: item.logoPath
        }
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => {
                    onChangeValue(parseItem.id, parseItem.name, parseItem.logoPath)
                }}
                style={{ backgroundColor: Colors.COLOR_WHITE }}
            >
                <View style={[styles.item, {
                    borderBottomWidth: index == data.length - 1 ? 0 : Constants.BORDER_WIDTH,
                    borderColor: Colors.COLOR_BACKGROUND
                }]}>
                    <View style={{ justifyContent: 'center', flex: 1 }} >
                        {isProduct ?
                            <Text style={[item.id == global.idChoose ? commonStyles.textBold : commonStyles.text, { marginHorizontal: 0 }]}>
                                {index == 0 ? (sttRequest == 1 ? parseItem.name :
                                    parseItem.name.indexOf('Tất cả') !== -1 ? parseItem.name :
                                        "Tất cả " + parseItem.name) : parseItem.name}
                            </Text>
                            :
                            <Text style={[item.id == global.idGeneralChoose ? commonStyles.textBold : commonStyles.text, { marginHorizontal: 0 }]}>
                                {parseItem.name}
                            </Text>
                        }
                    </View>
                    {item.hasChild ? <Image source={ic_next_grey} /> : null}
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    item: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Constants.MARGIN_X_LARGE,
        paddingVertical: Constants.PADDING_X_LARGE
    }
});

export default CategoryGeneraItem;