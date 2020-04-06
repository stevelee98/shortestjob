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
import * as userActions from 'actions/userActions';
import { ServerPath } from 'config/Server';
import { Header, handleErrors, consoleLogEpic, handleConnectErrors } from './commonEpic';
import { ErrorCode } from 'config/errorCode';
import { fetchError } from 'actions/commonActions';
import ApiUtil from 'utils/apiUtil';
import global from "utils/global";

/**
 * Login
 * @param {*} action$ 
 */
export const loginEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.LOGIN),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/log-me-in', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                if (responseJson.errorCode == ErrorCode.LOGIN_FAIL_USERNAME_PASSWORD_MISMATCH) {
                    // this.showMessage('Tài khoản hoặc mật khẩu không đúng')
                }
                return userActions.loginSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("LOGIN USER_EPIC:", ActionEvent.LOGIN, error)
                    return handleConnectErrors(error)
                })
        )
    );

export const loginGoogleEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.LOGIN_GOOGLE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/log-me-in/google', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log('google: ', responseJson);
                if (responseJson.errorCode == ErrorCode.LOGIN_FAIL_USERNAME_PASSWORD_MISMATCH) {
                    // this.showMessage('Tài khoản hoặc mật khẩu không đúng')
                }
                return userActions.loginGoogleSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("LOGIN_GOOGLE USER_EPIC:", ActionEvent.LOGIN_GOOGLE, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const loginFacebookEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.LOGIN_FB),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/log-me-in/facebook', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log('facebook: ', responseJson);
                if (responseJson.errorCode == ErrorCode.LOGIN_FAIL_USERNAME_PASSWORD_MISMATCH) {
                    // this.showMessage('Tài khoản hoặc mật khẩu không đúng')
                }
                return userActions.loginFacebookSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("LOGIN_FB USER_EPIC:", ActionEvent.LOGIN_FB, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const deleteNotificationsEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.DELETE_NOTIFICATIONS),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/delete/notifications', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("DELETE NOTIFICATIONS: ", responseJson)
                return userActions.deleteNotificationsSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("DELETE_NOTIFICATIONS USER_EPIC:", ActionEvent.DELETE_NOTIFICATIONS, error);
                return handleConnectErrors(error)
            })
        )
    );

export const registerEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.REGISTER),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'register', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.loginSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("REGISTER USER_EPIC:", ActionEvent.REGISTER, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const changePassEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CHANGE_PASS),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/password/change', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.changePassSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("CHANGE_PASS USER_EPIC:", ActionEvent.CHANGE_PASS, error);
                    return handleConnectErrors(error);
                })
        )
    );

export const getUserInfoEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_USER_INFO),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/${action.payload.userId}/profile`, {
                method: 'GET',
                //headers:Header
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getUserProfileSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_USER_INFO USER_EPIC:", ActionEvent.GET_USER_INFO, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getSellerInfoEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_SELLER_INFO),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/${action.payload.sellerId}/profile`, {
                method: 'GET',
                //headers:Header
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getSellerInfoSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_SELLER_INFO USER_EPIC:", ActionEvent.GET_SELLER_INFO, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const editProfileEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.EDIT_PROFILE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/edit', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.editProfileSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("EDIT_PROFILE USER_EPIC:", ActionEvent.EDIT_PROFILE, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const pushMessageEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.PUSH_MESSAGE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/push/message`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.pushMessageSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("PUSH_MESSAGE USER_EPIC:", ActionEvent.PUSH_MESSAGE, error);
                    return handleConnectErrors(error);
                })
        )
    );

export const signUp = action$ =>
    action$.pipe(
        ofType(ActionEvent.SIGN_UP),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/signup', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.signUpSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("SIGN_UP USER_EPIC:", ActionEvent.SIGN_UP, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const forgetPassEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.FORGET_PASS),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/forget-password', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.forgetPassSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("FORGET_PASS USER_EPIC:", ActionEvent.FORGET_PASS, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const addCreditEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.ADD_CREDIT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/credit', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.addCreditSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("ADD_CREDIT USER_EPIC:", ActionEvent.ADD_CREDIT, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getReviewEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_REVIEW),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'review/1/10/list', {
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
                return userActions.getReviewSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_REVIEW USER_EPIC:", ActionEvent.GET_REVIEW, error);
                    return handleConnectErrors(error)
                })
        )
    )
