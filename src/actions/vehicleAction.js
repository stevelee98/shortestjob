import { ActionEvent, getActionSuccess } from './actionEvent';

export const getProductCategoryInHome = () => ({
    type: ActionEvent.GET_PRODUCT_CATEGORY_IN_HOME
})

export const getProductCategoryInHomeSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_PRODUCT_CATEGORY_IN_HOME),
    payload: { data }
})

export const getNewsSellingVehicle = (filter, screen) => ({
    type: ActionEvent.GET_NEWS_SELLING_VEHICLE,
    payload: { ...filter },
    screen: screen
})

export const getNewsSellingVehicleSuccess = (data, screen) => ({
    type: getActionSuccess(ActionEvent.GET_NEWS_SELLING_VEHICLE),
    payload: { data },
    screen: screen
})

export const postNewsSellingVehicle = filter => ({
    type: ActionEvent.POST_NEWS_SELLING_VEHICLE,
    payload: { ...filter }
})

export const postNewsSellingVehicleSuccess = data => ({
    type: getActionSuccess(ActionEvent.POST_NEWS_SELLING_VEHICLE),
    payload: { data }
})

export const getNewsSellingVehicleInterest = (filter) => ({
    type: ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST,
    payload: { ...filter }
})

export const getNewsSellingVehicleInterestSuccess = (data) => ({
    type: getActionSuccess(ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST),
    payload: { data }
})

export const getPostLiked = filter => ({
    type: ActionEvent.GET_POST_LIKED,
    payload: { ...filter }
})

export const getPostLikedSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_POST_LIKED),
    payload: { data }
})

// export const getSellingMyPost = filter => ({
//     type: ActionEvent.GET_SELLING_MY_POST,
//     payload: { ...filter }
// })

// export const getSellingMyPostSuccess = data => ({
//     type: getActionSuccess(ActionEvent.GET_SELLING_MY_POST),
//     payload: { data }
// })

export const getSellingMyPostApproved = filter => ({
    type: ActionEvent.GET_SELLING_MY_POST_APPROVED,
    payload: { ...filter }
})

export const getSellingMyPostApprovedSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_SELLING_MY_POST_APPROVED),
    payload: { data }
})

export const getSellingMyPostWait = filter => ({
    type: ActionEvent.GET_SELLING_MY_POST_WAIT,
    payload: { ...filter }
})

export const getSellingMyPostWaitSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_SELLING_MY_POST_WAIT),
    payload: { data }
})

export const getSellingMyPostRejected = filter => ({
    type: ActionEvent.GET_SELLING_MY_POST_REJECTED,
    payload: { ...filter }
})

export const getSellingMyPostRejectedSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_SELLING_MY_POST_REJECTED),
    payload: { data }
})

export const getSellingMyPostDeleted = filter => ({
    type: ActionEvent.GET_SELLING_MY_POST_DELETED,
    payload: { ...filter }
})

export const getSellingMyPostDeletedSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_SELLING_MY_POST_DELETED),
    payload: { data }
})

export const updateStatusSoldSellingPost = sellingPostId => ({
    type: ActionEvent.UPDATE_STATUS_SOLD_SELLING_POST,
    payload: { sellingPostId }
})

export const updateStatusSoldSellingPostSuccess = data => ({
    type: getActionSuccess(ActionEvent.UPDATE_STATUS_SOLD_SELLING_POST),
    payload: { data }
});

export const getNewsSellingVehicleInterestDisplay = filter => ({
    type: ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST_DISPLAY,
    payload: { ...filter }
})

export const getNewsSellingVehicleInterestDisplaySuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST_DISPLAY),
    payload: { data }
})

export const getNewsSellingVehicleInterestHome = filter => ({
    type: ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST_HOME,
    payload: { ...filter }
})

export const getNewsSellingVehicleInterestHomeSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST_HOME),
    payload: { data }
})

export const getSellingVehicleDetail = sellingVehicleId => ({
    type: ActionEvent.GET_SELLING_VEHICLE_DETAIL,
    payload: { sellingVehicleId }
})

export const getSellingVehicleDetailSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_SELLING_VEHICLE_DETAIL),
    payload: { data }
})

export const reNewsSelling = sellingVehicleId => ({
    type: ActionEvent.RENEWS_SELLING,
    payload: { sellingVehicleId }
})

export const reNewsSellingSuccess = data => ({
    type: getActionSuccess(ActionEvent.RENEWS_SELLING),
    payload: { data }
})

export const addReportIssue = filter => ({
    type: ActionEvent.ADD_REPORT_ISSUE,
    payload: { ...filter }
})

export const addReportIssueSuccess = data => ({
    type: getActionSuccess(ActionEvent.ADD_REPORT_ISSUE),
    payload: { data }
})

export const getReportIssue = () => ({
    type: ActionEvent.GET_REPORT_ISSUE,
})

export const getReportIssueSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_REPORT_ISSUE),
    payload: { data }
})

export const getSellingVehicleSeen = filter => ({
    type: ActionEvent.GET_SELLING_VEHICLE_SEEN,
    payload: { ...filter }
})

export const getSellingVehicleSeenSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_SELLING_VEHICLE_SEEN),
    payload: { data }
})

export const saveSellingVehicleSeen = filter => ({
    type: ActionEvent.SAVE_SELLING_VEHICLE_SEEN,
    payload: { ...filter }
})

export const saveSellingVehicleSeenSuccess = data => ({
    type: getActionSuccess(ActionEvent.SAVE_SELLING_VEHICLE_SEEN),
    payload: { data }
})

export const likePost = filter => ({
    type: ActionEvent.LIKE_POST,
    payload: { ...filter }
})

export const likePostSuccess = data => ({
    type: getActionSuccess(ActionEvent.LIKE_POST),
    payload: { data }
})

export const searchCarByVehicle = filter => ({
    type: ActionEvent.SEARCH_CAR_VEHICLE,
    payload: { ...filter }
})

export const searchCarByVehicleSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEARCH_CAR_VEHICLE),
    payload: { data }
})

export const getCategoryCar = filter => ({
    type: ActionEvent.GET_CATEGORY_CAR,
    payload: { ...filter }
})

export const getCategoryCarSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_CATEGORY_CAR),
    payload: { data }
})

export const updateSellingVehicle = filter => ({
    type: ActionEvent.UPDATE_SELLING_VEHICLE,
    payload: { ...filter }
})

export const updateSellingVehicleSuccess = data => ({
    type: getActionSuccess(ActionEvent.UPDATE_SELLING_VEHICLE),
    payload: { data }
})

export const deleteSellingVehicle = sellingVehicleId => ({
    type: ActionEvent.DELETE_SELLING_VEHICLE,
    payload: { sellingVehicleId }
})

export const deleteSellingVehicleSuccess = data => ({
    type: getActionSuccess(ActionEvent.DELETE_SELLING_VEHICLE),
    payload: { data }
})

export const refreshAction = data => ({
    type: ActionEvent.REFRESH_ACTION,
    payload: { data }
})

export const checkExistConversationInSelling = filter => ({
    type: ActionEvent.CHECK_EXIST_CONVERSATION_IN_SELLING,
    payload: { ...filter }
})

export const checkExistConversationInSellingSuccess = data => ({
    type: getActionSuccess(ActionEvent.CHECK_EXIST_CONVERSATION_IN_SELLING),
    payload: { data }
})