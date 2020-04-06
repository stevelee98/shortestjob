import { combineReducers } from 'redux';
import userReducer from 'reducers/userReducer';
import examReducer from 'reducers/examReducer';
import loginReducer from 'reducers/loginReducer';
import signUpReducer from 'reducers/signUpReducer';
import homeReducer from 'reducers/homeReducer';
import { ErrorCode } from 'config/errorCode';
import testListReducer from 'reducers/testListReducer';
import listeningReducer from 'reducers/listeningReducer';
import examinationListReducer from 'reducers/examinationListReducer';
import forgetPassReducer from 'reducers/forgetPassReducer';
import changePassReducer from 'reducers/changePassReducer';
import listeningOfficialAnswerReducer from 'reducers/listeningOfficialAnswerReducer';
import addCreditReducer from 'reducers/creditReducer';
import commissionReducer from 'reducers/commissionReducer'
import writingReducer from 'reducers/writingReducer';
import registerTestingReducer from 'reducers/registerTestingReducer';
import userProfileReducer from 'reducers/userProfileReducer';
import detailTestingReducer from 'reducers/detailTestingReducer';
import registerSpeakingScheduleReducer from 'reducers/registerSpeakingScheduleReducer';
import registrationWritingReducer from 'reducers/registrationWritingReducer';
import packageReducer from 'reducers/packageReducer';
import blogDetailReducer from 'reducers/blogDetailReducer';
import notificationsReducer from 'reducers/notificationsReducer';
import makeSuggestionsReducer from 'reducers/makeSuggestionsReducer';
import typeExamReducer from 'reducers/typeExamReducer';
import engStarReducer from 'reducers/engStarReducer';
import speakingReducer from 'reducers/speakingReducer';
import listMarkTeacherReducer from 'reducers/listMarkTeacherReducer';
import mainReducer from 'reducers/mainReducer';
import serviceReducer from 'reducers/serviceReducer';
import laundryReducer from 'reducers/laundryReducer';
import listPriceReducer from 'reducers/listPriceReducer';
import introduceReducer from './introduceReducer';
import otpReducer from './otpReducer';
import currentServiceReducer from './currentServiceReducer';
import categoryGeneralReducer from './categoryGeneralReducer';
import addressReducer from './addressReducer';
import sellingVehiclePostReducer from './sellingVehiclePostReducer';
import sellingVehicleReducer from './sellingVehicleReducer';
import myPostReducer from './myPostReducer';
import productDetailReducer from './productDetailReducer';
import autocompleteReducer from './autocompleteReducer';
import sellingVehicleDetailReducer from './sellingVehicleDetailReducer';
import listChatReducer from './listChatReducer';
import chatReducer from './chatReducer';
import orderDetailReducer from './orderDetailReducer';
import partnerReducer from './partnerReducer';
import listInterestReducer from './listInterestReducer';
import productCategoryReducer from './productCategoryReducer';
import productReducer from './productReducer';
import searchSellingReducer from './searchSellingReducer';
import sendReviewReducer from './sendReviewReducer';
import reviewsReducer from './reviewsReducer';
import filterProductReducer from './filterProductReducer';
import ordersReducer from './ordersReducer';
import cartReducer from './cartReducer';
import orderProductReducer from './orderProductReducer';
import payooPaymentReducer from './payooPaymentReducer';
import newProductReducer from './newProductReducer';
import hotProductReducer from './hotProductReducer';
import postNewsReducer from './postNewsReducer';
import messageReducer from './messageReducer';
import listReasonReportReducer from './listReasonReportReducer';
import reasonReportReducer from './reasonReportReducer';
import favoriteReducer from './favoriteReducer';
import reviewSellingVehicleDetailReducer from './reviewSellingVehicleDetailReducer';
import tabSellingReducer from './tabSellingReducer';
import rateSellerReducer from './rateSellerReducer';
import tabCommentReducer from './tabCommentReducer';

export const initialState = {
    data: null,
    isLoading: false,
    error: null,
    errorCode: ErrorCode.ERROR_INIT,
    action: null
}

export default combineReducers({
    user: userReducer,
    exam: examReducer,
    login: loginReducer,
    home: homeReducer,
    signUp: signUpReducer,
    testList: testListReducer,
    listening: listeningReducer,
    examinationList: examinationListReducer,
    forgetPass: forgetPassReducer,
    changePass: changePassReducer,
    listeningOfficialAnswer: listeningOfficialAnswerReducer,
    examinationList: examinationListReducer,
    changePass: changePassReducer,
    addCredit: addCreditReducer,
    commission: commissionReducer,
    writing: writingReducer,
    registerTesting: registerTestingReducer,
    userProfile: userProfileReducer,
    detailTesting: detailTestingReducer,
    package: packageReducer,
    registerSpeakingSchedule: registerSpeakingScheduleReducer,
    registrationWriting: registrationWritingReducer,
    notifications: notificationsReducer,
    blogdetail: blogDetailReducer,
    makeSuggestions: makeSuggestionsReducer,
    typeExam: typeExamReducer,
    engStar: engStarReducer,
    speaking: speakingReducer,
    listMarkTeacher: listMarkTeacherReducer,
    main: mainReducer,
    service: serviceReducer,
    laundry: laundryReducer,
    listPrice: listPriceReducer,
    introduce: introduceReducer,
    otp: otpReducer,
    currentService: currentServiceReducer,
    categoryGeneral: categoryGeneralReducer,
    address: addressReducer,
    sellingVehiclePost: sellingVehiclePostReducer,
    sellingVehicle: sellingVehicleReducer,
    myPost: myPostReducer,
    productDetail: productDetailReducer,
    autocomplete: autocompleteReducer,
    sellingVehicleDetail: sellingVehicleDetailReducer,
    listChat: listChatReducer,
    chat: chatReducer,
    orderDetail: orderDetailReducer,
    partner: partnerReducer,
    listInterest: listInterestReducer,
    productCategory: productCategoryReducer,
    product: productReducer,
    searchSelling: searchSellingReducer,
    sendReview: sendReviewReducer,
    reviews: reviewsReducer,
    reviewSellingVehicleDetail: reviewSellingVehicleDetailReducer,
    filterProduct: filterProductReducer,
    orders: ordersReducer,
    cart: cartReducer,
    orderProduct: orderProductReducer,
    payooPayment: payooPaymentReducer,
    newProduct: newProductReducer,
    hotProduct: hotProductReducer,
    postNews: postNewsReducer,
    message: messageReducer,
    listReasonReport: listReasonReportReducer,
    reasonReport: reasonReportReducer,
    favorite: favoriteReducer,
    tabSelling: tabSellingReducer,
    rateSeller: rateSellerReducer,
    tabComment: tabCommentReducer
});

