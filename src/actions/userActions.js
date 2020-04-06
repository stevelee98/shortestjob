import { ActionEvent, getActionSuccess } from './actionEvent'


export const login = data => ({ type: ActionEvent.LOGIN, payload: data })

export const loginSuccess = data => ({
    type: getActionSuccess(ActionEvent.LOGIN),
    payload: { data }
});

export const reloadLoginSuccess = () => ({
    type: getActionSuccess(ActionEvent.RELOAD_LOGIN_SUCCESS)
});

export const changePass = (oldPass, newPass, phone, forgotPassword) => ({
    type: ActionEvent.CHANGE_PASS, payload: { oldPass, newPass, phone, forgotPassword }
})

export const changePassSuccess = data => (
    {
        type: getActionSuccess(ActionEvent.CHANGE_PASS),
        payload: { data }
    }
)

export const forgetPass = (phone, updatePhone, id) => (
    {
        type: ActionEvent.FORGET_PASS,
        payload: { phone, updatePhone, id }
    }
)

export const forgetPassSuccess = data => ({
    type: getActionSuccess(ActionEvent.FORGET_PASS),
    payload: { data }
})

export const getUserProfile = userId => ({ type: ActionEvent.GET_USER_INFO, payload: { userId } })

export const getUserProfileSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_USER_INFO),
    payload: { data }
});

export const editProfile = userModel => ({
    type: ActionEvent.EDIT_PROFILE,
    payload: { ...userModel }
})

export const editProfileSuccess = data => ({ type: getActionSuccess(ActionEvent.EDIT_PROFILE), payload: { data } })

export const signUp = data => ({ type: ActionEvent.SIGN_UP, payload: { ...data } })

export const signUpSuccess = data => ({ type: getActionSuccess(ActionEvent.SIGN_UP), payload: { data } })

export const getCountry = () => ({ type: ActionEvent.GET_COUNTRY })

export const getCountrySuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_COUNTRY),
    payload: { data }
})

export const deleteNotifications = filter => ({
    type: ActionEvent.DELETE_NOTIFICATIONS,
    payload: { ...filter }
})

export const deleteNotificationsSuccess = data => ({
    type: getActionSuccess(ActionEvent.DELETE_NOTIFICATIONS),
    payload: { data }
})

export const addCredit = (accountName, accountNumber, accountMonth, accountYear, bankCode) => ({
    type: ActionEvent.ADD_CREDIT,
    payload: { accountName, accountNumber, accountMonth, accountYear, bankCode }
})

export const addCreditSuccess = (data) => ({
    type: getActionSuccess(ActionEvent.ADD_CREDIT),
    payload: { data }
})

export const getReview = reviewFilter => ({
    type: ActionEvent.GET_REVIEW,
    payload: reviewFilter
})

export const getReviewSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_REVIEW),
    payload: { data }
});

export const postReview = content => ({
    type: ActionEvent.POST_REVIEW,
    payload: { content }
})

export const postReviewSuccess = data => ({
    type: getActionSuccess(ActionEvent.POST_REVIEW),
    payload: { data }
})

export const getNotificationsRequest = (filter) => ({
    type: ActionEvent.GET_NOTIFICATIONS,
    filter
})

export const getNotificationsSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_NOTIFICATIONS),
    payload: { data }
})

export const getMainNotificationsRequest = (filter) => ({
    type: ActionEvent.GET_MAIN_NOTIFICATIONS,
    filter
})

export const getMainNotificationsSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_MAIN_NOTIFICATIONS),
    payload: { data }
})

export const buyPackageRequest = data => ({
    type: ActionEvent.BUY_PACKAGE,
    data
})

export const buyPackageSuccess = data => ({
    type: getActionSuccess(ActionEvent.BUY_PACKAGE),
    payload: { data }
})

export const getAffiliate = filter => ({
    type: ActionEvent.GET_AFFILIATE,
    payload: { filter }
})

export const getAffiliateSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_AFFILIATE),
    payload: { data }
})

export const resetData = () => ({
    type: ActionEvent.RESET_DATA
})

export const postNotificationsView = (filterView) => ({
    type: ActionEvent.GET_NOTIFICATIONS_VIEW,
    payload: { ...filterView }
})

