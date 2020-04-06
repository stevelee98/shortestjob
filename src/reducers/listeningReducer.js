import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_EXAM_QUESTION_SECTION:
        case ActionEvent.GET_EXAM_QUESTION_SECTION_ENGSTAR:
        case ActionEvent.REGGISTER_TESTING_ENGSTAR:
        case ActionEvent.GET_EXAM_QUESTIONID_ENGLISH_STAR:
        case ActionEvent.SUBMIT_ANSWERS:
        case ActionEvent.SUBMIT_DOING_PROGRESS_START:
        case ActionEvent.SUBMIT_DOING_PROGRESS_END:
        case ActionEvent.GET_ENGSTAR_EXAM_REGISTRATION_LIST:
        case ActionEvent.GET_EXAM_QUESTION_TRIAL:
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
        case getActionSuccess(ActionEvent.GET_EXAM_QUESTION_SECTION_ENGSTAR):
        case getActionSuccess(ActionEvent.REGGISTER_TESTING_ENGSTAR):
        case getActionSuccess(ActionEvent.GET_EXAM_QUESTIONID_ENGLISH_STAR):
        case getActionSuccess(ActionEvent.SUBMIT_ANSWERS):
        case getActionSuccess(ActionEvent.SUBMIT_DOING_PROGRESS_START):
        case getActionSuccess(ActionEvent.SUBMIT_DOING_PROGRESS_END):
        case getActionSuccess(ActionEvent.GET_ENGSTAR_EXAM_REGISTRATION_LIST):
        case getActionSuccess(ActionEvent.GET_EXAM_QUESTION_TRIAL):
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