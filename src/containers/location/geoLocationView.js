
import React, { Component } from "react";
import { View, Platform, PermissionsAndroid } from "react-native";
import BaseView from "containers/base/baseView";
import StorageUtil from "utils/storageUtil";
import global from "utils/global";
import Utils from "utils/utils";
import userType from "enum/userType";
import { configConstants } from 'values/configConstants';

export default class GeoLocationView extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            latitude: null,
            longitude: null,
            error: null
        };
        this.TIMEOUT_START_POSITION = 60000 * 5 //5p
        this.TIMEOUT_CURRENT_POSITION = 20000 //20s
        this.TIMEOUT_CACHE_OLD_POSITION = 10000 //10s
        this.DISTANCE_LOCATION = 30 //Distance value return location(m)
    }

    /**
     * Get geo location
     */
    getGeoLocation() {
        this.watchLocation();
        setInterval(() => {
            this.watchLocation();
        }, this.TIMEOUT_START_POSITION)
    }

    /**
     * Request location permission
     */
    async requestLocationPermission() {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("You can use the location")
                    this.getGeoLocation()
                } else {
                    console.log("location permission denied")
                }
            } catch (err) {
                console.log(err)
            }
        } else {
            this.getGeoLocation()
        }
    }

    /**
     * Watch location
     */
    watchLocation() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (Utils.isNull(global.location)) {
                    global.location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.015
                    }
                    this.props.getMyLocationByLatLng(global.location, configConstants.KEY_GOOGLE)
                }
                console.log("Get Current Position", position)
            },
            (error) => this.setState({ error: error.message }),
            { enableHighAccuracy: false, timeout: this.TIMEOUT_CURRENT_POSITION, maximumAge: this.TIMEOUT_CACHE_OLD_POSITION },
        );
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                if (Utils.isNull(global.location)) {
                    global.location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.015
                    }
                    this.props.getMyLocationByLatLng(global.location, configConstants.KEY_GOOGLE)
                }
                console.log("Watch Position", position)
            },
            (error) => this.setState({ error: error.message }),
            { enableHighAccuracy: false, timeout: this.TIMEOUT_CURRENT_POSITION, maximumAge: this.TIMEOUT_CACHE_OLD_POSITION, distanceFilter: this.DISTANCE_LOCATION },
        );
    }

    componentWillMount() {
        super.componentWillMount()
    }

    async componentDidMount() {
        super.componentDidMount()
        await this.requestLocationPermission()
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        navigator.geolocation.clearWatch(this.watchID);
    }

    render() {
        return (<View></View>)
    }

}