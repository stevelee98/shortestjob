import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.SEND_REVIEW_SELLING:
        case ActionEvent.GET_REVIEWS_OF_PRODUCT:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type,
                paramFilter: action.payload
            }
        case getActionSuccess(ActionEvent.SEND_REVIEW_SELLING):
        case getActionSuccess(ActionEvent.GET_REVIEWS_OF_PRODUCT):
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