export const postReviewEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.POST_REVIEW),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'review/1/10', {
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
                return userActions.postReviewSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("POST_REVIEW USER_EPIC:", ActionEvent.POST_REVIEW, error);
                    return handleConnectErrors(error)
                })
        )
    )

export const getNotificationsEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_NOTIFICATIONS),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/notification', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("NOTIFICATIONS: ", responseJson)
                return userActions.getNotificationsSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("GET_NOTIFICATIONS USER_EPIC:", ActionEvent.GET_NOTIFICATIONS, error);
                return handleConnectErrors(error)
            })
        )
    )

export const getNotificationsByTypeEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_NOTIFICATIONS_BY_TYPE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/notification', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("GET_NOTIFICATIONS_BY_TYPE: ", responseJson)
                return userActions.getNotificationsByTypeSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("GET_NOTIFICATIONS_BY_TYPE USER_EPIC:", ActionEvent.GET_NOTIFICATIONS_BY_TYPE, error);
                return handleConnectErrors(error)
            })
        )
    )

export const getMainNotificationsEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_MAIN_NOTIFICATIONS),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/notification', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson.data)
                return userActions.getMainNotificationsSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("GET_MAIN_NOTIFICATIONS USER_EPIC:", ActionEvent.GET_MAIN_NOTIFICATIONS, error);
                return handleConnectErrors(error)
            })
        )
    )

export const buyPackageEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.BUY_PACKAGE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/buy/exam/package', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.data)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson.data)
                return userActions.buyPackageSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("BUY_PACKAGE USER_EPIC:", ActionEvent.BUY_PACKAGE, error);
                return handleConnectErrors(error)
            })
        )
    )

export const getAffiliateEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_AFFILIATE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/affiliate/code', {
                method: 'GET',
                headers: ApiUtil.getHeader(),
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getAffiliateSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_AFFILIATE USER_EPIC:", ActionEvent.GET_AFFILIATE, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getNotificationsViewEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_NOTIFICATIONS_VIEW),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/notification/view', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.postNotificationsViewSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_NOTIFICATIONS_VIEW VIEW USER_EPIC:", ActionEvent.GET_NOTIFICATIONS_VIEW, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const makeSuggestionsEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.MAKE_SUGGESTIONS),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/contact/message', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.makeSuggestionsSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("MAKE_SUGGESTIONS USER_EPIC:", ActionEvent.MAKE_SUGGESTIONS, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const buyPracticalWritingEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.BUY_PRACTICAL_WRITING),
        switchMap((action) =>
            fetch(ServerPath.API_URL + '', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.buyPracticalWritingSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("BUY_PRACTICAL_WRITING USER_EPIC:", ActionEvent.BUY_PRACTICAL_WRITING, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const studyingEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.STUDYING),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/exam/registration/studying', {
                method: 'GET',
                headers: ApiUtil.getHeader(),
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getStudyingSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("STUDYING USER_EPIC:", ActionEvent.STUDYING, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getConfigEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_CONFIG),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/m/config', {
                method: 'GET',
                //headers:Header
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getConfigSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_CONFIG USER_EPIC:", ActionEvent.GET_CONFIG, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const changeTargetPointEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CHANGE_TARGET_POINT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/target/point/change', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.changeTargetPointSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("CHANGE_TARGET_POINT USER_EPIC:", ActionEvent.CHANGE_TARGET_POINT, error);
                    return handleConnectErrors(error)
                })
        )
    );


export const sendOTPEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEND_OTP),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/send-otp', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson.data)
                return userActions.sendOTPSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("SEND_OTP USER_EPIC:", ActionEvent.SEND_OTP, error);
                return handleConnectErrors(error)
            })
        )
    );

export const confirmOTPEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CONFIRM_OTP),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/confirm-otp', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return userActions.confirmOTPSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("CONFIRM_OTP USER_EPIC:", ActionEvent.CONFIRM_OTP, error);
                return handleConnectErrors(error)
            })
        )
    );

export const postUserDeviceInfoEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.USER_DEVICE_INFO),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/device', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.postUserDeviceInfoSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("USER_DEVICE_INFO USER_EPIC:", ActionEvent.USER_DEVICE_INFO, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const deleteUserDeviceInfoEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.DELETE_USER_DEVICE_INFO),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/delete/device', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.deleteUserDeviceInfoSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("DELETE_USER_DEVICE_INFO USER_EPIC:", ActionEvent.DELETE_USER_DEVICE_INFO, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const countNewNotificationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.COUNT_NEW_NOTIFICATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/count/new/notification', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("COUNT NEW NOTIFICATION JSON", responseJson);
                global.badgeCount = responseJson.data
                return userActions.countNewNotificationSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("COUNT_NEW_NOTIFICATION USER_EPIC:", ActionEvent.COUNT_NEW_NOTIFICATION, error);
                    return handleConnectErrors(error)
                })
        )
    );


