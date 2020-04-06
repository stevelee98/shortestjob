import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.ADD_REPORT_ISSUE:
        case ActionEvent.SEND_REVIEW_SELLING:
        case ActionEvent.GET_REVIEWS_OF_PRODUCT:
        case ActionEvent.GET_REPORT_ISSUE:
        case ActionEvent.RENEWS_SELLING:
        case ActionEvent.GET_SELLING_VEHICLE_DETAIL:
        case ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST:
        case ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST:
        case ActionEvent.UPDATE_SELLING_VEHICLE:
        case ActionEvent.DELETE_SELLING_VEHICLE:
        case ActionEvent.GET_PROFILE_ADMIN:
        case ActionEvent.LIKE_POST:
        case ActionEvent.GET_SELLING_VEHICLE_DETAIL:
        case ActionEvent.CHECK_EXIST_CONVERSATION_IN_SELLING:
        case ActionEvent.USER_SEEN_SELLING_ITEM:
        case ActionEvent.GET_RATING_SELLER:
        case ActionEvent.GET_SELLER_INFO:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type,
                paramFilter: action.payload
            }
        case getActionSuccess(ActionEvent.ADD_REPORT_ISSUE):
        case getActionSuccess(ActionEvent.GET_REVIEWS_OF_PRODUCT):
        case getActionSuccess(ActionEvent.SEND_REVIEW_SELLING):
        case getActionSuccess(ActionEvent.GET_REPORT_ISSUE):
        case getActionSuccess(ActionEvent.RENEWS_SELLING):
        case getActionSuccess(ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST):
        case getActionSuccess(ActionEvent.UPDATE_STATUS_SOLD_SELLING_POST):
        case getActionSuccess(ActionEvent.GET_SELLING_VEHICLE_DETAIL):
        case getActionSuccess(ActionEvent.UPDATE_SELLING_VEHICLE):
        case getActionSuccess(ActionEvent.DELETE_SELLING_VEHICLE):
        case getActionSuccess(ActionEvent.LIKE_POST):
        case getActionSuccess(ActionEvent.GET_SELLING_VEHICLE_DETAIL):
        case getActionSuccess(ActionEvent.CHECK_EXIST_CONVERSATION_IN_SELLING):
        case getActionSuccess(ActionEvent.USER_SEEN_SELLING_ITEM):
        case getActionSuccess(ActionEvent.GET_RATING_SELLER):
        case getActionSuccess(ActionEvent.GET_SELLER_INFO):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data.data !== undefined ? action.payload.data.data : null,
                errorCode: action.payload.data.errorCode,
                action: action.type
            }
        case ActionEvent.REQUEST_FAIL:
            return {
                ...state,
                isLoading: false,
                error: action.error,
                errorCode: action.errorCode,
                action: action.type
            }
        default:
            return state;
    }
}