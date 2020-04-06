import {ActionEvent} from 'actions/actionEvent'
import {Observable} from 'rxjs';
import {
    map,
    filter,
    catchError,
    mergeMap
} from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { delay, mapTo, switchMap } from 'rxjs/operators';
import { dispatch } from 'rxjs/internal/observable/range';
import {actGetCommmissionSuccess} from 'actions/profileAction';
import { Header, handleErrors, consoleLogEpic, handleConnectErrors } from './commonEpic';
import { ErrorCode } from 'config/errorCode';
import { fetchError } from 'actions/commonActions';
import ApiUtil from 'utils/apiUtil';

/**
 * Login
 * @param {*} action$ 
 */
export const getCommission = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_COMMISSION),
        switchMap((action) =>
            fetch('http://5b2efbf647942a00149369ae.mockapi.io/commission', {
                method: 'GET',
                headers: ApiUtil.getHeader(),
                body: null
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                    console.log(responseJson);
                    return actGetCommmissionSuccess(responseJson);
                })
                .catch((error) => {
                    consoleLogEpic("GET_COMMISSION COMMISSION_EPIC:", ActionEvent.GET_COMMISSION, error);
                    return handleConnectErrors(error)
                })
        )
    );

    