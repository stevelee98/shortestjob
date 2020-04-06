import React, { Component } from "react";
import {
    ImageBackground, View, Image, TouchableOpacity,
    BackHandler, Alert, WebView, Linking, ScrollView, NativeEventEmitter,
    DeviceEventEmitter, Platform, RefreshControl, Dimensions, SafeAreaView, NativeModules
} from "react-native";
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text, Card, CardItem, Root } from "native-base";
import styles from "./styles";
import BaseView from "containers/base/baseView";
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import ic_google_map from 'images/ic_google_map.png';
import { Constants } from "values/constants";
import Utils from 'utils/utils';
import ic_back_white from 'images/ic_back_white.png';
import * as actions from 'actions/userActions';
import * as bannerActions from 'actions/bannerActions';
import * as locationAction from 'actions/locationAction';
import * as vehicleAction from 'actions/vehicleAction';
import * as commonActions from 'actions/commonActions';
import { connect } from 'react-redux';
import StorageUtil from 'utils/storageUtil';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import { localizes } from "locales/i18n";
import firebase from 'react-native-firebase';
import RNRestart from 'react-native-restart';
import { Fonts } from "values/fonts";
import statusType from "enum/statusType";
import GeoLocationView from "containers/location/geoLocationView";
import bannerType from "enum/bannerType";
import ModalBanner from "./modal/modalBanner";
import global from 'utils/global';
import SliderBanner from "./slider/sliderBanner";
import DialogCustom from "components/dialogCustom";
import userType from "enum/userType";
import { configConstants } from "values/configConstants";
import FlatListCustom from "components/flatListCustom";
import listType from "enum/listType";
import DateUtil from "utils/dateUtil";
import VersionNumber from 'react-native-version-number';
import screenType from "enum/screenType";
import ItemProductCategory from 'containers/product/category/itemProductCategory';

const screen = Dimensions.get("window");
const ITEM_PER_COL = 2;
console.disableYellowBox = true;

class HomeView extends BaseView {
    constructor(props) {
        super(props)
        this.state = {
            user: null,
            userName: null,
            userType: null,
            avatar: "",
            appVersion: null,
            enableRefresh: true,
            refreshing: false,
            isAlertSwitchboard: false,
            isAlertVersion: false,
            vehicleNumber: null
        }
        this.bannerAfterLogin = null;
        this.bannerMainScreen = [];
        this.dataVersion = null;
        this.gotoLogin = this.gotoLogin.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.sellingCategories = [];
        this.featuredCategories = [];
        global.openModalBanner = this.openModalBanner.bind(this);
        global.onExitApp = this.onExitApp.bind(this);
    }

    /**
     * Press back exit app
     */
    onExitApp() {
        this.setState({ isAlertExitApp: true })
    }

    componentWillMount() {
        super.componentWillMount();
        // if(glo)
    }

    /**
     * Get profile user
     */
    getProfile() {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then((user) => {
            //this callback is executed when your Promise is resolved
            if (!Utils.isNull(user)) {
                console.log('User Storage - Home', user)
                // this.refreshToken()
                this.props.userInfo = user;
                this.user = user;
                setTimeout(() => {
                    this.props.getUserProfile(user.id);
                }, 3000)
                this.handleGetProfile(user);
            }
        }).catch((error) => {
            this.saveException(error, 'getProfile');
        });
    }

    // handle get profile
    handleGetProfile(user) {
        this.setState({
            user: user,
            avatar: !Utils.isNull(user.avatarPath) && user.avatarPath.indexOf('http') != -1
                ? user.avatarPath
                : this.resourceUrlPath.textValue + "/" + user.avatarPath,
            userName: user.name,
            vehicleNumber: !Utils.isNull(user.membershipCards) ? user.membershipCards.vehicleNumber : null,
            userType: user.userType
        });
    }

    async componentDidMount() {
        super.componentDidMount();
        this.getSourceUrlPath();
        StorageUtil.retrieveItem(StorageUtil.VERSION).then((version) => {
            console.log('Version', version)
            this.setState({
                appVersion: version
            })
        }).catch((error) => {
            this.saveException(error, 'componentDidMount')
        })
        StorageUtil.retrieveItem(StorageUtil.SELLING_CATEGORY).then((category) => {
            if (!Utils.isNull(category)) {
                if (!Utils.isNull(category.featuredCategories)) {
                    this.featuredCategories = category.featuredCategories;
                }
                if (!Utils.isNull(category.sellingCategories)) {
                    this.sellingCategories = category.sellingCategories;
                }
            }
        }).catch((error) => {
            this.saveException(error, 'componentDidMount')
        })
        StorageUtil.retrieveItem(StorageUtil.BANNER).then((banner) => {
            if (!Utils.isNull(banner)) {
                this.handleBanner(banner);
            }
        }).catch((error) => {
            this.saveException(error, 'componentDidMount')
        })
        this.props.getUpdateVersion();
        this.getProfile();
        this.handleRequest();
    }

