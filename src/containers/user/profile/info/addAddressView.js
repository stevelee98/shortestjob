import React, { Component } from "react";
import {
    View,
    Text,
    TextInput,
    Keyboard,
    Dimensions,
    BackHandler,
    ImageBackground,
    TouchableOpacity,
    Image
} from "react-native";
import BaseView from "containers/base/baseView";
import styles from "./styles";
import { Container, Root, Header, Form, Switch, Content } from "native-base";
import { Colors } from "values/colors";
import commonStyles from "styles/commonStyles";
import { Constants } from "values/constants";
import Utils from "utils/utils";
import MapCustomView from "containers/map/mapCustomView";
import global from "utils/global";
import { Fonts } from "values/fonts";
import { localizes } from "locales/i18n";
import * as userActions from "actions/userActions";
import * as locationActions from "actions/locationAction";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import SearchBox from "containers/map/searchBox/searchBox";
import { configConstants } from "values/configConstants";
import DialogCustom from "components/dialogCustom";
import TextInputCustom from "components/textInputCustom"
import ic_delete_white from "images/ic_delete_white.png";
import screenType from "enum/screenType";
import GeoLocationView from "containers/location/geoLocationView";

const window = Dimensions.get("window");

class AddAddressView extends GeoLocationView {
    constructor(props) {
        super(props);
        this.state = {
            coordinate: null,
            addressId: null,
            address: null,
            fullName: null,
            phone: null,
            isDefault: false,
            isDelete: false,
            isAlertSuccess: false,
            isAlertDelete: false
        };
        const { dataAddress, screen, callBack } = this.props.navigation.state.params;
        this.dataAddress = dataAddress;
        this.screen = screen;
        this.callBack = callBack;
        this.coordinate = null;
        this.oldCoordinate = null;
        this.isGetRegion = true;
    }

