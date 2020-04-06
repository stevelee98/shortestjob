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
import * as blogActions from 'actions/blogActions';
import { ServerPath } from 'config/Server';
import { Header, handleErrors, consoleLogEpic, handleConnectErrors } from './commonEpic';
import { ErrorCode } from 'config/errorCode';
import { fetchError } from 'actions/commonActions';
import ApiUtil from 'utils/apiUtil';
import global from "utils/global";

export const getBlogPostEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_BLOG_POST),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'blog/post', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            })
            .then((responseJson) => {
                console.log(responseJson.data)
                return blogActions.getBlogPostSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("GET_BLOG_POST USER_EPIC:", ActionEvent.GET_BLOG_POST, error);
                return handleConnectErrors(error)
            })
        )
    );

    export const getDetailBlogEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_DETAIL_BLOG),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `blog/post/${action.payload.id}`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            })
                .then((responseJson) => {
                    console.log(responseJson);
                    return blogActions.getDetailBlogSuccess(responseJson);
                })
                .catch((error) => {
                    consoleLogEpic("GET_DETAIL_BLOG:", ActionEvent.GET_DETAIL_BLOG, error);
                    return handleConnectErrors(error)
                })
        )
    );