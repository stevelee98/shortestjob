import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_POST_LIKED:
        case ActionEvent.GET_SELLING_MY_POST_APPROVED:
        case ActionEvent.GET_SELLING_MY_POST_WAIT:
        case ActionEvent.GET_SELLING_MY_POST_REJECTED:
        case ActionEvent.GET_SELLING_MY_POST_DELETED:
        case ActionEvent.LIKE_POST:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.GET_POST_LIKED):
        case getActionSuccess(ActionEvent.GET_SELLING_MY_POST_APPROVED):
        case getActionSuccess(ActionEvent.GET_SELLING_MY_POST_WAIT):
        case getActionSuccess(ActionEvent.GET_SELLING_MY_POST_REJECTED):
        case getActionSuccess(ActionEvent.GET_SELLING_MY_POST_DELETED):
        case getActionSuccess(ActionEvent.LIKE_POST):
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