export const getWalletEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_WALLET),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/wallet', {
                method: 'GET',
                headers: ApiUtil.getHeader(),
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("GET_WALLET JSON", responseJson);
                return userActions.getWalletSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_WALLET USER_EPIC:", ActionEvent.GET_WALLET, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const searchNotificationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEARCH_NOTIFICATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/search/notification', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("SEARCH_NOTIFICATION JSON", responseJson);
                return userActions.searchNotificationSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("SEARCH_NOTIFICATION USER_EPIC:", ActionEvent.SEARCH_NOTIFICATION, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const searchBlogEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEARCH_BLOG),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/search/blog', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("SEARCH_BLOG JSON", responseJson);
                return userActions.searchBlogSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("SEARCH_BLOG USER_EPIC:", ActionEvent.SEARCH_BLOG, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const readAllNotificationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.READ_ALL_NOTIFICATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/view/notification/all', {
                method: 'GET',
                headers: ApiUtil.getHeader(),
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("READ_ALL_NOTIFICATION JSON", responseJson);
                return userActions.readAllNotificationSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("READ_ALL_NOTIFICATION USER_EPIC:", ActionEvent.READ_ALL_NOTIFICATION, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getOrderHistoryEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_ORDER_HISTORY),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/order/history', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("JSON", responseJson);
                return userActions.getOrderHistorySuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_ORDER_HISTORY USER_EPIC:", ActionEvent.GET_ORDER_HISTORY, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const sendReviewEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEND_REVIEW),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/feedback', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("JSON", responseJson);
                return userActions.sendReviewSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("SEND_REVIEW USER_EPIC:", ActionEvent.SEND_REVIEW, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const saveAddressEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SAVE_ADDRESS),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/address', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("JSON", responseJson);
                return userActions.saveAddressSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("SAVE_ADDRESS USER_EPIC:", ActionEvent.SAVE_ADDRESS, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getOrderReplaceableEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_ORDER_REPLACEABLE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/order/replaceable`, {
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
                return userActions.getOrderReplaceableSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_ORDER_REPLACEABLE:", ActionEvent.GET_ORDER_REPLACEABLE, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getMemberOfConversationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_MEMBER_OF_CONVERSATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/member/conversation`, {
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
                return userActions.getMemberOfConversationSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_MEMBER_OF_CONVERSATION:", ActionEvent.GET_MEMBER_OF_CONVERSATION, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const createConversationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CREATE_CONVERSATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/conversation/create`, {
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
                return userActions.createConversationSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("CREATE_CONVERSATION:", ActionEvent.CREATE_CONVERSATION, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getProfileAdminEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_PROFILE_ADMIN),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/${action.payload.userId}/profile`, {
                method: 'GET',
                //headers:Header
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getProfileAdminSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_PROFILE_ADMIN USER_EPIC:", ActionEvent.GET_PROFILE_ADMIN, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getListPartnerEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_LIST_PARTNER),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/list/partner`, {
                method: 'GET',
                //headers:Header
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getListPartnerSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_LIST_PARTNER USER_EPIC:", ActionEvent.GET_LIST_PARTNER, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const savePartnerEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SAVE_PARTNER),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/save/partner`, {
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
                return userActions.savePartnerSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("SAVE_PARTNER:", ActionEvent.SAVE_PARTNER, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const deleteConversationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.DELETE_CONVERSATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/conversation/${action.payload.conversationId}/delete`, {
                method: 'GET',
                //headers:Header
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.deleteConversationSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("DELETE_CONVERSATION USER_EPIC:", ActionEvent.DELETE_CONVERSATION, error);
                return handleConnectErrors(error)
            })
        )
    );

export const searchConversationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEARCH_CONVERSATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/conversation/search`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.searchConversationSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("SEARCH_CONVERSATION USER_EPIC:", ActionEvent.SEARCH_CONVERSATION, error);
                return handleConnectErrors(error)
            })
        )
    );

export const checkExistConversationEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CHECK_EXIST_CONVERSATION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/conversation/check`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.checkExistConversationSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("CHECK_EXIST_CONVERSATION USER_EPIC:", ActionEvent.CHECK_EXIST_CONVERSATION, error);
                return handleConnectErrors(error)
            })
        )
    );

export const checkExistConversationInHomeEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CHECK_EXIST_CONVERSATION_IN_HOME),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/conversation/check`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.checkExistConversationInHomeSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("CHECK_EXIST_CONVERSATION_IN_HOME USER_EPIC:", ActionEvent.CHECK_EXIST_CONVERSATION_IN_HOME, error);
                return handleConnectErrors(error)
            })
        )
    );

