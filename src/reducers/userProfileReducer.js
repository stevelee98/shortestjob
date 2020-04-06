import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_IELTS_SCORE:
        case ActionEvent.GET_TESTING_HISTORY:
        case ActionEvent.GET_USER_INFO:
        case ActionEvent.GET_AFFILIATE:
        case ActionEvent.GET_TESTING_HISTORY_NEW:
        case ActionEvent.EDIT_PROFILE:
        case ActionEvent.CHANGE_TARGET_POINT:
        case ActionEvent.GET_USER_SCORE_LIST:
        case ActionEvent.GET_TOTAL_SCORE_MARK_TEACHER:
        case ActionEvent.GET_PACKAGE_REQUEST:
        case ActionEvent.LOGIN_FB:
        case ActionEvent.LOGIN_GOOGLE:
        case ActionEvent.CHECK_CONVERSATION_ACTIVE:
        case ActionEvent.GET_ORDERS_OF_PRODUCT:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type,
                screen: action.screen
            }
            break;
        case getActionSuccess(ActionEvent.GET_IELTS_SCORE):
        case getActionSuccess(ActionEvent.GET_TESTING_HISTORY):
        case getActionSuccess(ActionEvent.GET_USER_INFO):
        case getActionSuccess(ActionEvent.GET_AFFILIATE):
        case getActionSuccess(ActionEvent.GET_TESTING_HISTORY_NEW):
        case getActionSuccess(ActionEvent.EDIT_PROFILE):
        case getActionSuccess(ActionEvent.CHANGE_TARGET_POINT):
        case getActionSuccess(ActionEvent.GET_USER_SCORE_LIST):
        case getActionSuccess(ActionEvent.GET_TOTAL_SCORE_MARK_TEACHER):
        case getActionSuccess(ActionEvent.GET_PACKAGE_REQUEST):
        case getActionSuccess(ActionEvent.LOGIN_FB):
        case getActionSuccess(ActionEvent.LOGIN_GOOGLE):
        case getActionSuccess(ActionEvent.CHECK_CONVERSATION_ACTIVE):
        case getActionSuccess(ActionEvent.GET_ORDERS_OF_PRODUCT):
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