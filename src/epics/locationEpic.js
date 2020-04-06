import { ActionEvent } from 'actions/actionEvent'
import { Observable } from 'rxjs';
import {
    map,
    filter,
    catchError,
    mergeMap
} from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { delay, mapTo, switchMap } from 'rxjs/operators';
import { dispatch } from 'rxjs/internal/observable/range';
import { Header, handleErrors, consoleLogEpic, handleConnectErrors } from './commonEpic';
import { ErrorCode } from 'config/errorCode';
import { fetchError } from 'actions/commonActions';
import { ServerPath } from 'config/Server';
import * as location from 'actions/locationAction';
import ApiUtil from 'utils/apiUtil';

export const getBranchEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_BRANCH),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `location/branch`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return location.getBranchSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_BRANCH GET_BRANCH_EPIC:", ActionEvent.GET_BRANCH, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const searchBranchEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEARCH_BRANCH),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `location/branch/${action.payload}/search`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                console.log('response', response)
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return location.searchBranchSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("SEARCH_BRANCH SEARCH_BRANCH_EPIC:", ActionEvent.SEARCH_BRANCH, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const searchAddressEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEARCH_ADDRESS),
        switchMap((action) =>
            fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=
            ${action.payload.input}&language=vi&components=country:VN&key=${action.payload.key}`, {
                    method: 'GET',
                    headers: ApiUtil.getHeader()
                }).then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    return handleErrors(response)
                }).then((responseJson) => {
                    console.log("JSON", responseJson);
                    return location.searchAddressSuccess(responseJson);
                })
                .catch((error) => {
                    consoleLogEpic("SEARCH_ADDRESS:", ActionEvent.SEARCH_ADDRESS, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getAddressFromPlaceIdEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_ADDRESS_FROM_PLACE_ID),
        switchMap((action) =>
            fetch(`https://maps.googleapis.com/maps/api/geocode/json?place_id=${action.payload.placeId}&key=${action.payload.key}`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("JSON", responseJson);
                return location.getAddressFromPlaceIdSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_ADDRESS_FROM_PLACE_ID:", ActionEvent.GET_ADDRESS_FROM_PLACE_ID, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getMyLocationByLatLngEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_MY_LOCATION_BY_LAT_LNG),
        switchMap((action) =>
            fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=
            ${action.payload.latitude},${action.payload.longitude}&key=${action.payload.key}`, {
                    method: 'GET',
                    headers: ApiUtil.getHeader()
                }).then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    return handleErrors(response)
                }).then((responseJson) => {
                    console.log("JSON", responseJson);
                    return location.getMyLocationByLatLngSuccess(responseJson);
                })
                .catch((error) => {
                    consoleLogEpic("GET_MY_LOCATION_BY_LAT_LNG:", ActionEvent.GET_MY_LOCATION_BY_LAT_LNG, error);
                    return handleConnectErrors(error)
                })
        )
    );