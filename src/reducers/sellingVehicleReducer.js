import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_NEWS_SELLING_VEHICLE:
        case ActionEvent.UPDATE_STATUS_SOLD_SELLING_POST:
        case ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST:
        case ActionEvent.SAVE_SELLING_VEHICLE_SEEN:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.GET_NEWS_SELLING_VEHICLE):
        case getActionSuccess(ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST):
        case getActionSuccess(ActionEvent.UPDATE_STATUS_SOLD_SELLING_POST):
        case getActionSuccess(ActionEvent.SAVE_SELLING_VEHICLE_SEEN):
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