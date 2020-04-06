import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import {initialState} from './index'
import { ErrorCode } from 'config/errorCode';

export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_EXAM_QUESTION_SECTION:
        case ActionEvent.CHECK_PROMOTION_CODE:
        case ActionEvent.GET_PACKAGE_DETAIL:
        case ActionEvent.GET_LIST_UNPAID:
        case ActionEvent.SAVE_INFO_PAYMENT:
        case ActionEvent.GET_EXAMINATIONS:
        case ActionEvent.GET_LIST_EXAM_REGISTRATION:
        case ActionEvent.REGISTER_WRITING:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
            break;
        case getActionSuccess(ActionEvent.GET_EXAM_QUESTION_SECTION):
        case getActionSuccess(ActionEvent.SUBMIT_ANSWERS):
        case getActionSuccess(ActionEvent.GET_EXAM_DATE):
        case getActionSuccess(ActionEvent.GET_LIST_UNPAID):
        case getActionSuccess(ActionEvent.CHECK_PROMOTION_CODE):
        case getActionSuccess(ActionEvent.GET_PACKAGE_DETAIL):
        case getActionSuccess(ActionEvent.SAVE_INFO_PAYMENT):
        case getActionSuccess(ActionEvent.GET_EXAMINATIONS):
        case getActionSuccess(ActionEvent.GET_LIST_EXAM_REGISTRATION):
        case getActionSuccess(ActionEvent.REGISTER_WRITING):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data.data !== undefined ? action.payload.data.data : null,
                errorCode: action.payload.data.errorCode,
                action: action.type,
            }
            break;
        // case ActionEvent.GET_IELTS_SCORE_SUCCESS:
        //     return {...action.data.data.data[0]};
        case ActionEvent.GET_WRITING_SCORE:
            return{
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.GET_WRITING_SCORE):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data.data !== undefined ? action.payload.data.data : null,
                errorCode: action.payload.data.errorCode,
                action:action.type
            }
        case ActionEvent.GET_READING_DETAIL:
            return{
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.GET_READING_DETAIL):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data.data !== undefined ? action.payload.data.data : null,
                errorCode: action.payload.data.errorCode,
                action:action.type
            }
        default:
            return state;
    }
}
