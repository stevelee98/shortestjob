import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_PRODUCT_CATEGORY:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type,
                sttReq: action.sttReq
            }
        case ActionEvent.GET_ALL_CART:
        case ActionEvent.REFRESH_ACTION:
            return {
                ...state,
                isLoading: false,
                error: null,
                errorCode: ErrorCode.ERROR_SUCCESS,
                data: action.payload !== undefined ? action.payload : null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.GET_PRODUCT_CATEGORY):
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
                error: action.error,
                errorCode: action.errorCode,
                action: action.type
            }
        default:
            return state;
    }
}