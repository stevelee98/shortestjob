import React, { Component } from 'react';
import {
    View,
    Text,
    RefreshControl,
    BackHandler,
    Image,
    TouchableOpacity,
    NativeModules,
    DeviceEventEmitter
} from 'react-native';
import BaseView from 'containers/base/baseView';
import styles from './styles';
import { Container, Root, Header, Content } from 'native-base';
import commonStyles from 'styles/commonStyles';
import Utils from 'utils/utils';
import { Constants } from 'values/constants';
import paymentMethodType from 'enum/paymentMethodType';
import FlatListCustom from 'components/flatListCustom';
import * as userActions from 'actions/userActions';
import * as paymentActions from 'actions/paymentActions';
import * as commonActions from 'actions/commonActions';
import { connect } from 'react-redux';
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import ic_payment_wallet from 'images/ic_payment_wallet.png';
import ic_atm_card from 'images/ic_atm_card.png';
import ic_deal_shop from 'images/ic_deal_shop.png';
import ic_international_card_white from 'images/ic_international_card_white.png';
import payooPaymentGroupType from 'enum/payooPaymentGroupType';
import I18n, { localizes } from 'locales/i18n';
import languageType from 'enum/languageType';
import ImageLoader from 'components/imageLoader';
import { Colors } from 'values/colors';
import StringUtil from 'utils/stringUtil';
import payooPaymentMethodType from 'enum/payooPaymentMethodType';
import StorageUtil from 'utils/storageUtil';

const ITEM_PER_COL = 3

class PayooPaymentMethodView extends BaseView {
    constructor(props) {
        super(props);
        const { callBack, totalPriceVi, orderCode, orderName } = this.props.navigation.state.params;
        this.state = {
            refreshing: false,
            enableRefresh: true
        };
        this.callBack = callBack;
        this.totalPriceVi = totalPriceVi;
        this.orderCode = orderCode;
        this.orderName = orderName;
        this.data = [];
        this.feeVi = 0;
        this.arrayFee = [];
        this.userInfo = null;
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        let payooPaymentComplete = true
        DeviceEventEmitter.addListener('responsePayooComplete', (param) => {
            if (payooPaymentComplete) {
                payooPaymentComplete = false
                console.log(param.responsePayooComplete + " :responsePayooComplete ")
                this.onBack()
                this.callBack(param.responsePayooComplete, param.paymentPayooGroupType)
            }
        });
        this.getProfile()
    }

