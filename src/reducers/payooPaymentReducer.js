import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';

export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_BANKS_PARTNER:
        case ActionEvent.GET_FEE_PAYMENT_PAYOO:
        case ActionEvent.CREATE_ORDER_INFO_PAYOO:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.GET_BANKS_PARTNER):
        case getActionSuccess(ActionEvent.GET_FEE_PAYMENT_PAYOO):
        case getActionSuccess(ActionEvent.CREATE_ORDER_INFO_PAYOO):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data !== undefined ? action.payload.data : null,
                errorCode: action.payload.data.errorCode,
                action: action.type,
            }
        case ActionEvent.RESET_DATA: {
            return {
                data: null,
                action: action.type
            }
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