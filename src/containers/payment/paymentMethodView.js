import React, { Component } from 'react';
import { View, Text, RefreshControl, BackHandler } from 'react-native';
import BaseView from 'containers/base/baseView';
import styles from './styles';
import { Container, Root, Header, Content } from 'native-base';
import commonStyles from 'styles/commonStyles';
import Utils from 'utils/utils';
import { Constants } from 'values/constants';
import paymentMethodType from 'enum/paymentMethodType';
import FlatListCustom from 'components/flatListCustom';
import ItemPaymentMethod from './itemPaymentMethod';

class PaymentMethodView extends BaseView {
    constructor(props) {
        super(props);
        const { callBack, paymentMethod, receiverPhone } = this.props.navigation.state.params;
        this.state = {
            refreshing: false,
            enableRefresh: true,
            paymentMethod: paymentMethod
        };
        this.callBack = callBack;
        this.receiverPhone = receiverPhone;
        this.paymentMethods = [
            { "id": paymentMethodType.COD, "name": paymentMethodType.TEXT_COD, "description": paymentMethodType.DES_TEXT_COD },
            { "id": paymentMethodType.PAYOO, "name": paymentMethodType.TEXT_PAYOO, "description": paymentMethodType.DES_TEXT_PAYOO },
            { "id": paymentMethodType.BANK_TRANSFER, "name": paymentMethodType.TEXT_BANK_TRANSFER, "description": paymentMethodType.DES_TEXT_BANK_TRANSFER }
        ]
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    render() {
        const { enableRefresh, refreshing } = this.state;
        return (
            <Container style={styles.container}>
                <Root>
                    <View style={{ flexGrow: 1 }}>
                        {/* {Header home view} */}
                        <Header style={commonStyles.header}>
                            {this.renderHeaderView({
                                title: "THÔNG TIN THANH TOÁN",
                                visibleStage: false,
                                titleStyle: { marginRight: Constants.MARGIN_XX_LARGE }
                            })}
                        </Header>
                        <FlatListCustom
                            enableRefresh={enableRefresh}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={this.handleRefresh}
                                />
                            }
                            style={{
                                paddingVertical: Constants.PADDING,
                            }}
                            keyExtractor={(item) => item.id}
                            horizontal={false}
                            data={this.paymentMethods}
                            itemPerCol={1}
                            renderItem={this.renderItem.bind(this)}
                            showsVerticalScrollIndicator={false}
                        />
                        {this.showLoadingBar(this.props.isLoading)}
                    </View>
                </Root>
            </Container>
        );
    }

    //onRefreshing
    handleRefresh = () => {
        this.setState({
            refreshing: false
        })
    }

    /**
     * Render item
     * @param {*} item
     * @param {*} index
     * @param {*} parentIndex
     * @param {*} indexInParent
     */
    renderItem(item, index, parentIndex, indexInParent) {
        return (
            <ItemPaymentMethod
                key={item.id}
                data={this.paymentMethods}
                item={item}
                index={index}
                onPress={() => this.onClickItem(item)}
                paymentMethod={this.state.paymentMethod}
                receiverPhone={this.receiverPhone}
            />
        );
    }

    /**
     * On click item payment method
     */
    onClickItem(item) {
        this.setState({
            paymentMethod: item.id
        })
        this.onBack()
        this.callBack(item.id)
    }
}

export default PaymentMethodView;
