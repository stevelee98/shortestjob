import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_SERVICE_HOME_CLEANING:
        case ActionEvent.GET_SERVICE_ESSENTIAL:
        case ActionEvent.SAVE_SERVICE_HOME_CLEANING:
        case ActionEvent.SAVE_SERVICE_ESSENTIAL:
        case ActionEvent.GET_WASHING_SERVICE:
        case ActionEvent.GET_SUB_SERVICE:
        case ActionEvent.GET_TIME_SLOT_CLEANING:
        case ActionEvent.GET_FREQUENCY_CLEANING:
        case ActionEvent.GET_FREQUENCY_WASING:
        case ActionEvent.GET_SUB_WASHING:
        case ActionEvent.GET_SUB_SERVICE_ESSENTIAL:
        case ActionEvent.GET_PRICE_ESSENTIAL:
        case ActionEvent.GET_SUB_SERVICE_LAUNDRY:
        case ActionEvent.SAVE_SERVICE_LAUNDRY:
        case ActionEvent.GET_SUB_SERVICE_OTHER:
        case ActionEvent.GET_PRICE_SERVICE_OTHER:
        case ActionEvent.GET_USER_INFO:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
            break;
        case getActionSuccess(ActionEvent.GET_SERVICE_HOME_CLEANING):
        case getActionSuccess(ActionEvent.GET_SERVICE_ESSENTIAL):
        case getActionSuccess(ActionEvent.SAVE_SERVICE_HOME_CLEANING):
        case getActionSuccess(ActionEvent.SAVE_SERVICE_ESSENTIAL):
        case getActionSuccess(ActionEvent.GET_WASHING_SERVICE):
        case getActionSuccess(ActionEvent.GET_SUB_SERVICE):
        case getActionSuccess(ActionEvent.GET_TIME_SLOT_CLEANING):
        case getActionSuccess(ActionEvent.GET_FREQUENCY_CLEANING):
        case getActionSuccess(ActionEvent.GET_FREQUENCY_WASING):
        case getActionSuccess(ActionEvent.GET_SUB_WASHING):
        case getActionSuccess(ActionEvent.GET_SUB_SERVICE_ESSENTIAL):
        case getActionSuccess(ActionEvent.GET_PRICE_ESSENTIAL):
        case getActionSuccess(ActionEvent.GET_SUB_SERVICE_LAUNDRY):
        case getActionSuccess(ActionEvent.SAVE_SERVICE_LAUNDRY):
        case getActionSuccess(ActionEvent.GET_SUB_SERVICE_OTHER):
        case getActionSuccess(ActionEvent.GET_PRICE_SERVICE_OTHER):
        case getActionSuccess(ActionEvent.GET_USER_INFO):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data.data !== undefined ? action.payload.data.data : null,
                errorCode: action.payload.data.errorCode,
                action: action.type,
            }
            break;
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