    /**
     * go to Login
     */
    gotoLogin() {
        if (this.state.user == null) {
            this.showLoginView({
                routeName: "Profile",
                params: {}
            })
        } else {
            this.props.navigation.navigate('Profile')
        }
    }

    /**
     * Open modal Banner
     */
    openModalBanner(banner) {
        this.refs.modalBanner.showModal(banner, this.resourceUrlPathResize.textValue);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount()
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.userInfo
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_UPDATE_VERSION)) {
                    this.checkUpdateVersion(data, this.state.appVersion)
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_CONFIG)) {
                    this.configList = data;
                    StorageUtil.storeItem(StorageUtil.MOBILE_CONFIG, this.configList);
                    this.getSourceUrlPath();
                    this.getProfileAdmin();
                    this.props.getBanner();
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_USER_INFO)) {
                    if (!Utils.isNull(data)) {
                        if (data.status == statusType.ACTIVE) {
                            StorageUtil.storeItem(StorageUtil.USER_PROFILE, data);
                            this.handleGetProfile(data);
                        } else if (data.status == statusType.DELETE || data.status == statusType.SUSPENDED) {
                            this.logout();
                            this.goLoginScreen();
                        }
                    } else {
                        this.logout();
                        this.goLoginScreen();
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_PROFILE_ADMIN)) {
                    if (!Utils.isNull(data)) {
                        global.nameMemberChat = data.name;
                        global.userAdminId = data.id;
                        global.adminPath = data.avatarPath
                    }
                } else if (this.props.action == ActionEvent.NOTIFY_LOGIN_SUCCESS) {
                    this.getProfile()
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_BANNER)) {
                    StorageUtil.storeItem(StorageUtil.BANNER, data);
                    this.handleBanner(data);
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_PRODUCT_CATEGORY_IN_HOME)) {
                    StorageUtil.storeItem(StorageUtil.SELLING_CATEGORY, data)
                    if (!Utils.isNull(data)) {
                        if (!Utils.isNull(data.featuredCategories)) {
                            this.featuredCategories = data.featuredCategories;
                        }
                        if (!Utils.isNull(data.sellingCategories)) {
                            this.sellingCategories = data.sellingCategories;
                        }
                    }
                } else if (this.props.action == ActionEvent.GET_ALL_CART) {
                    this.quantityCart = data.quantity;
                }

            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    /**
    * Get profile admin
    */
    getProfileAdmin() {
        StorageUtil.retrieveItem(StorageUtil.MOBILE_CONFIG)
            .then(faq => {
                if (!Utils.isNull(faq)) {
                    this.userAdmin = faq.find(x => x.name == 'user_admin_id')
                    global.userAdminId = !Utils.isNull(this.userAdmin)
                        ? this.userAdmin.numericValue
                        : null;
                    console.log('userAdmin', global.userAdminId)
                    if (!Utils.isNull(global.userAdminId)) {
                        this.props.getProfileAdmin(this.userAdmin.numericValue);
                    }
                }
            }).catch(error => {
                //this callback is executed when your Promise is rejected
                this.saveException(error, "getProfileAdmin");
            })
    }

    /**
     * Handle banner
     * @param {*} data 
     */
    handleBanner(data) {
        this.bannerMainScreen = [];
        if (!Utils.isNull(data)) {
            data.forEach((item) => {
                if (item.type == bannerType.MAIN_SCREEN) {
                    this.bannerMainScreen.push({ ...item })
                } else if (item.type == bannerType.AFTER_LOGIN) {
                    if (this.bannerAfterLogin == null) {
                        this.bannerAfterLogin = item
                        this.openModalBanner(this.bannerAfterLogin)
                    }
                }
            })
        }
    }

    /**
     * Show search
     */
    showSearch = () => {
        this.props.navigation.navigate("SearchSelling", {
            categoryId: null,
            categoryName: "",
            callBack: null,
            placeholder: localizes('homeView.findByName')
        })
    }

    render() {
        const { user, userName, avatar } = this.state;
        console.log("RENDER HOME VIEW")
        return (
            // <MyApp />
            <Container style={styles.container}>
                <Root>
                    {/* {Header home view} */}
                    <Header style={commonStyles.header}>
                        {this.renderHeaderView({
                            visibleStage: false,
                            visibleBack: false,
                            visibleCart: false,
                            visibleSearchBar: true,
                            showCart: this.showCart,
                            quantityCart: this.quantityCart,
                            title: "",
                            visibleAccount: true,
                            gotoLogin: this.gotoLogin,
                            source: avatar,
                            placeholder: localizes('homeView.findByName'),
                            editable: false,
                            onTouchStart: this.showSearch
                        })}
                    </Header>
                    <Content
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }>
                        <View style={{ flexGrow: 1 }}>
                            {/* Slider banner */}
                            {this.renderSliderBanner()}
                            {/* Product category */}
                            {this.renderProductCategory()}
                            {/* Render Alert */}
                            {/* {this.renderAlertSwitchboard()} */}
                            {this.renderAlertExitApp()}
                            {this.renderAlertVersion()}
                        </View>
                    </Content>
                    <ModalBanner ref={'modalBanner'} parentView={this} navigation={this.props.navigation} />
                    {this.showLoadingBar(this.props.isLoading)}
                </Root >
            </Container >
        );
    }

    //onRefreshing
    handleRefresh() {
        this.setState({
            refreshing: false,
        })
        this.getProfile();
        this.handleRequest();
    }

    // handle request
    handleRequest() {
        let timeout = 1000;
        this.props.getConfig();
        let timeOutRequestOne = setTimeout(() => {
            this.props.getProductCategoryInHome();
            clearTimeout(timeOutRequestOne)
        }, timeout)
    }

    /**
     * Render Slider Banner
     */
    renderSliderBanner() {
        const { navigation } = this.props
        return (
            <SliderBanner navigation={navigation} data={this.bannerMainScreen} resourceUrlPath={this.resourceUrlPathResize.textValue} />
        )
    }

    /**
     * Render product category
     */
    renderProductCategory() {
        return (
            !Utils.isNull(this.sellingCategories)
                ? <View style={{ marginBottom: Constants.MARGIN_X_LARGE + Constants.MARGIN_LARGE }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[commonStyles.text, { paddingHorizontal: Constants.PADDING_X_LARGE }]}>{localizes('homeView.marketCatalog')}</Text>
                    </View>
                    <View>
                        <FlatListCustom
                            onRef={(ref) => { this.flatListRef = ref }}
                            style={{
                                paddingTop: Constants.MARGIN,
                                paddingBottom: Constants.MARGIN / 2
                            }}
                            keyExtractor={(item) => item.id}
                            data={this.formatData(this.sellingCategories, ITEM_PER_COL)}
                            horizontal={false}
                            itemPerRow={ITEM_PER_COL}
                            renderItem={this.renderItem.bind(this)}
                            showsHorizontalScrollIndicator={false}
                            ListHeaderComponent={() => {
                                return (
                                    !Utils.isNull(this.featuredCategories)
                                        ?
                                        this.featuredCategories.map((item, index) => {
                                            this.featuredCategories[1].id = null
                                            this.featuredCategories[1].hasChild = false
                                            return (
                                                <ItemProductCategory
                                                    key={!Utils.isNull(item) ? item.id : index}
                                                    data={this.featuredCategories}
                                                    item={item}
                                                    index={index}
                                                    isGridView={false}
                                                    onPressItem={() => this.onClickItem(item, index)}
                                                    resource={this.resourceUrlPath.textValue}
                                                />
                                            )
                                        })
                                        : null
                                )
                            }}
                        />
                    </View>
                </View>
                : null
        )
    }

    /**
     * On click item
     */
    onClickItem(item, index) {
        global.idChoose = item.id,
            index != 0 ?
                this.props.navigation.navigate("SellingVehicle", {
                    categoryId: item.id,
                    categoryName: item.name,
                    urlPathResource: this.resourceUrlPathResize.textValue,
                    parentCategory: {
                        id: item.id, name: item.name
                    },
                    itemChose: item
                })
                :
                this.props.navigation.navigate("Blog")
    }

    /**
     * Format data
     */
    formatData(data, numColumns) {
        const numberOfFullRows = Math.floor(data.length / numColumns)
        let numberOfElementsLastRow = data.length - (numberOfFullRows * numColumns)
        while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow != 0) {
            data.push(null)
            numberOfElementsLastRow = numberOfElementsLastRow + 1
        }
        return data;
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
            <ItemProductCategory
                key={!Utils.isNull(item) ? item.id : index}
                data={this.sellingCategories}
                item={item}
                index={index}
                isGridView={true}
                onPressItem={() => this.onClickItem(item)}
                resource={this.resourceUrlPath.textValue}
            />
        );
    }

    /**
     * Render alert call the switchboard
     */
    renderAlertSwitchboard() {
        return (
            <DialogCustom
                visible={this.state.isAlertSwitchboard}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={localizes('homeView.contact')}
                textBtnOne={"Chat"}
                textBtnTwo={localizes('homeView.call')}
                contentText={"Bạn muốn gọi trực tiếp (" + this.hotline.textValue + ") hay chat với admin?"}
                onTouchOutside={() => { this.setState({ isAlertSwitchboard: false }) }}
                onPressX={() => { this.setState({ isAlertSwitchboard: false }) }}
                onPressBtnOne={() => {
                    this.setState({ isAlertSwitchboard: false })
                    this.chatWithAdmin()
                }}
                onPressBtnPositive={() => {
                    this.renderCall(this.hotline.textValue)
                    this.setState({ isAlertSwitchboard: false })
                }}
            />
        )
    }

    /**
     * Render alert Exit App
     */
    renderAlertExitApp() {
        return (
            <DialogCustom
                visible={this.state.isAlertExitApp}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={localizes('homeView.notification')}
                textBtnOne={localizes('homeView.noThanks')}
                textBtnTwo={localizes('homeView.exit')}
                contentText={localizes('homeView.exitAppQuestion')}
                onTouchOutside={() => { this.setState({ isAlertExitApp: false }) }}
                onPressX={() => { this.setState({ isAlertExitApp: false }) }}
                onPressBtnPositive={() => {
                    BackHandler.exitApp()
                }}
            />
        )
    }

    /**
     * Render alert Version
     */
    renderAlertVersion() {
        if (!Utils.isNull(this.dataVersion)) {
            return (
                <DialogCustom
                    visible={this.state.isAlertVersion}
                    isVisibleTitle={true}
                    isVisibleContentText={true}
                    isVisibleTwoButton={true}
                    contentTitle={localizes('homeView.updateNewVersion')}
                    textBtnOne={this.dataVersion.force === 0 ? localizes('no') : ""}
                    textBtnTwo={localizes('yes')}
                    contentText={this.dataVersion.description}
                    onTouchOutside={() => { this.setState({ isAlertVersion: false }) }}
                    onPressX={this.dataVersion.force === 0 ? () => {
                        this.setState({ isAlertVersion: false })
                        saveStorage(this.dataVersion)
                    } : null}
                    onPressBtnPositive={() => {
                        renderWebView(this.dataVersion.link)
                        this.setState({ isAlertVersion: false })
                        saveStorage(this.dataVersion)
                    }}
                />
            )
        }
    }

    /**
     * Check update version
     */
    checkUpdateVersion = (data, appVersion) => {
        this.dataVersion = data
        if (data != null) {
            if (data.version.toString() > VersionNumber.appVersion) {
                if (data.force === 0) {
                    if (appVersion != null || appVersion != undefined) {
                        if (appVersion.version !== data.version) {
                            this.setState({ isAlertVersion: true })
                        }
                    } else {
                        this.setState({ isAlertVersion: true })
                    }
                } else {
                    this.setState({ isAlertVersion: true })
                }
            }
        } else {
            StorageUtil.deleteItem(StorageUtil.VERSION);
        }
    }
}

saveStorage = (data) => {
    StorageUtil.storeItem(StorageUtil.VERSION, data)
}

renderWebView = (link) => {
    Linking.openURL(link)
    RNRestart.Restart()
}

const mapStateToProps = state => ({
    userInfo: state.home.data,
    isLoading: state.home.isLoading,
    error: state.home.error,
    errorCode: state.home.errorCode,
    action: state.home.action
});

const mapDispatchToProps = {
    ...actions,
    ...bannerActions,
    ...locationAction,
    ...vehicleAction,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