export const postNotificationsViewSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_NOTIFICATIONS_VIEW),
    payload: { data }
})

export const makeSuggestions = (postData) => ({
    type: ActionEvent.MAKE_SUGGESTIONS,
    payload: { ...postData }
})

export const makeSuggestionsSuccess = data => ({
    type: getActionSuccess(ActionEvent.MAKE_SUGGESTIONS),
    payload: { data }
})

export const logout = () => ({
    type: ActionEvent.LOGOUT
})

export const notifyLoginSuccess = () => ({
    type: ActionEvent.NOTIFY_LOGIN_SUCCESS
})

export const buyPracticalWriting = (postData) => ({
    type: ActionEvent.BUY_PRACTICAL_WRITING,
    payload: { postData }
})

export const buyPracticalWritingSuccess = data => ({
    type: getActionSuccess(ActionEvent.BUY_PRACTICAL_WRITING),
    payload: { data }
})

export const loginGoogle = data => ({
    type: ActionEvent.LOGIN_GOOGLE,
    payload: data
})
export const loginGoogleSuccess = data => ({
    type: getActionSuccess(ActionEvent.LOGIN_GOOGLE),
    payload: { data }
})

export const loginFacebook = data => ({
    type: ActionEvent.LOGIN_FB,
    payload: data
})
export const loginFacebookSuccess = data => ({
    type: getActionSuccess(ActionEvent.LOGIN_FB),
    payload: { data }
})

export const regitrationStudying = () => ({
    type: ActionEvent.STUDYING,
})
export const getStudyingSuccess = data => ({
    type: getActionSuccess(ActionEvent.STUDYING),
    payload: { data }
})

export const getConfig = () => ({
    type: ActionEvent.GET_CONFIG,
})

export const getConfigSuccess = (data) => ({
    type: getActionSuccess(ActionEvent.GET_CONFIG),
    payload: { data }
})

export const changeTargetPoint = (filter) => ({
    type: ActionEvent.CHANGE_TARGET_POINT,
    payload: filter
})

export const changeTargetPointSuccess = (data) => ({
    type: getActionSuccess(ActionEvent.CHANGE_TARGET_POINT),
    payload: { data }
})

export const getUpdateVersion = () => ({
    type: ActionEvent.GET_UPDATE_VERSION
})

export const getUpdateVersionSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_UPDATE_VERSION),
    payload: { data }
})

export const getSpeakingScheduleNearest = () => ({
    type: ActionEvent.GET_EXAM_SPEAKING_SCHEDULE_NEAREST
})

export const getSpeakingScheduleNearestSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_EXAM_SPEAKING_SCHEDULE_NEAREST),
    payload: { data }
})

export const sendOTP = filter => ({
    type: ActionEvent.SEND_OTP,
    payload: { ...filter }
})

export const sendOTPSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEND_OTP),
    payload: { data }
})

export const confirmOTP = (filter) => ({
    type: ActionEvent.CONFIRM_OTP,
    filter
})

export const confirmOTPSuccess = data => ({
    type: getActionSuccess(ActionEvent.CONFIRM_OTP),
    payload: { data }
})

export const postUserDeviceInfo = (filter) => ({
    type: ActionEvent.USER_DEVICE_INFO,
    payload: { ...filter }
})

export const postUserDeviceInfoSuccess = data => ({
    type: getActionSuccess(ActionEvent.USER_DEVICE_INFO),
    payload: { data }
})

export const deleteUserDeviceInfo = (filter) => ({
    type: ActionEvent.DELETE_USER_DEVICE_INFO,
    payload: { ...filter }
})

export const pushMessage = (filter) => ({
    type: ActionEvent.PUSH_MESSAGE, payload: { ...filter }
})

export const pushMessageSuccess = data => (
    {
        type: getActionSuccess(ActionEvent.PUSH_MESSAGE),
        payload: { data }
    }
)

export const deleteUserDeviceInfoSuccess = data => ({
    type: getActionSuccess(ActionEvent.DELETE_USER_DEVICE_INFO),
    payload: { data }
})

export const countNewNotification = () => ({
    type: ActionEvent.COUNT_NEW_NOTIFICATION
})