    componentWillMount() {
        super.componentWillMount();
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        if (!Utils.isNull(global.location)) {
            this.getCoordinate(global.location)
        }
        if (!Utils.isNull(this.dataAddress)) {
            this.setState({
                addressId: this.dataAddress.id,
                address: this.dataAddress.address,
                fullName: this.dataAddress.name,
                phone: this.dataAddress.phone,
                isDefault: this.dataAddress.isDefault
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    componentDidMount() {
        if (!Utils.isNull(this.dataAddress)) {
            this.isGetRegion = false
            this.addressFromAddress(this.dataAddress.address);
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        BackHandler.removeEventListener(
            "hardwareBackPress",
            this.handlerBackButton
        );
    }

    /**
     * Validate
     */
    validateAddress() {
        const { addressId, address, fullName, phone, isDefault } = this.state;
        if (address == "") {
            this.showMessage(localizes("register.vali_fill_address"));
            // this.address._root.focus()
        } else if (fullName == "") {
            this.showMessage(localizes("register.vali_fill_fullname"));
            // this.fullname._root.focus()
        } else if (phone == "") {
            this.showMessage(localizes("register.vali_phone"));
            // this.phone._root.focus()
        } else if (!Utils.validatePhone(phone)) {
            this.showMessage(localizes("register.errorPhone"));
        } else {
            let filter = {
                addressId: addressId,
                address: address,
                name: fullName,
                phone: phone,
                isDefault: isDefault
            };
            this.screen == screenType.FROM_ORDERS
                ? this.addReceiverInformation(filter)
                : this.props.saveAddress(filter);
        }
    }

    /**
     * Add receiver's information
     */
    addReceiverInformation(receiver) {
        this.callBack(receiver)
        this.onBack()
    }

    /**
     * Handle press map
     * @param {*} event 
     */
    handlePressMap(event) {
        this.isGetRegion = false
        this.props.getMyLocationByLatLng(event.nativeEvent.coordinate, configConstants.KEY_GOOGLE)
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (data != null && this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.SAVE_ADDRESS)) {
                    this.setState({
                        isAlertSuccess: true
                    });
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_MY_LOCATION_BY_LAT_LNG)
                    || this.props.action == getActionSuccess(ActionEvent.GET_ADDRESS_FROM_PLACE_ID)) {
                    if (!Utils.isNull(data)) {
                        if (data.status == "OK" && !Utils.isNull(data.results)) {
                            this.setState({
                                address: data.results[0].formatted_address
                            });
                            this.setCoordinate(data.results[0].geometry);
                        }
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    render() {
        const { address, fullName, phone, isDefault, isDelete, coordinate } = this.state
        console.log("RENDER ADDRESS", coordinate);
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[{
                        backgroundColor: Colors.COLOR_BACKGROUND,
                        borderBottomWidth: 0,
                        alignItems: "center"
                    }]}>
                        {this.renderHeaderView({
                            title: Utils.isNull(this.dataAddress)
                                ? "THÊM ĐỊA CHỈ"
                                : "THÔNG TIN ĐỊA CHỈ",
                            visibleStage: false,
                            titleStyle: { marginRight: Utils.isNull(this.dataAddress) ? Constants.MARGIN_XX_LARGE : 0 }
                        })}
                        {!Utils.isNull(this.dataAddress) ? (
                            <TouchableOpacity
                                style={{ paddingHorizontal: Constants.PADDING }}
                                onPress={() => {
                                    this.setState({ isAlertDelete: true, isDelete: true });
                                }}
                            >
                                <Image source={ic_delete_white} />
                            </TouchableOpacity>
                        ) : null}
                    </Header>
                    <Content>
                        <View>
                            <Form>
                                {/* Address */}
                                <View style={[commonStyles.shadowOffset, {
                                    width: "100%",
                                    height: window.height / 2,
                                    backgroundColor: Colors.COLOR_WHITE
                                }]}>
                                    {this.renderMapView({
                                        region: !Utils.isNull(coordinate) ? coordinate : null,
                                        // My location
                                        coordinate: !Utils.isNull(coordinate) ? coordinate : null,
                                        onGetGeoLocation: () => { this.getGeoLocation() },
                                        onGetCoordinate: () => {
                                            this.getCoordinate(global.location)
                                        },
                                        //Search
                                        visibleSearchBox: true,
                                        address: address,
                                        onSetAddressInput: () => this.setAddressFromInput.bind(this),
                                        // On press map
                                        onPressMap: this.handlePressMap.bind(this),
                                        isGetRegion: this.isGetRegion
                                    })}
                                </View>
                                {/* Full name */}
                                <View style={{ marginTop: Constants.MARGIN_X_LARGE - Constants.MARGIN }}>
                                    <TextInputCustom
                                        refInput={input => (this.fullName = input)}
                                        isInputNormal={true}
                                        placeholder={"Tên chủ hộ"}
                                        onChangeText={fullName => this.setState({ fullName })}
                                        value={fullName}
                                        onSubmitEditing={() => {
                                            this.phone.focus();
                                        }}
                                        keyboardType="default"
                                        returnKeyType={"next"}
                                        inputNormalStyle={[commonStyles.touchInputSpecial, commonStyles.marginForShadow]}
                                    />
                                </View>
                                {/* Phone number */}
                                <View>
                                    <TextInputCustom
                                        refInput={r => (this.phone = r)}
                                        isInputNormal={true}
                                        placeholder={localizes("register.phone")}
                                        onChangeText={phone => {
                                            this.setState({
                                                phone: phone
                                            });
                                        }}
                                        onSubmitEditing={() => {
                                            Keyboard.dismiss();
                                        }}
                                        keyboardType="numeric"
                                        returnKeyType={"done"}
                                        value={phone}
                                        inputNormalStyle={[commonStyles.touchInputSpecial, commonStyles.marginForShadow]}
                                    />
                                </View>
                                {this.screen == screenType.FROM_ORDERS
                                    ? null : <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            marginTop: Constants.MARGIN_X_LARGE,
                                            marginHorizontal: Constants.MARGIN_X_LARGE
                                        }}
                                    >
                                        <Text style={[commonStyles.text]}>
                                            Đặt làm địa chỉ mặt định
                                    </Text>
                                        <Switch
                                            value={isDefault}
                                            onValueChange={() => {
                                                this.setState({
                                                    isDefault: !isDefault
                                                });
                                            }}
                                        />
                                    </View>
                                }
                            </Form>
                            {this.renderCommonButton(
                                Utils.isNull(this.dataAddress) ? "THÊM" : "CẬP NHẬT",
                                { color: Colors.COLOR_WHITE },
                                { marginHorizontal: Constants.MARGIN_X_LARGE },
                                () => {
                                    this.onPressSaveAddress();
                                },
                                false, // isBtnLogOut
                                false // isBtnRegister
                            )}
                            {this.renderAlertDelete()}
                            {this.renderAlertSuccess()}
                        </View>
                    </Content>
                    {this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    /**
     * Render alert add address success
     */
    renderAlertSuccess() {
        return (
            <DialogCustom
                visible={this.state.isAlertSuccess}
                isVisibleTitle={true}
                isVisibleOneButton={true}
                isVisibleContentText={true}
                contentTitle={"Thông báo"}
                textBtn={"Ok"}
                contentText={
                    Utils.isNull(this.dataAddress)
                        ? "Thêm địa chỉ thành công!"
                        : this.state.isDelete
                            ? "Xóa địa chỉ thành công!"
                            : "Cập nhật địa chỉ thành công!"
                }
                onPressBtn={() => {
                    this.setState({ isAlertSuccess: false });
                    this.props.navigation.goBack();
                    this.props.navigation.state.params.refreshProfile();
                }}
            />
        );
    }

    /**
     * Render alert delete
     */
    renderAlertDelete() {
        return (
            <DialogCustom
                visible={this.state.isAlertDelete}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={"Xóa địa chỉ"}
                textBtnOne={"Hủy"}
                textBtnTwo={"Xóa"}
                contentText={"Bạn muốn địa chỉ này?"}
                onTouchOutside={() => {
                    this.setState({ isAlertDelete: false });
                }}
                onPressX={() => {
                    this.setState({
                        isAlertDelete: false,
                        isDelete: false
                    });
                }}
                onPressBtnPositive={() => {
                    this.setState({
                        isAlertDelete: false
                    });
                    let filter = {
                        addressId: this.state.addressId,
                        isDefault: false,
                        delete: true
                    };
                    this.props.saveAddress(filter);
                }}
            />
        );
    }

    /**
     * Render Search Box
     */
    renderSearchBox = () => {
        return (
            <SearchBox address={this.state.address} onSetAddressInput={this.setAddressFromInput.bind(this)} />
        );
    };

    /**
     * Get Coordinate in map
     */
    setCoordinate(geometry) {
        if (!Utils.isNull(geometry)) {
            if (this.oldCoordinate != geometry.location.lat) {
                this.oldCoordinate = geometry.location.lat;
                let region = {
                    latitude: geometry.location.lat,
                    longitude: geometry.location.lng,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015
                };
                this.setState({
                    coordinate: region
                });
            }
        }
    }

    /**
     * Get Coordinate in map
     */
    getCoordinate(marker) {
        if (!Utils.isNull(marker)) {
            this.isGetRegion = true
            this.props.getMyLocationByLatLng(marker, configConstants.KEY_GOOGLE)
        }
    }

    /**
     * Set address where typing
     */
    setAddressFromInput(address) {
        this.setState({ address });
    }

    /**
     * Get address in map
     */
    addressFromAddress(address) {
        if (!Utils.isNull(address)) {
            Geocoder.fallbackToGoogle(configConstants.KEY_GOOGLE);
            Geocoder.geocodeAddress(address)
                .then(res => {
                    let coordinate = {
                        latitude: res[0].position.lat,
                        longitude: res[0].position.lng
                    };
                    this.props.getMyLocationByLatLng(coordinate, configConstants.KEY_GOOGLE)
                })
                .catch(err => this.saveException(err, 'addressFromAddress'));
        }
    }

    /**
     * Press button add
     */
    onPressSaveAddress() {
        this.validateAddress();
    }
}

const mapStateToProps = state => ({
    data: state.address.data,
    isLoading: state.address.isLoading,
    error: state.address.error,
    errorCode: state.address.errorCode,
    action: state.address.action
});

const mapDispatchToProps = {
    ...userActions,
    ...locationActions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddAddressView);
