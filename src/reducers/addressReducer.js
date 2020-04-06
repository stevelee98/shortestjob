import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.SAVE_ADDRESS:
        case ActionEvent.GET_ADDRESS_FROM_PLACE_ID:
        case ActionEvent.GET_MY_LOCATION_BY_LAT_LNG:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.SAVE_ADDRESS):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data.data !== undefined ? action.payload.data.data : null,
                errorCode: action.payload.data.errorCode,
                action: action.type,
            }
        case getActionSuccess(ActionEvent.GET_ADDRESS_FROM_PLACE_ID):
        case getActionSuccess(ActionEvent.GET_MY_LOCATION_BY_LAT_LNG):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data !== undefined ? action.payload.data : null,
                errorCode: ErrorCode.ERROR_SUCCESS,
                action: action.type,
            }
        case ActionEvent.REQUEST_FAIL:
            return {
                ...state,
                isLoading: false,
                error: action.payload.error,
                errorCode: action.payload.errorCode,
                action: action.type
            }
        default:
            return state;
    }
}