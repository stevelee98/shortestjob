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
import * as productActions from 'actions/productActions';
import ApiUtil from 'utils/apiUtil';

export const getProductCategoryEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_PRODUCT_CATEGORY),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `product/category`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return productActions.getProductCategorySuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_PRODUCT_CATEGORY_EPIC:", ActionEvent.GET_PRODUCT_CATEGORY, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getAllProductByCategoryEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_ALL_PRODUCT_BY_CATEGORY),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `product/all`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return productActions.getAllProductByCategorySuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_ALL_PRODUCT_BY_CATEGORY_EPIC:", ActionEvent.GET_ALL_PRODUCT_BY_CATEGORY, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getDetailProductEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_DETAIL_PRODUCT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `product/detail`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return productActions.getDetailProductSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("GET_DETAIL_PRODUCT EPIC:", ActionEvent.GET_DETAIL_PRODUCT, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getDetailProductInCartEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_DETAIL_PRODUCT_IN_CART),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `product/detail`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return productActions.getDetailProductInCartSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("GET_DETAIL_PRODUCT_IN_CART EPIC:", ActionEvent.GET_DETAIL_PRODUCT_IN_CART, error);
                return handleConnectErrors(error)
            })
        )
    );

export const searchSellingEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEARCH_SELLING),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `product/search`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return productActions.searchSellingSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("SEARCH_SELLING_EPIC:", ActionEvent.SEARCH_SELLING, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getCategoryFilterProductEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_CATEGORY_FILTER_PRODUCT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `product/category/filter`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return productActions.getCategoryFilterProductSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_CATEGORY_FILTER_PRODUCT_EPIC:", ActionEvent.GET_CATEGORY_FILTER_PRODUCT, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getOrdersOfProductEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_ORDERS_OF_PRODUCT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `product/orders`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return productActions.getOrdersOfProductSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("getOrdersOfProductEpic:", ActionEvent.GET_ORDERS_OF_PRODUCT, error);
                return handleConnectErrors(error)
            })
        )
    );

export const orderProductEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.ORDER_PRODUCT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `product/order`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return productActions.orderProductSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("ORDER_PRODUCT EPIC:", ActionEvent.ORDER_PRODUCT, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const cancelOrderProductEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CANCEL_ORDER_PRODUCT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `product/cancel/order`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return productActions.cancelOrderProductSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("CANCEL_ORDER_PRODUCT EPIC:", ActionEvent.CANCEL_ORDER_PRODUCT, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getDetailOrderProductEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_DETAIL_OF_ORDER),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `product/order/${action.payload.orderId}/detail`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return productActions.getDetailOfOrderSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("GET_DETAIL_OF_ORDER:", ActionEvent.GET_DETAIL_OF_ORDER, error);
                return handleConnectErrors(error)
            })
        )
    );

export const saveInfoPaymentEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SAVE_INFO_PAYMENT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'product/save/info/payment', {
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
                    console.log(responseJson);
                    return productActions.saveInfoPaymentSuccess(responseJson);
                })
                .catch((error) => {
                    consoleLogEpic("SAVE_INFO_PAYMENT EPIC:", ActionEvent.SAVE_INFO_PAYMENT, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getNewProductEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_NEW_PRODUCT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'product/new', {
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
                    console.log(responseJson);
                    return productActions.getNewProductSuccess(responseJson);
                })
                .catch((error) => {
                    consoleLogEpic("GET_NEW_PRODUCT EPIC:", ActionEvent.GET_NEW_PRODUCT, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getHotProductEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_HOT_PRODUCT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'product/hot', {
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
                    console.log(responseJson);
                    return productActions.getHotProductSuccess(responseJson);
                })
                .catch((error) => {
                    consoleLogEpic("GET_HOT_PRODUCT EPIC:", ActionEvent.GET_HOT_PRODUCT, error);
                    return handleConnectErrors(error)
                })
        )
    );