export const countNewNotificationSuccess = data => ({
    type: getActionSuccess(ActionEvent.COUNT_NEW_NOTIFICATION),
    payload: { data }
})

export const getWallet = () => ({
    type: ActionEvent.GET_WALLET
})

export const getWalletSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_WALLET),
    payload: { data }
})

export const searchNotification = (filter) => ({
    type: ActionEvent.SEARCH_NOTIFICATION,
    payload: { ...filter }
})

export const searchNotificationSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEARCH_NOTIFICATION),
    payload: { data }
})

export const searchBlog = (filter) => ({
    type: ActionEvent.SEARCH_BLOG,
    payload: { ...filter }
})

export const searchBlogSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEARCH_BLOG),
    payload: { data }
})

export const readAllNotification = (filter) => ({
    type: ActionEvent.READ_ALL_NOTIFICATION,
    payload: { ...filter }
})

export const readAllNotificationSuccess = data => ({
    type: getActionSuccess(ActionEvent.READ_ALL_NOTIFICATION),
    payload: { data }
})

export const getNotificationsByType = (filter) => ({
    type: ActionEvent.GET_NOTIFICATIONS_BY_TYPE,
    filter
})

export const getNotificationsByTypeSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_NOTIFICATIONS_BY_TYPE),
    payload: { data }
})

export const getOrderHistory = (filter) => ({
    type: ActionEvent.GET_ORDER_HISTORY,
    payload: { ...filter }
})

export const getOrderHistorySuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_ORDER_HISTORY),
    payload: { data }
})

export const sendReview = (filter) => ({
    type: ActionEvent.SEND_REVIEW,
    payload: { ...filter }
})

export const sendReviewSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEND_REVIEW),
    payload: { data }
})

export const saveAddress = filter => ({
    type: ActionEvent.SAVE_ADDRESS,
    payload: { ...filter }
})

export const saveAddressSuccess = data => ({
    type: getActionSuccess(ActionEvent.SAVE_ADDRESS),
    payload: { data }
})

export const getMemberOfConversation = filter => ({
    type: ActionEvent.GET_MEMBER_OF_CONVERSATION,
    payload: { ...filter }
})

export const getMemberOfConversationSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_MEMBER_OF_CONVERSATION),
    payload: { data }
})

export const createConversation = filter => ({
    type: ActionEvent.CREATE_CONVERSATION,
    payload: { ...filter }
})

export const createConversationSuccess = data => ({
    type: getActionSuccess(ActionEvent.CREATE_CONVERSATION),
    payload: { data }
})

export const getProfileAdmin = userId => ({
    type: ActionEvent.GET_PROFILE_ADMIN,
    payload: { userId }
})

export const getProfileAdminSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_PROFILE_ADMIN),
    payload: { data }
});

export const getOrderReplaceable = filter => ({
    type: ActionEvent.GET_ORDER_REPLACEABLE,
    payload: { ...filter }
})

export const getOrderReplaceableSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_ORDER_REPLACEABLE),
    payload: { data }
})

export const getListPartner = () => ({
    type: ActionEvent.GET_LIST_PARTNER
})

export const getListPartnerSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_LIST_PARTNER),
    payload: { data }
})

export const savePartner = filter => ({
    type: ActionEvent.SAVE_PARTNER,
    payload: { ...filter }
})

export const savePartnerSuccess = data => ({
    type: getActionSuccess(ActionEvent.SAVE_PARTNER),
    payload: { data }
})

export const deleteConversation = conversationId => ({
    type: ActionEvent.DELETE_CONVERSATION,
    payload: { conversationId }
})

export const deleteConversationSuccess = data => ({
    type: getActionSuccess(ActionEvent.DELETE_CONVERSATION),
    payload: { data }
})

export const searchConversation = filter => ({
    type: ActionEvent.SEARCH_CONVERSATION,
    payload: { ...filter }
})

export const searchConversationSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEARCH_CONVERSATION),
    payload: { data }
})

export const checkExistConversationInHome = filter => ({
    type: ActionEvent.CHECK_EXIST_CONVERSATION_IN_HOME,
    payload: { ...filter }
})

