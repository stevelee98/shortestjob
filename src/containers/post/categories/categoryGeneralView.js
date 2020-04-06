import React, { Component } from "react";
import { ImageBackground, View, StatusBar, Image, TouchableOpacity, BackHandler, Alert, WebView, Linking, StyleSheet, RefreshControl, TextInput, Dimensions, ScrollView, Keyboard, Platform } from "react-native";
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text, Card, CardItem, Item, Input, Toast, Root, Col, Form } from "native-base";
import BaseView from "containers/base/baseView";
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import Utils from 'utils/utils'
import * as actions from 'actions/vehicleAction'
import * as actionsCommon from 'actions/commonActions'
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation'
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import DateUtil from "utils/dateUtil";
import ic_intro from "images/ic_intro.png";
import ModalDropdown from 'components/dropdown';
import I18n, { localizes } from "locales/i18n";
import { Fonts } from "values/fonts";
import FlatListCustom from 'components/flatListCustom'
import cleaningAndWashingType from "enum/cleaningAndWashingType";
import ServiceType from "enum/serviceType";
import StringUtil from "utils/stringUtil";
import { filter } from "rxjs/operators";
import subServiceType from "enum/subServiceType";
import serviceType from "enum/serviceType";
import moment from 'moment';;
import GridView from 'components/gridView';

import StorageUtil from 'utils/storageUtil';
import { CalendarScreen } from "components/calendarScreen";
import SubServiceType from "enum/subServiceType"
import statusType from "enum/statusType";
import ic_search_white from "images/ic_search_white.png";
import ic_cancel from "images/ic_cancel_white.png";
import areaType from "enum/areaType";
import ic_back_white from 'images/ic_back_white.png';
import CategoryGeneraItem from "./categoryGeneraItem";
import styles from "./styles";
import screenType from 'enum/screenType';
import global from 'utils/global';
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

class CategoryGeneralView extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            province: null,
            parentAreaId: null
        }
        const { params } = this.props.navigation.state;
        this.onChangeValue = params.onChangeValue;
        this.type = params.type;
        this.data = [];
        this.showNoData = false;
        this.screenType = params.screen;
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
    }

    /**
     * Get data Category
     */
    getDataCategory() {
        switch (this.type) {
            case areaType.WARD_STRING:
                let filterProvince = {
                    "type": areaType.WARD
                }
                this.props.getArea(filterProvince)
                break;
            default:
                break;
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.getDataCategory()
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    /**
      * Handle data when request
      */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_AREA)) {
                    if (!Utils.isNull(this.state.province)) {
                        this.data = data
                    } else {
                        if (this.screenType == screenType.FROM_SELLING_VEHICLE_SEEN) {
                            this.data = [{ id: null, name: localizes('categoryGeneralView.all') }]
                        } else {
                            this.data = []
                        }
                        data.forEach(item => {
                            this.data.push({ ...item })
                        })
                        this.showNoData = true;
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    /**
     * Render item
     * @param {*} item 
     * @param {*} index 
     * @param {*} parentIndex 
     * @param {*} indexInParent 
     */
    renderCategoryGeneraItem(item, index, parentIndex, indexInParent) {
        return (
            <CategoryGeneraItem
                data={this.data}
                item={item}
                index={index}
                onChangeValue={(id, name, logoPath) => {
                    global.idGeneralChoose = item.id;
                    this.onChangeValue(id, name, logoPath)
                    this.onBack()
                }}
            />
        )
    }

    /**
     * Reset data Province
     */
    resetSearchProvince() {
        this.setState({ province: null })
        this.getDataCategory()
    }

    /**
     * Search Province
     */
    searchProvince() {
        !Utils.isNull(this.state.province) ? this.resetSearchProvince() : null
    }

    render() {
        return (
            <Root>
                <Container style={styles.container}>
                    <Header style={commonStyles.header}>
                        <TouchableOpacity
                            style={{ padding: Constants.PADDING_LARGE }}
                            activeOpacity={Constants.ACTIVE_OPACITY}
                            onPress={() => this.onBack()}>
                            <Image style={{ resizeMode: 'contain' }} source={ic_back_white} />
                        </TouchableOpacity>
                        <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter, {
                            paddingHorizontal: Constants.PADDING_LARGE
                        }]} >
                            <TextInput
                                style={[commonStyles.text, {
                                    margin: 0, borderRadius: 0, flex: 1,
                                    paddingLeft: Platform.OS === 'ios' ? Constants.PADDING_LARGE : 0,
                                    color: Colors.COLOR_WHITE
                                }]}
                                placeholder={localizes('categoryGeneralView.title')}
                                placeholderTextColor={Colors.COLOR_WHITE}
                                ref={r => (this.province = r)}
                                value={this.state.province}
                                onChangeText={(text) => {
                                    this.setState({ province: text });
                                    const searchProvince = setTimeout(() => {
                                        let filter = {
                                            "type": this.type == areaType.PROVINCE_STRING
                                                ? areaType.PROVINCE
                                                : this.type == areaType.DISTRICT_STRING
                                                    ? areaType.DISTRICT
                                                    : areaType.WARD,
                                            "parentAreaId": this.state.parentAreaId,
                                            "paramSearch": text
                                        }
                                        this.props.getArea(filter)
                                        clearTimeout(searchProvince);
                                    }, 1000);
                                }}
                                keyboardType="default"
                                underlineColorAndroid='transparent'
                                returnKeyType={"done"}
                                blurOnSubmit={false}
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={() => {
                                    if (Utils.isNull(this.state.province)) {
                                        this.province.focus()
                                    }
                                    this.searchProvince()
                                }}>
                                <Image style={{ resizeMode: 'contain' }} source={Utils.isNull(this.state.province) ? ic_search_white : ic_cancel} />
                            </TouchableOpacity>
                        </View>
                    </Header>
                    <View style={{ flex: 1 }} >
                        <FlatListCustom
                            contentContainerStyle={{
                                paddingVertical: Constants.PADDING_X_LARGE
                            }}
                            style={{ flex: 1 }}
                            horizontal={false}
                            data={this.data}
                            renderItem={this.renderCategoryGeneraItem.bind(this)}
                            showsVerticalScrollIndicator={false}
                            isShowEmpty={this.showNoData}
                            isShowImageEmpty={true}
                            textForEmpty={localizes('categoryGeneralView.noData')}
                            styleEmpty={{}}
                        />
                    </View>
                    {this.showLoadingBar(this.props.isLoading)}
                </Container>
            </Root>
        );
    }
}

const mapStateToProps = state => ({
    data: state.categoryGeneral.data,
    isLoading: state.categoryGeneral.isLoading,
    error: state.categoryGeneral.error,
    errorCode: state.categoryGeneral.errorCode,
    action: state.categoryGeneral.action
});

const mapDispatchToProps = {
    ...actions,
    ...actionsCommon
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoryGeneralView);
