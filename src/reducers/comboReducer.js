import { ActionEvent } from 'actions/actionEvent';

var initialState=1;

const comBoReducer=(state=initialState,action)=>{
    switch (action.type){
        case ActionEvent.CHANGE_QUANTITYCOMBO:
            state+=action.quantity;
            if(state<=1) state=1;        
            return state
        default :return state
    }
}

export default comBoReducer;