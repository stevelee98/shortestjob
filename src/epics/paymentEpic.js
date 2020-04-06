import { ActionEvent } from 'actions/actionEvent'
import { Observable } from 'rxjs';
import {
    map,
    filter,
    catchError,
    mergeMap
} from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { delay, mapTo, switchMap } from 'rxjs/operators';
import { dispatch } from 'rxjs/internal/observable/range';
import { Header, handleErrors, consoleLogEpic, handleConnectErrors } from './commonEpic';
import { ErrorCode } from 'config/errorCode';
import { fetchError } from 'actions/commonActions';
import { ServerPath } from 'config/Server';
import * as paymentActions from 'actions/paymentActions';
import ApiUtil from 'utils/apiUtil';

export const getBanksPartnerEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_BANKS_PARTNER),
        switchMap((action) =>
            fetch(ServerPath.API_PAYOO_METHOD, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.text()
                }
                return handleErrors(response)
            })
                .then((responseJson) => {
                    console.log(responseJson);
                    return paymentActions.getBanksPartnerSuccess(responseJson);
                })
                .catch((error) => {
                    consoleLogEpic("GET_BANKS_PARTNER:", ActionEvent.GET_BANKS_PARTNER, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getFeePaymentPayooEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_FEE_PAYMENT_PAYOO),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'payment/currency/fee/payoo', {
                method: 'GET',
                headers: ApiUtil.getHeader(),
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            })
                .then((responseJson) => {
                    console.log(responseJson);
                    return paymentActions.getFeePaymentPayooSuccess(responseJson);
                })
                .catch((error) => {
                    consoleLogEpic("GET_FEE_PAYMENT_PAYOO PAYMENT_EPIC:", ActionEvent.GET_FEE_PAYMENT_PAYOO, error);
                    return handleConnectErrors(error)
                })
        )
    );


export const createOrderInfoPayooEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CREATE_ORDER_INFO_PAYOO),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'payment/payoo/order/info/create', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            })
                .then((responseJson) => {
                    console.log(responseJson)
                    return paymentActions.createOrderInfoPayooSuccess(responseJson)
                }).catch((error) => {
                    consoleLogEpic("CREATE_ORDER_INFO_PAYOO EXAM_EPIC:", ActionEvent.CREATE_ORDER_INFO_PAYOO, error);
                    return handleConnectErrors(error)
                })
        )
    )

export const savePaymentPayooDetailEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SAVE_PAYMENT_PAYOO_DETAIL),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'payment/payoo', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            })
                .then((responseJson) => {
                    console.log(responseJson)
                    return paymentActions.savePaymentPayooDetailSuccess(responseJson)
                }).catch((error) => {
                    consoleLogEpic("SAVE_PAYMENT_PAYOO_DETAIL EPIC:", ActionEvent.SAVE_PAYMENT_PAYOO_DETAIL, error);
                    return handleConnectErrors(error)
                })
        )
    )