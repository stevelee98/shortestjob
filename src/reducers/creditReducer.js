import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import {initialState} from './index';

export default function (state = initialState, action) {
    switch (action.type) {
        
        case ActionEvent.ADD_CREDIT:
            return{
                ...state,
                loading:true,
                error:null
            }
            break;
        case getActionSuccess(ActionEvent.ADD_CREDIT):
            return{
                ...state,
                isLoading: false,
                data: action.payload.data.data !== undefined ? action.payload.data.data : null,
                errorCode: action.payload.data.code
            }
            break;       
        default:
            return state;
    }
}