    componentDidMount() {
        this.handleRequest()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData();
        }
    }


    /**
     * Get profile
     */
    getProfile() {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then((user) => {
            //this callback is executed when your Promise is resolved
            if (!Utils.isNull(user)) {
                this.userInfo = user
            }
        }).catch((error) => {
            this.saveException(error, "getProfile")
        });
    }

    /**
     * Fetch data from API
     */
    handleData = () => {
        let data = this.props.data
        if (this.props.action == getActionSuccess(ActionEvent.GET_BANKS_PARTNER)) {
            if (!Utils.isNull(data)) {
                let replaceData = data.replace('Payoo.render(', '').replace(/\);$/, '');
                let parsedData = !Utils.isNull(replaceData) ? JSON.parse(replaceData.replace('Payoo.render(', '').replace(/\);$/, '')) : '';
                this.data = parsedData.methods
                console.log('parsed data', parsedData)
            }
        } else {
            if (this.props.errorCode != ErrorCode.ERROR_INIT) {
                if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                    if (this.props.action == getActionSuccess(ActionEvent.GET_FEE_PAYMENT_PAYOO)) {
                        console.log('fee payment payoo', data)
                        this.arrayFee = data.data
                    } else if (this.props.action == getActionSuccess(ActionEvent.CREATE_ORDER_INFO_PAYOO)) {
                        console.log('data create order', data)
                        let order = data.data;
                        if (!Utils.isNull(order) && Utils.isNull(order.orderInfo)) {
                            this.showMessage(order.message);
                        } else if (Utils.isNull(order)) {
                            this.showMessage("Vui lòng liên hệ H2 Decal để thực hiện" +
                                " thanh toán");
                        } else {
                            let filter = {
                                data: data.data,
                                bankCode: this.code,
                                email: "",
                                phone: this.userInfo.phone,
                                userId: this.userInfo.id,
                                group: this.group,
                                language: !Utils.isEnglishLanguage(I18n.locale) ? 'vi_VN' : 'en_US'
                            }
                            let activityStarter = NativeModules.PayooStarter;
                            activityStarter.navigateToPaymentPayoo(filter);
                        }
                    }
                } else {
                    this.handleError(this.props.errorCode, this.props.error)
                }
            }
        }
    }

    // Handle request
    handleRequest() {
        this.props.getBanksPartner()
        this.props.getFeePaymentPayoo()
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    render() {
        const { enableRefresh, refreshing } = this.state;
        return (
            <Container style={styles.container}>
                <Root>
                    {/* {Header home view} */}
                    <Header style={commonStyles.header}>
                        {this.renderHeaderView({
                            title: "THANH TOÁN QUA PAYOO",
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
                        contentContainerStyle={{
                            paddingTop: Constants.PADDING,
                            padding: Constants.PADDING_X_LARGE,
                            justifyContent: 'center',
                        }}
                        keyExtractor={(item) => item.id}
                        itemPerCol={1}
                        data={this.data}
                        renderItem={this.renderItemMethod}
                        showsVerticalScrollIndicator={false}
                    />
                    {this.showLoadingBar(this.props.isLoading)}
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
     * Render item method
     */
    renderItemMethod = (item, index) => {
        let isPaymentPayoo = true
        let code = ""
        return (
            <View style={{ flexDirection: 'column', flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Constants.MARGIN_X_LARGE }}>
                    <View style={{ justifyContent: 'center', alignItems: 'flex-start' }}>
                        <Image resizeMode={'cover'} source={this.getSourceImage(item)}></Image>
                    </View>
                    <View style={{ marginLeft: Constants.MARGIN_LARGE, flex: 1 }}>
                        <TouchableOpacity
                            onPress={() => {
                                this.goToPaymentPayoo(Utils.isNull(item.icons) ? 0 : item.icons[0].group, isPaymentPayoo, code)
                            }}
                        >
                            <Text style={[commonStyles.textBold, { margin: 0 }]}>{this.renderTitle(Utils.isNull(item.icons) ? 0 : item.icons[0].group, item)}</Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={[commonStyles.text, { margin: 0 }]}>
                                {this.renderTypeTextFee(Utils.isNull(item.icons)
                                    ? 0
                                    : item.icons[0].group)}
                                ({this.renderFee(Utils.isNull(item.icons)
                                    ? 0
                                    : item.icons[0].group)} = {this.renderTotalPriceAfterFee(Utils.isNull(item.icons) ? 0 : item.icons[0].group, true)})
                                    </Text>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <FlatListCustom
                        data={!Utils.isNull(item.icons) ? item.icons : []}
                        renderItem={this.renderItemIcon}
                        itemPerRow={ITEM_PER_COL}
                        style={{
                            marginTop: Constants.MARGIN
                        }}
                    />
                </View>
            </View>
        )
    }

    /**
     * Render item row
     */
    renderItemIcon = (item, index) => {
        let code = item.group == payooPaymentGroupType.STORE ? "" : item.code.toLowerCase()
        let isPaymentPayoo = true
        return (
            <TouchableOpacity
                onPress={() => {
                    this.goToPaymentPayoo(item.group, isPaymentPayoo, code, item)
                }}
            >
                <View style={styles.itemIcon}>
                    {this.renderTypeImage(item, code)}
                </View>
            </TouchableOpacity>
        )
    }

    /**
     * Render type image
     */
    renderTypeImage = (item, code) => {
        let view = null;
        if (item.group == payooPaymentGroupType.STORE) {
            view = <Image resizeMode={'contain'} style={{ width: Constants.WIDTH_BANK, height: Constants.HEIGHT_BANK }} source={this.renderImage(item.code)}></Image>
        } else {
            if (item.group == payooPaymentGroupType.ATM_CARD) {
                if (code == "sgb") {
                    view = <Image style={{ width: Constants.WIDTH_BANK, height: Constants.HEIGHT_BANK }} resizeMode={'contain'} source={require('images/ic_sgbank.png')}></Image>
                } else {
                    view = <ImageLoader resizeModeType={'contain'} style={{ width: Constants.WIDTH_BANK, height: Constants.HEIGHT_BANK }} path={`https://payoo.vn/v2/img/banks-logo-new/${code}.png`}></ImageLoader>
                }
            } else {
                view = <ImageLoader resizeModeType={'contain'} style={{ width: Constants.WIDTH_BANK, height: Constants.HEIGHT_BANK }} path={`https://payoo.vn/v2/img/banks-logo-new/${code}.png`}></ImageLoader>
            }
        }
        return view
    }

    /**
     * Go to payment payoo
     */
    goToPaymentPayoo = (group, isPaymentPayoo, code) => {
        this.code = code
        this.group = group
        this.filter = {
            orderCode: this.orderCode,
            fee: this.getFee(group, true),
            totalAmount: this.renderTotalPriceAfterFee(group, true, isPaymentPayoo),
            orderName: this.orderName,
            bankCode: code,
            payooPaymentMethodType: group
        }
        this.props.createOrderInfoPayoo(this.filter)
    }

    /**
     * Get source image
     */
    getSourceImage = (item) => {
        if (item.name == "pay-at-store") {
            return ic_deal_shop
        } else if (item.name == "bank-payment") {
            return ic_atm_card
        } else if (item.name == "cc-payment") {
            return ic_international_card_white
        } else if (item.name = "payoo-account") {
            return ic_payment_wallet
        }
    }

    /**
     * Render title
     */
    renderTitle = (group, item) => {
        if (group == payooPaymentGroupType.WALLET) {
            return localizes('payooPaymentMethodView.titleWalletPayoo')
        } else if (group == payooPaymentGroupType.INTERNAL_CARD) {
            return localizes('payooPaymentMethodView.feeCreditCard')
        } else if (group == payooPaymentGroupType.ATM_CARD) {
            return localizes('payooPaymentMethodView.titleAtmCards')
        } else if (group == payooPaymentGroupType.STORE) {
            return localizes('payooPaymentMethodView.titleConvenience')
        }
    }

    /**
     * Render type text fee
     */
    renderTypeTextFee = (group) => {
        if (group == payooPaymentGroupType.WALLET) {
            return localizes('payooPaymentMethodView.feeWalletPayoo')
        } else if (group == payooPaymentGroupType.INTERNAL_CARD) {
            return localizes('payooPaymentMethodView.feeCreditCard')
        } else if (group == payooPaymentGroupType.ATM_CARD) {
            return localizes('payooPaymentMethodView.feeAtmCards')
        } else if (group == payooPaymentGroupType.STORE) {
            return localizes('payooPaymentMethodView.feeConvenience')
        }
    }

    /**
     * Render image
     */
    renderImage = (code) => {
        if (code == "BsMart") {
            return require('images/ic_bsmart.png')
        } else if (code == "FamilyMart") {
            return require('images/ic_familymart.png')
        } else if (code == "CircleK") {
            return require('images/ic_circleK.png')
        } else if (code == "MiniStop") {
            return require('images/ic_ministop.png')
        } else if (code == "CocoMart") {
            return require('images/ic_cocomart.png')
        } else if (code == "MediaMart") {
            return require('images/ic_media.png')
        } else if (code == "EcoMart") {
            return require('images/ic_ecomart.png')
        } else if (code == "CitiMart") {
            return require('images/ic_citimart.png')
        } else if (code == "VinMart") {
            return require('images/ic_vinmart.png')
        } else if (code == "VinPro") {
            return require('images/ic_vinpro.png')
        } else if (code == "VinMartPlus") {
            return require('images/ic_vinmartPlus.png')
        } else if (code == "FptShop") {
            return require('images/ic_fptshop.png')
        } else if (code == "DienMayChoLon") {
            return require('images/ic_cholon.png')
        } else if (code == "PhucAnh") {
            return require('images/ic_phucanh.png')
        } else if (code == "HnamMobile") {
            return require('images/ic_hnam.png')
        } else if (code == "LongHung") {
            return require('images/ic_longhung.png')
        } else if (code == "BachKhoa") {
            return require('images/ic_bachkhoa.png')
        }
    }

    /**
     * Round price sale
     */
    roundPrice = (price, deviceLocale, isVietnamese) => {
        return StringUtil.formatStringCash(price, StringUtil.getFormatTypePrice('vi'), true);
    }

    /**
     * Render fee
     */
    renderFee = (groupType) => {
        const deviceLocale = I18n.locale
        this.feeVi = Math.round(this.getFee(groupType, true))
        return '+' + this.roundPrice(Math.round(this.getFee(groupType)), deviceLocale, true)
    }

    /**
     * Get fee
     */
    getFee = (groupType, isVietnamese) => {
        let fee = 0
        for (let i = 0, size = !Utils.isNull(this.arrayFee) ? this.arrayFee.length : 0; i < size; i++) {
            if (this.arrayFee[i].paymentMethod == payooPaymentMethodType.E_WALLET && groupType == payooPaymentGroupType.WALLET) {
                fee = this.getAmountByLanguage(isVietnamese) * this.arrayFee[i].feePercent + this.getFeeAmountByLanguage(this.arrayFee[i], isVietnamese)
            } else if (this.arrayFee[i].paymentMethod == payooPaymentMethodType.INTERNAL_CARD && groupType == payooPaymentGroupType.ATM_CARD) {
                fee = this.getAmountByLanguage(isVietnamese) * this.arrayFee[i].feePercent + this.getFeeAmountByLanguage(this.arrayFee[i], isVietnamese)
            } else if (groupType == payooPaymentGroupType.INTERNAL_CARD) {
                let feeInternationalCardOverSea = null
                let feeInternationalCardVn = null
                for (let j = 0, size = !Utils.isNull(this.arrayFee) ? this.arrayFee.length : 0; j < size; j++) {
                    if (this.arrayFee[j].paymentMethod == payooPaymentMethodType.INTERNATIONAL_CARD_OVERSEA) {
                        feeInternationalCardOverSea = this.getAmountByLanguage(isVietnamese) * this.arrayFee[j].feePercent + this.getFeeAmountByLanguage(this.arrayFee[j])
                    } else if (this.arrayFee[j].paymentMethod == payooPaymentMethodType.INTERNATIONAL_CARD_VN) {
                        feeInternationalCardVn = this.getAmountByLanguage() * this.arrayFee[j].feePercent + this.getFeeAmountByLanguage(this.arrayFee[j], isVietnamese)
                    }
                }
                if (feeInternationalCardOverSea > feeInternationalCardVn) {
                    fee = feeInternationalCardOverSea
                } else {
                    fee = feeInternationalCardVn
                }
            } else if (this.arrayFee[i].paymentMethod == payooPaymentMethodType.STORE && groupType == payooPaymentGroupType.STORE) {
                fee = this.getAmountByLanguage(isVietnamese) * this.arrayFee[i].feePercent + this.getFeeAmountByLanguage(this.arrayFee[i], isVietnamese)
            }
        }
        return this.floorFee(fee)
    }

    /**
     * Get fee amount
     */
    getFeeAmountByLanguage = (itemFee, isVietnamese) => {
        return itemFee.feeAmountVi
    }

    /**
     * Floor fee
     */
    floorFee = (fee) => {
        return Math.floor(fee / 1000 + (fee % 1000 > 0 ? 1 : 0)) * 1000
    }

    /**
     * Render total price after fee
     */
    renderTotalPriceAfterFee = (item, isVietnamese, isPaymentPayoo) => {
        return !isPaymentPayoo
            ? this.roundPrice(Math.round(this.getFee(item, isVietnamese) + this.getAmountByLanguage(isVietnamese)), 'vi', isVietnamese)
            : this.getFee(item, isVietnamese) + this.getAmountByLanguage(isVietnamese)
    }

    /**
     * Get amount by language
     */
    getAmountByLanguage = (isVietnamese) => {
        return this.totalPriceVi
    }
}

const mapStateToProps = state => ({
    data: state.payooPayment.data,
    isLoading: state.payooPayment.isLoading,
    error: state.payooPayment.error,
    errorCode: state.payooPayment.errorCode,
    action: state.payooPayment.action
});
const mapDispatchToProps = {
    ...userActions,
    ...paymentActions,
    ...commonActions
};
export default connect(mapStateToProps, mapDispatchToProps)(PayooPaymentMethodView);
