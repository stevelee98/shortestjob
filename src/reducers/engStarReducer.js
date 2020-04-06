import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';

export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.ENGSTAR_SCHOOL:
        case ActionEvent.EDIT_ENGSTAR_SCHOOL:
        case ActionEvent.REGISTER_EXAM_ENGLISH_STAR_STUDENT_INFO:
        case ActionEvent.SIGN_UP:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.ENGSTAR_SCHOOL):
        case getActionSuccess(ActionEvent.EDIT_ENGSTAR_SCHOOL):
        case getActionSuccess(ActionEvent.REGISTER_EXAM_ENGLISH_STAR_STUDENT_INFO):
        case getActionSuccess(ActionEvent.SIGN_UP):
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