export const checkConversationActiveEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CHECK_CONVERSATION_ACTIVE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/conversation/active/check`, {
                method: 'GET',
                headers: ApiUtil.getHeader(),
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.checkConversationActiveSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("CHECK_CONVERSATION_ACTIVE USER_EPIC:", ActionEvent.CHECK_CONVERSATION_ACTIVE, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getProfileUserChatEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_PROFILE_USER_CHAT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/${action.payload.userId}/profile`, {
                method: 'GET',
                //headers:Header
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getProfileUserChatSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_PROFILE_USER_CHAT USER_EPIC:", ActionEvent.GET_PROFILE_USER_CHAT, error);
                return handleConnectErrors(error)
            })
        )
    );

export const sendReviewProductEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEND_REVIEW_PRODUCT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/review', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.sendReviewProductSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("SEND_REVIEW_PRODUCT USER_EPIC:", ActionEvent.SEND_REVIEW_PRODUCT, error);
                return handleConnectErrors(error)
            })
        )
    );

export const sendReviewSellingEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEND_REVIEW_SELLING),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/review', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.sendReviewSellingSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("SEND_REVIEW_SELLING USER_EPIC:", ActionEvent.SEND_REVIEW_SELLING, error);
                return handleConnectErrors(error)
            })
        )
    );

export const sendReviewSellingAtResponseEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEND_REVIEW_SELLING_RESPONSE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/review', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.sendReviewSellingAtResponseSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("SEND_REVIEW_SELLING_RESPONSE USER_EPIC:", ActionEvent.SEND_REVIEW_SELLING_RESPONSE, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getReviewsOfProductEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_REVIEWS_OF_PRODUCT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/review/product/all', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getReviewsOfProductSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_REVIEWS_OF_PRODUCT USER_EPIC:", ActionEvent.GET_REVIEWS_OF_PRODUCT, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getReviewsOfProductAtResponseEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_REVIEWS_OF_PRODUCT_RESPONSE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/review/product/all', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getReviewsOfProductAtResponseSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_REVIEWS_OF_PRODUCT_RESPONSE USER_EPIC:", ActionEvent.GET_REVIEWS_OF_PRODUCT_RESPONSE, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getParentReviewEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_PARENT_REVIEW),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/${action.payload.reviewId}/review`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getParentReviewSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_PARENT_REVIEW USER_EPIC:", ActionEvent.GET_PARENT_REVIEW, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getRatingSellerEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_RATING_SELLER),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/rating/seller/all', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getRatingSellerSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_RATING_SELLER USER_EPIC:", ActionEvent.GET_RATING_SELLER, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getRatingEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_RATING),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `user/${action.payload.sellerId}/rating`, {
                method: 'GET',
                //headers:Header
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getRatingSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_RATING USER_EPIC:", ActionEvent.GET_RATING, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getFirebaseTokenEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_FIREBASE_TOKEN),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/firebase/token', {
                method: 'GET',
                headers: ApiUtil.getHeader(),
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.getFirebaseTokenSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_FIREBASE_TOKEN USER_EPIC:", ActionEvent.GET_FIREBASE_TOKEN, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getSellingBySellerEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_SELLING_BY_SELLER),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `vehicle/selling/seller`, {
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
                return userActions.getSellingBySellerSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_SELLING_BY_SELLER EPIC:", ActionEvent.GET_SELLING_BY_SELLER, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const userSeenSellingItemEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.USER_SEEN_SELLING_ITEM),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `vehicle/selling/${action.payload.sellingItemId}/see/save`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return userActions.userSeenSellingItemSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("USER_SEEN_SELLING_ITEM EPIC:", ActionEvent.USER_SEEN_SELLING_ITEM, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const rateSellerEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.RATE_SELLER),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'user/rate/seller', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return userActions.rateSellerSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("RATE_SELLER USER_EPIC:", ActionEvent.RATE_SELLER, error);
                return handleConnectErrors(error)
            })
        )
    );