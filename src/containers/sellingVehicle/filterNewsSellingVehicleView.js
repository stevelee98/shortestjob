import React, { Component } from 'react';
import { View, Text, TouchableOpacity, TextInput, BackHandler, Image, Dimensions } from 'react-native';
import styles from './styles';
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';
import { localizes } from 'locales/i18n';
import { Container, Root, Header, Content } from 'native-base';
import commonStyles from 'styles/commonStyles';
import BaseView from 'containers/base/baseView';
import areaType from 'enum/areaType';
import ic_vehicle_grey from 'images/ic_vehicle_grey.png';
import Utils from 'utils/utils';
import StringUtil from 'utils/stringUtil';
import { Fonts } from 'values/fonts';
import TextInputCustom from 'components/textInputCustom';
import sortType from 'enum/sortType';
import MultiSliderCustom from './multiSliderCustom';
import { CheckBox } from 'react-native-elements';
import { TextInputMask } from 'react-native-masked-text';

const MIN_PRICE = 0;
const MAX_PRICE = 100000000000;
const screen = Dimensions.get("window");

class FilterNewsSellingVehicleView extends BaseView {
    constructor(props) {
        super(props);
        const { callBack, filter } = this.props.navigation.state.params
        this.state = {
            maxPrice: filter.maxPrice,
            minPrice: filter.minPrice,
            sortSelected: 0,
            filterSelected: 0,
            filterBySeller: false
        }
        this.callBack = callBack
        this.state.maxPrice = filter.maxPrice
        this.state.minPrice = filter.minPrice
        this.state.sortSelected = filter.typeSort
        this.state.filterSelected = filter.typeFilter
        this.listTextSort = [
            sortType.TEXT_DATE_MOST_RECENT,
            sortType.TEXT_DATE_MOST_OLD,
            sortType.TEXT_PRICE_LOW_TO_HIGH,
            sortType.TEXT_PRICE_HIGH_TO_LOW
        ]
        this.listTextFilter = [
            localizes('filterNewSelling.product'),
            localizes('filterNewSelling.seller'),
        ]
    }

    componentWillMount() {
        this.setState({ minPrice: this.state.minPrice, maxPrice: this.state.maxPrice })
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
    }

    componentDidMount() {
        this.setState({filterSelected: 0})
    }

    /**
     * Set Price
     * @param {*} price 
     */
    onSetPrice(minPrice, maxPrice) {
        this.setState({
            minPrice: !Utils.isNull(minPrice) ?
                typeof minPrice == typeof 'string' ? (minPrice.toString().trim().split(".").join("")) * 1 : minPrice
                : null,
            maxPrice: !Utils.isNull(maxPrice) ?
                typeof maxPrice == typeof 'string' ? (maxPrice.toString().trim().split(".").join("")) * 1 : maxPrice
                : null
        })
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    render() {
        const { maxPrice, minPrice, sortSelected, filterSelected } = this.state;

        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={commonStyles.header}>
                        {this.renderHeaderView({
                            visibleStage: false,
                            title: localizes("sellingVehicle.titleFilter"),
                            renderRightMenu: this.renderRightHeader
                        })}
                    </Header>
                    <Content
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1, paddingTop: Constants.PADDING_X_LARGE }}
                        style={{ flex: 1 }}>

                        {/* Filter by*/}
                        <View style={{ backgroundColor: Colors.COLOR_WHITE, marginBottom: Constants.MARGIN_LARGE }}>
                            <Text style={[commonStyles.text, { marginHorizontal: 0, padding: Constants.PADDING_X_LARGE }]}>{localizes('filterNewSelling.filterBy')}</Text>
                            <View style={{ paddingRight: Constants.PADDING_LARGE, paddingBottom: Constants.PADDING_LARGE, marginLeft: -Constants.MARGIN }}>
                                {this.listTextFilter.map((text, index) => {
                                    return (
                                        this.renderCheckBook(
                                            text, 
                                            index,
                                            () => {
                                                this.setState({ filterSelected: index })
                                                if (index == 1) {
                                                    this.setState({ filterBySeller: true })
                                                } else {
                                                    this.setState({ filterBySeller: false })
                                                }},
                                            filterSelected)
                                    )
                                })}
                            </View>
                        </View>