export const checkExistConversationInHomeSuccess = data => ({
    type: getActionSuccess(ActionEvent.CHECK_EXIST_CONVERSATION_IN_HOME),
    payload: { data }
})

export const checkExistConversation = filter => ({
    type: ActionEvent.CHECK_EXIST_CONVERSATION,
    payload: { ...filter }
})

export const checkExistConversationSuccess = data => ({
    type: getActionSuccess(ActionEvent.CHECK_EXIST_CONVERSATION),
    payload: { data }
})

export const checkConversationActive = () => ({
    type: ActionEvent.CHECK_CONVERSATION_ACTIVE,
})

export const checkConversationActiveSuccess = data => ({
    type: getActionSuccess(ActionEvent.CHECK_CONVERSATION_ACTIVE),
    payload: { data }
})

export const getProfileUserChat = userId => ({
    type: ActionEvent.GET_PROFILE_USER_CHAT,
    payload: { userId }
})

export const getProfileUserChatSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_PROFILE_USER_CHAT),
    payload: { data }
});

export const sendReviewProduct = filter => ({
    type: ActionEvent.SEND_REVIEW_PRODUCT,
    payload: { ...filter }
})

export const sendReviewProductSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEND_REVIEW_PRODUCT),
    payload: { data }
})

export const sendReviewSelling = filter => ({
    type: ActionEvent.SEND_REVIEW_SELLING,
    payload: { ...filter }
})

export const sendReviewSellingSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEND_REVIEW_SELLING),
    payload: { data }
})

export const sendReviewSellingAtResponse = filter => ({
    type: ActionEvent.SEND_REVIEW_SELLING_RESPONSE,
    payload: { ...filter }
})

export const sendReviewSellingAtResponseSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEND_REVIEW_SELLING_RESPONSE),
    payload: { data }
})

export const getReviewsOfProduct = filter => ({
    type: ActionEvent.GET_REVIEWS_OF_PRODUCT,
    payload: { ...filter }
})

export const getReviewsOfProductSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_REVIEWS_OF_PRODUCT),
    payload: { data }
})

export const getReviewsOfProductAtResponse = filter => ({
    type: ActionEvent.GET_REVIEWS_OF_PRODUCT_RESPONSE,
    payload: { ...filter }
})

export const getReviewsOfProductAtResponseSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_REVIEWS_OF_PRODUCT_RESPONSE),
    payload: { data }
})

export const getParentReviewSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_PARENT_REVIEW),
    payload: { data }
})

export const getParentReview = reviewId => ({
    type: ActionEvent.GET_PARENT_REVIEW,
    payload: { reviewId }
})

export const getFirebaseToken = () => ({
    type: ActionEvent.GET_FIREBASE_TOKEN
})

export const getFirebaseTokenSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_FIREBASE_TOKEN),
    payload: { data }
})

export const getSellingBySeller = filter => ({
    type: ActionEvent.GET_SELLING_BY_SELLER,
    payload: { ...filter }
})

export const getSellingBySellerSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_SELLING_BY_SELLER),
    payload: { data }
})

export const getSellerInfo = sellerId => ({
    type: ActionEvent.GET_SELLER_INFO,
    payload: { sellerId }
})

export const getSellerInfoSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_SELLER_INFO),
    payload: { data }
})

export const userSeenSellingItem = (sellingItemId) => ({
    type: ActionEvent.USER_SEEN_SELLING_ITEM,
    payload: { sellingItemId }
})

export const userSeenSellingItemSuccess = data => ({
    type: getActionSuccess(ActionEvent.USER_SEEN_SELLING_ITEM),
    payload: { data }
})

export const rateSeller = filter => ({
    type: ActionEvent.RATE_SELLER,
    payload: { ...filter }
})

export const rateSellerSuccess = data => ({
    type: getActionSuccess(ActionEvent.RATE_SELLER),
    payload: { data }
})

export const getRatingSeller = filter => ({
    type: ActionEvent.GET_RATING_SELLER,
    payload: { ...filter }
})

export const getRatingSellerSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_RATING_SELLER),
    payload: { data }
})

export const getRating = sellerId => ({
    type: ActionEvent.GET_RATING,
    payload: { sellerId }
})

export const getRatingSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_RATING),
    payload: { data }
})