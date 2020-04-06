import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import commonStyles from 'styles/commonStyles';
import { Fonts } from 'values/fonts';
import { Constants } from 'values/constants';
import { Colors } from 'values/colors';
import styles from './styles';
import FlatListCustom from 'components/flatListCustom';
import dataBank from './dataBank';
import { localizes } from 'locales/i18n';
import { CheckBox } from 'react-native-elements';

export default class ItemPaymentMethod extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { data, item, index, onPress, paymentMethod, receiverPhone } = this.props;
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={Constants.ACTIVE_OPACITY}>
                <View style={styles.boxView}>
                    <View style={styles.boxTitle}>
                        <CheckBox
                            title={item.name}
                            textStyle={styles.title}
                            checkedColor={Colors.COLOR_PRIMARY}
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            iconLeft
                            checked={paymentMethod == item.id ? true : false}
                            containerStyle={styles.checkBox}
                        />
                    </View>
                    <Text style={styles.description}>{item.description}</Text>
                    {index == data.length - 1
                        ? <View style={{ flex: 1 }}>
                            <Text style={styles.description}>
                                {localizes('payment.message')}
                            </Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={[commonStyles.textBold]}>{receiverPhone}</Text>
                            </View>
                            {this.renderListMarkWriting()}
                        </View> : null
                    }
                </View>
            </TouchableOpacity>
        );
    }

    //render list mark writing
    renderListMarkWriting = () => {
        return (
            <FlatListCustom
                data={dataBank}
                renderItem={this.renderMarkWritingItem}
                horizontal={false}
                keyExtractor={(item) => item}
            />
        )
    }

    //render item mark writing
    renderMarkWritingItem = (item, index) => {
        return (
            <View style={{ flex: 1, padding: Constants.PADDING, flexDirection: 'row' }} >
                <View style={{ alignItems: 'center', marginRight: Constants.MARGIN_LARGE }}>
                    <Image
                        source={{ uri: item.img }}
                        style={{ width: 100, height: 100 }}
                        resizeMode={'contain'}
                    />
                </View>
                <View style={{ alignItems: 'flex-start', flex: 1 }}>
                    <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_SMALL }]}>{localizes('payment.accountHolder')}
                        <Text style={[commonStyles.textBold, { fontSize: Fonts.FONT_SIZE_SMALL }]}>{item.chutk}</Text>
                    </Text>
                    <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_SMALL }]}>{localizes('payment.accountNumber')}
                        <Text style={[commonStyles.textBold, { fontSize: Fonts.FONT_SIZE_SMALL }]}>{item.sotk}</Text>
                    </Text>
                    <Text style={[commonStyles.text, { fontSize: Fonts.FONT_SIZE_SMALL }]}>{localizes('payment.bankBranch')}
                        <Text style={[commonStyles.textBold, { fontSize: Fonts.FONT_SIZE_SMALL }]}>{item.chinhanh}</Text>
                    </Text>
                </View>
            </View>
        )
    }
}
