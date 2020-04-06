import React, { Component } from "react";
import PropTypes from 'prop-types';
import {
    ImageBackground, Dimensions, View, StatusBar, StyleSheet,
    TextInput, ScrollView, TouchableOpacity, Image, Keyboard,
    Platform
} from "react-native";
import {
    Form, Textarea, Container, Header, Title, Left, Icon, Right, Button, Body,
    Content, Text, Card, CardItem, Fab, Footer, Input, Item
} from "native-base";
import { Constants } from 'values/constants'
import { Colors } from "values/colors";
import BaseView from "containers/base/baseView";
import commonStyles from "styles/commonStyles";
import ic_back_white from 'images/ic_back_white.png';
import ic_notification_white from 'images/ic_notification_white.png';
import { Fonts } from "values/fonts";
import Utils from "utils/utils";
import ImageLoader from "components/imageLoader";
import StringUtil from "utils/stringUtil";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import GPSState from 'react-native-gps-state';
import DialogCustom from "components/dialogCustom";
import RNSettings from 'react-native-settings';
import ic_my_location_black from 'images/ic_my_location_black.png'
import ic_user_location_blue from 'images/ic_user_location_blue.png'
import MapDirections from "./directions/mapDirections";
import { Spinner } from "native-base";
import global from "utils/global";
import SearchBox from "containers/map/searchBox/searchBox";
import styles from './styles';

const screen = Dimensions.get("window");

class MapCustomView extends Component {

    static propTypes = {
        visibleMakerMyLocation: PropTypes.bool,
        visibleMaker: PropTypes.bool,
        visibleDirections: PropTypes.bool,
        visibleLoadingBar: PropTypes.bool,
        visibleButtonLocation: PropTypes.bool,
        visibleSearchBox: PropTypes.bool,
        region: PropTypes.object,
    }

    static defaultProps = {
        visibleMakerMyLocation: false,
        visibleMaker: false,
        visibleDirections: false,
        visibleLoadingBar: false,
        visibleButtonLocation: false,
        visibleSearchBox: false,
        region: null
    }

    constructor(props) {
        super(props)
        this.state = {
            turnOnGPS: true,
            isAlertGPS: false,
            firstLoadCoordinate: false
        };
        this.region = null
        this.coordinate = null
        this.initialRegion = {
            latitude: 10.56711109577269,
            latitudeDelta: 2.2360251163742255,
            longitude: 106.72833563759923,
            longitudeDelta: 1.3763229176402092
        }
    }


    componentWillMount() {
        const checkGPS = setTimeout(() => {
            this.checkGPS();
            clearTimeout(checkGPS);
        }, 1000);
    }

    checkGPS() {
        GPSState.getStatus().then((status) => {
            console.log("getStatus", status)
            switch (status) {
                case GPSState.RESTRICTED:
                    this.setState({
                        turnOnGPS: false,
                        isAlertGPS: true
                    })
                    break;

                case GPSState.AUTHORIZED:
                    this.setState({
                        turnOnGPS: true,
                        isAlertGPS: false
                    })
                    break;
            }
        });
        GPSState.addListener((status) => {
            console.log("addListener", status)
            switch (status) {
                case GPSState.RESTRICTED:
                    this.setState({
                        turnOnGPS: false,
                        isAlertGPS: true
                    })
                    break;

                case GPSState.AUTHORIZED:
                    this.setState({
                        turnOnGPS: true,
                        isAlertGPS: false
                    })
                    break;
            }
        });
    }

    /**
     * Go to setting gps
     */
    gotoSettingGPS() {
        RNSettings.openSetting(RNSettings.ACTION_LOCATION_SOURCE_SETTINGS).
            then((result) => {
                if (result === RNSettings.ENABLED) {
                    console.log('location is enabled')
                }
            })
        this.setState({ isAlertGPS: false })
    }

    onRegionChange(region) {
        this.region = region
    }

    onMapReady = () => {
    }

