import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_TEACHER_AVAILABLE_SCHEDULE_DETAIL:
        case ActionEvent.REGISTER_SPEAKING_SCHEDULE:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
            break;
        case getActionSuccess(ActionEvent.GET_TEACHER_AVAILABLE_SCHEDULE_DETAIL):
        case getActionSuccess(ActionEvent.REGISTER_SPEAKING_SCHEDULE):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data !== undefined ? action.payload.data : null,
                errorCode: action.payload.errorCode !== undefined ? action.payload.errorCode : action.payload.data.errorCode ,
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