                        {/* Filter price */}
                        {(!this.state.filterBySeller) &&
                        <View style={{ backgroundColor: Colors.COLOR_WHITE, marginVertical: Constants.MARGIN_LARGE }}>
                            <View style={{ marginTop: Constants.MARGIN_X_LARGE, paddingHorizontal: Constants.PADDING_X_LARGE }}>
                                <Text style={[commonStyles.text, { marginHorizontal: 0 }]}>
                                    {localizes("sellingVehicle.priceFrom")}
                                    <Text style={[commonStyles.textBold]}>
                                        {StringUtil.formatStringCashNoUnit(Math.round(!Utils.isNull(minPrice) ?
                                            typeof minPrice == typeof 'string' ? (minPrice.toString().trim().split(".").join("")) * 1 : minPrice
                                            : null))}
                                    </Text>
                                    {localizes("sellingVehicle.priceTo")}
                                    <Text style={[commonStyles.textBold]}>
                                        {StringUtil.formatStringCashNoUnit(Math.round(!Utils.isNull(maxPrice) ?
                                            typeof maxPrice == typeof 'string' ? (maxPrice.toString().trim().split(".").join("")) * 1 : maxPrice
                                            : null))}
                                    </Text>
                                </Text>
                            </View>
                            <MultiSliderCustom
                                onSetPrice={this.onSetPrice.bind(this)}
                                minNumber={!Utils.isNull(minPrice) ?
                                    typeof minPrice == typeof 'string' ? (minPrice.toString().trim().split(".").join("")) * 1 : minPrice
                                    : null}
                                maxNumber={!Utils.isNull(maxPrice) ?
                                    typeof maxPrice == typeof 'string' ? (maxPrice.toString().trim().split(".").join("")) * 1 : maxPrice
                                    : null} />
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingHorizontal: Constants.PADDING_X_LARGE,
                                marginBottom: Constants.MARGIN_X_LARGE
                            }}>

                                {/*minPrice*/}
                                {/* <TextInputCustom
                                    // title={localizes("userInfoView.address")}
                                    inputNormalStyle={{
                                        // paddingVertical: Constants.PADDING_LARGE,
                                        borderColor: Colors.COLOR_BACKGROUND,
                                        borderWidth: Constants.BORDER_WIDTH, marginTop: -Constants.MARGIN_X_LARGE * 3,
                                        width: screen.width / 2.2,
                                        paddingHorizontal: Constants.PADDING_LARGE,
                                        textAlign: 'center'
                                    }}
                                    refInput={input => {
                                        this.minPrice = input;
                                    }}
                                    isInputNormal={true}
                                    placeholder={'Nhập giá thấp nhất'}
                                    value={this.state.minPrice}
                                    onChangeText={minPrice => this.setState({ minPrice })}
                                    returnKeyType={"next"}
                                    blurOnSubmit={false}
                                    numberOfLines={1}
                                    keyboardType={"numeric"}
                                    hrEnable={false}
                                /> */}

                                <TextInputMask
                                    ref={ref => this.minPrice = ref}
                                    underlineColorAndroid={Colors.COLOR_TRANSPARENT}
                                    type={'money'}
                                    options={{
                                        precision: 0,
                                        separator: '.',
                                        delimiter: '',
                                        unit: '',
                                        suffixUnit: ''
                                    }}
                                    value={this.state.minPrice}
                                    onChangeText={minPrice => {
                                        minPrice == 0 ?
                                            this.setState({ minPrice: 0 })
                                            : this.setState({ minPrice: minPrice })
                                    }}
                                    style={[commonStyles.inputText, {
                                        fontSize: Fonts.FONT_SIZE_X_MEDIUM, borderColor: Colors.COLOR_BACKGROUND,
                                        borderWidth: Constants.BORDER_WIDTH, marginTop: -Constants.MARGIN_X_LARGE,
                                        width: screen.width / 2.2,
                                        paddingHorizontal: Constants.PADDING_LARGE,
                                        textAlign: 'center'
                                    }]}
                                    // placeholder={'Nhập giá thấp nhất'}
                                    keyboardType="numeric"
                                    returnKeyType={"next"}
                                // onSubmitEditing={this.gotoCategory}
                                />

                                {/*maxPrice*/}
                                {/* <TextInputCustom
                                    // title={localizes("userInfoView.address")}
                                    inputNormalStyle={{
                                        marginTop: -Constants.MARGIN_X_LARGE * 3,
                                        borderColor: Colors.COLOR_BACKGROUND,
                                        borderWidth: Constants.BORDER_WIDTH,
                                        width: screen.width / 2.2,
                                        paddingHorizontal: Constants.PADDING_LARGE,
                                        textAlign: 'center'
                                    }}
                                    refInput={input => {
                                        this.maxPrice = input;
                                    }}
                                    isInputNormal={true}
                                    placeholder={'Nhập giá cao nhất'}
                                    value={this.state.maxPrice}
                                    onChangeText={maxPrice => this.setState({ maxPrice })}
                                    returnKeyType={"next"}
                                    blurOnSubmit={false}
                                    numberOfLines={1}
                                    hrEnable={false}
                                    keyboardType={"numeric"}
                                /> */}
                                <TextInputMask
                                    ref={ref => this.maxPrice = ref}
                                    underlineColorAndroid={Colors.COLOR_TRANSPARENT}
                                    type={'money'}
                                    options={{
                                        precision: 0,
                                        separator: '.',
                                        delimiter: '',
                                        unit: '',
                                        suffixUnit: ''
                                    }}
                                    value={this.state.maxPrice}
                                    onChangeText={maxPrice => {
                                        maxPrice == 0 ?
                                            this.setState({ maxPrice: 0 })
                                            : this.setState({ maxPrice: maxPrice })
                                    }}
                                    style={[commonStyles.inputText, {
                                        fontSize: Fonts.FONT_SIZE_X_MEDIUM, borderColor: Colors.COLOR_BACKGROUND,
                                        borderWidth: Constants.BORDER_WIDTH, marginTop: -Constants.MARGIN_X_LARGE,
                                        width: screen.width / 2.2,
                                        paddingHorizontal: Constants.PADDING_LARGE,
                                        textAlign: 'center'
                                    }]}
                                    // placeholder={'Nhập giá cao nhất'}
                                    keyboardType="numeric"
                                    returnKeyType={"next"}
                                // onSubmitEditing={this.gotoCategory}
                                />
                            </View>
                        </View>}

                        {/* Sort */}
                        {(!this.state.filterBySeller) &&
                        <View style={{ backgroundColor: Colors.COLOR_WHITE, marginVertical: Constants.MARGIN_LARGE }}>
                            <Text style={[commonStyles.text, { marginHorizontal: 0, padding: Constants.PADDING_X_LARGE }]}>{localizes('filterNewSelling.sortBy')}</Text>
                            <View style={{ paddingRight: Constants.PADDING_LARGE, paddingBottom: Constants.PADDING_LARGE, marginLeft: -Constants.MARGIN }}>
                                {this.listTextSort.map((text, index) => {
                                    return (
                                        this.renderCheckBook(text, index, () => this.setState({ sortSelected: index }), sortSelected)
                                    )
                                })}
                            </View>
                        </View>}

                        {/* Confrim button */}
                        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                            {/* Confirm */}
                            {this.renderCommonButton(
                                localizes('filterNewSelling.apply'),
                                { color: Colors.COLOR_WHITE },
                                { marginHorizontal: Constants.MARGIN_X_LARGE },
                                () => this.onFilter()
                            )}
                        </View>
                    </Content>
                    {this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container >
        );
    }

    /**
     * Render check book
     */
    renderCheckBook(text, index, onPress, selected) {
        return (
            <CheckBox
                key={index}
                title={text}
                textStyle={[commonStyles.text, { flex: 1, fontWeight: 'normal' }]}
                checkedColor={Colors.COLOR_PRIMARY}
                checkedIcon='dot-circle-o'
                uncheckedIcon='circle-o'
                iconRight
                checked={index == selected ? true : false}
                containerStyle={styles.checkBox}
                onPress={onPress}
            />
        )
    }

    /**
     * Filter selling
     */
    onFilter() {
        if (this.state.minPrice.toString().trim().split(".").join("") * 1 < MIN_PRICE) {
            this.showMessage('Giá tiền tối thiểu nhập không hợp lệ');
        }
        else if (this.state.maxPrice.toString().trim().split(".").join("") * 1 < MIN_PRICE) {
            this.showMessage('Giá tiền tối đa nhập không hợp lệ');
        }
        else if (this.state.maxPrice.toString().trim().split(".").join("") * 1 > MAX_PRICE) {
            this.showMessage('Giá tiền tối đa nhập không hợp lệ');
        }
        else if (this.state.minPrice.toString().trim().split(".").join("") * 1 >= MAX_PRICE) {
            this.showMessage('Giá tiền tối thiểu nhập không hợp lệ');
        }
        else if (this.state.minPrice.toString().trim().split(".").join("") * 1 > this.state.maxPrice.toString().trim().split(".").join("") * 1) {
            this.showMessage('Giá tiền nhập không hợp lệ');
        }
        else {
            let filter = {
                minPrice: Math.round(this.state.minPrice.toString().trim().split(".").join("") * 1),
                maxPrice: Math.round(this.state.maxPrice.toString().trim().split(".").join("") * 1),
                typeSort: this.state.sortSelected,
                typeFilter: this.state.filterSelected
            }
            this.onBack()
            this.callBack(filter)
        }
    }
}

export default FilterNewsSellingVehicleView;
