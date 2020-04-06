import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST_DISPLAY:
        case ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST_HOME:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
            case ActionEvent.REFRESH_ACTION:
            return {
                ...state,
                isLoading: false,
                error: null,
                errorCode: ErrorCode.ERROR_SUCCESS,
                data: action.payload !== undefined ? action.payload : null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST_DISPLAY):
        case getActionSuccess(ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST_HOME):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data.data !== undefined ? action.payload.data.data : null,
                errorCode: action.payload.data.errorCode,
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