    onUserLocationChange(event) {
        const { isGetRegion } = this.props
        const { firstLoadCoordinate } = this.state
        if (isGetRegion) {
            const { coordinate } = event.nativeEvent
            let newCoordinate = {
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
            }
            if (!firstLoadCoordinate) {
                this.setState({ firstLoadCoordinate: true })
            }
            this.coordinate = new MapView.AnimatedRegion(newCoordinate)
            if (Platform.OS === "android") {
                if (this.markerMyLocation) {
                    this.markerMyLocation._component.animateMarkerToCoordinate(
                        newCoordinate,
                        500
                    );
                }
            } else {
                this.coordinate.timing(newCoordinate).start();
            }
        }
    }

    animateTo(region) {
        setTimeout(() => {
            !Utils.isNull(this.map) && !Utils.isNull(region) ? this.map.animateToRegion(region, 1000) : null
        }, 1000)
    }

    fitTo(latLongs) {
        setTimeout(() => {
            !Utils.isNull(this.map) && !Utils.isNull(latLongs) && latLongs.length > 0 ?
                this.map.fitToCoordinates(latLongs, {
                    edgePadding: {
                        top: Constants.PADDING_24,
                        right: Constants.PADDING_24,
                        bottom: Constants.PADDING_24,
                        left: Constants.PADDING_24
                    },
                    animated: false
                }) : null
        }, 1000)
    }

    componentWillReceiveProps(nextProps) {
        if (!Utils.isNull(this.props.latLongs)) {
            this.fitTo(this.props.latLongs)
        } else {
            if (Utils.isNull(this.region)) {
                this.region = nextProps.region
            }
            if (!nextProps.isGetRegion) {
                this.animateTo(nextProps.region)
                if (!Utils.isNull(nextProps.coordinate)) {
                    this.coordinate = nextProps.coordinate
                }
            }
        }
    }

    render() {
        const { onPressMap, styleViewBottom = {} } = this.props
        return (
            <View style={styles.container}>
                <View style={styles.container}>
                    <MapView
                        ref={ref => (this.map = ref)}
                        style={styles.map}
                        onMapReady={this.onMapReady}
                        provider={PROVIDER_GOOGLE}
                        initialRegion={this.initialRegion}
                        region={this.region}
                        onRegionChange={this.onRegionChange.bind(this)}
                        showsMyLocationButton={false}
                        showsUserLocation={true}
                        onUserLocationChange={this.onUserLocationChange.bind(this)}
                        onPress={(event) => onPressMap ? onPressMap(event) : null}
                        moveOnMarkerPress={true}
                    >
                        {/* Render marker my location */}
                        {this.props.visibleMakerMyLocation ? this.addMarkerMyLocation() : null}
                        {/* Render marker */}
                        {this.props.visibleMaker ? this.addMarker() : null}
                        {/* Render directions */}
                        {this.props.visibleDirections ? this.renderDirections() : null}
                    </MapView>
                    <View style={[styles.viewBottom, styleViewBottom]}>
                        {/* Render loading bar */}
                        {this.props.visibleLoadingBar ? this.renderLoadingBar() : null}
                        {/* Render button location */}
                        {this.props.visibleButtonLocation ? this.renderButtonLocation() : null}
                    </View>
                    <View style={{ position: 'absolute', top: 0, right: 0, left: 0 }}>
                        {/* Render search box */}
                        {this.props.visibleSearchBox ? this.renderSearchBox() : null}
                    </View>
                </View>
                {this.renderAlertNotificationGPS()}
            </View>
        );
    }

    /**
     * Back to my location
     */
    backToMyLocation() {
        this.props.onGetCoordinate()
        this.animateTo(global.location)
    }

    /**
     * Render Search Box
     */
    renderSearchBox() {
        const { address, onSetAddressInput } = this.props
        return (
            <SearchBox address={address} onSetAddressInput={onSetAddressInput} />
        );
    };

