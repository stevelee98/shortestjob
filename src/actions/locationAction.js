import { ActionEvent, getActionSuccess } from './actionEvent';

export const getBranch = () => ({
    type: ActionEvent.GET_BRANCH
})

export const getBranchSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_BRANCH),
    payload: { data }
})

export const searchBranch = data => ({
    type: ActionEvent.SEARCH_BRANCH,
    payload: data
})

export const searchBranchSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEARCH_BRANCH),
    payload: { data }
})

export const getAddressFromPlaceId = (placeId, key) => ({
    type: ActionEvent.GET_ADDRESS_FROM_PLACE_ID,
    payload: { placeId, key }
})

export const getAddressFromPlaceIdSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_ADDRESS_FROM_PLACE_ID),
    payload: { data }
})

export const getMyLocationByLatLng = (location, key) => ({
    type: ActionEvent.GET_MY_LOCATION_BY_LAT_LNG,
    payload: { ...location, key }
})

export const getMyLocationByLatLngSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_MY_LOCATION_BY_LAT_LNG),
    payload: { data }
})

export const searchAddress = (input, key) => ({ type: ActionEvent.SEARCH_ADDRESS, payload: { input, key } })

export const searchAddressSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEARCH_ADDRESS),
    payload: { data }
})