    /**
     * Render Button Location
     */
    renderButtonLocation() {
        const { onGetGeoLocation } = this.props
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={Utils.isNull(global.location) ? onGetGeoLocation : () => this.backToMyLocation()} >
                <View style={[styles.myLocationButton]}>
                    <Image source={ic_my_location_black} />
                </View>
            </TouchableOpacity>
        )
    }

    /**
     * Render Loading Bar
     */
    renderLoadingBar() {
        const { turnOnGPS } = this.state
        return (
            <View>
                {turnOnGPS ?
                    Utils.isNull(global.location)
                        ? <View style={[styles.loadingBar]}>
                            <Spinner color={Colors.COLOR_PRIMARY} />
                            <Text style={commonStyles.text}>Đang lấy vị trí của bạn!</Text>
                        </View>
                        : null
                    : Utils.isNull(global.location)
                        ? <TouchableOpacity
                            activeOpacity={Constants.ACTIVE_OPACITY}
                            onPress={() => this.gotoSettingGPS()}  >
                            <View style={[styles.loadingBar]}>
                                <Text style={commonStyles.text}>Bật GPS và thử lại!</Text>
                            </View>
                        </TouchableOpacity>
                        : null
                }
            </View>

        )
    }

    /**
     * Render directions
     */
    renderDirections() {
        const { origin, destination } = this.props
        if (Utils.isNull(origin) || Utils.isNull(destination)) {
            return null
        }
        return (
            <MapDirections
                origin={origin}
                destination={destination}
                onReady={result => !Utils.isNull(this.map) ? setTimeout(() => {
                    this.map.fitToCoordinates(result.coordinates, {
                        edgePadding: {
                            right: Constants.PADDING_24,
                            left: Constants.PADDING_24,
                            top: Constants.PADDING_24,
                            bottom: Constants.PADDING_24
                        },
                        animated: false
                    })
                }, 1000) : null}
            />
        )
    }

    /**
     * Add markers
     */
    addMarker() {
        const { markers = [], iconMarker } = this.props
        if (Utils.isNull(markers)) {
            return null
        }
        return (
            markers.map((marker) => {
                return (
                    !Utils.isNull(marker.latitude || !Utils.isNull(marker.longitude)) ?
                        <MapView.Marker
                            key={marker.id}
                            ref={ref => (this.marker = ref)}
                            coordinate={{
                                latitude: marker.latitude,
                                longitude: marker.longitude,
                            }}
                            anchor={{ x: 0.5, y: 1 }}
                        >
                            {!Utils.isNull(iconMarker) ? <Image source={iconMarker} /> : null}
                            <MapView.Callout
                                tooltip={true}>
                                <View style={styles.callOut}>
                                    <Text style={styles.titleCallout} numberOfLines={2}>{marker.name}</Text>
                                    <Text style={styles.desCallout} numberOfLines={3}>Địa chỉ: {marker.address}</Text>
                                </View>
                            </MapView.Callout>
                        </MapView.Marker> : null
                )
            }
            )
        )
    }

    /**
     * Add marker default with lat long
     */
    addMarkerMyLocation() {
        if (Utils.isNull(this.coordinate)) {
            return null
        }
        return (
            <MapView.Marker.Animated
                ref={ref => (this.markerMyLocation = ref)}
                coordinate={this.coordinate}
            >
                <Image source={ic_user_location_blue}
                    style={{
                        marginVertical: Constants.MARGIN_LARGE
                    }}>
                </Image>
            </MapView.Marker.Animated>
        )
    }

    /**
     * Render alert notification GPS
     */
    renderAlertNotificationGPS() {
        return (
            <DialogCustom
                visible={this.state.isAlertGPS}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={"Thông báo"}
                textBtnOne={"Không, cảm ơn"}
                textBtnTwo={"Bật"}
                contentText={"Bật GPS để định vị chính xác hơn!"}
                onTouchOutside={() => { this.setState({ isAlertGPS: false }) }}
                onPressX={() => {
                    this.setState({ isAlertGPS: false })
                }}
                onPressBtnPositive={() => {
                    this.gotoSettingGPS()
                }}
            />
        )
    }
}
export default MapCustomView;