import React, { Component } from "react";
import { createAppContainer, createStackNavigator } from "react-navigation";
import LoginView from "containers/user/login/loginView";
import UserProfileView from "containers/user/profile/info/userProfileView";
import HomeView from "containers/home/homeView";
import RegisterView from "containers/user/register/registerView";
import ConfirmRegisterView from "containers/user/register/confirmRegisterView";
import SplashView from "containers/splash/splashView";
import Main from "containers/main/bottomTabNavigator";
import ForgotPasswordView from "containers/user/forgotPassword/forgotPasswordView";
import ConfirmPasswordView from "containers/user/forgotPassword/confirmPassword/confirmPasswordView";
import SettingView from "containers/user/setting/settingView";
import NotificationView from "containers/user/notification/notificationView";
import MakeSuggestionsView from "containers/user/suggestions/makeSuggestionsView";
import QuestionAnswerView from "containers/user/faq/questionAnswerView";
import Demo from "containers/demo/demo";
import ChangePasswordView from "containers/user/changePassword/changePasswordView";
import OTPView from "containers/user/otp//otpView";
import CategoryGeneralView from "containers/post/categories/categoryGeneralView"; // change this line
import ChatView from "containers/chat/chatView";
import GroupNotificationView from "containers/user/notification/groupNotificationView";
import AddAddressView from "containers/user/profile/info/addAddressView";
import SellingVehiclePostView from "containers/sellingVehicle/sellingVehiclePostView"; // change this line
import SellingVehicleView from "containers/sellingVehicle/sellingVehicleView"; // change this line
import ListChatView from "containers/chat/listChatView";
import FilterNewsSellingVehicleView from "containers/sellingVehicle/filterNewsSellingVehicleView";
import SellingVehicleDetailView from "containers/sellingVehicle/details/sellingVehicleDetailView";
import MyPostView from "containers/post/favorite/myPostView";
import ProductCategoryView from "containers/product/category/productCategoryView";
import ProductView from "containers/product/productView";
import ProductDetailView from "containers/product/details/productDetailView";
import RegisterPartnerView from "containers/user/register/partner/registerPartnerView";
import SearchSellingView from "containers/sellingVehicle/search/searchSellingView";
import sendReviewView from "containers/product/details/review/send/sendReviewView";
import reviewsView from "containers/product/details/review/list/reviewsView";
import ordersView from "containers/product/cart/order/list/ordersView";
import CartView from "containers/product/cart/cartView";
import OrderProductView from "containers/product/order/orderProductView";
import PaymentMethodView from "containers/payment/paymentMethodView";
import PayooPaymentMethodView from "containers/payment/payoo/payooPaymentMethodView";
import PostNewsView from "containers/post/postNewsView";
import BlogDetailView from "containers/home/blog/detail/blogDetailView";
import BlogView from "containers/home/blog/blogView";
import UserInfoView from "containers/user/profile/info/userInfoView";
import TermsRegulationsView from "containers/user/profile/faq/termsRegulationsView";
import ReasonReportView from "containers/sellingVehicle/report/reasonReportView";
import ListReasonReportView from "containers/sellingVehicle/report/list/listReasonReportView";
import ReviewSellingVehicleDetailView from "containers/sellingVehicle/details/reviewSellingVehicleDetailView"
import InfoSellerView from "containers/sellingVehicle/details/infoSellerView";
import RateSellerView from "containers/sellingVehicle/details/rateSellerView";
import TabCommentView from "containers/sellingVehicle/tab/tabCommentView";
import TabFacebookView from "containers/sellingVehicle/tab/tabFacebookView";

const AppNavigator = createStackNavigator(
    {
        ForgotPassword: ForgotPasswordView,
        Splash: SplashView,
        Login: LoginView,
        BlogDetail: BlogDetailView,
        Blog: BlogView,
        Register: RegisterView,
        ConfirmRegister: ConfirmRegisterView,
        Profile: UserProfileView,
        Main: Main,
        Notification: NotificationView,
        SettingView: SettingView,
        Home: HomeView,
        MakeSuggestion: MakeSuggestionsView,
        QuestionAnswer: QuestionAnswerView,
        Demo: Demo,
        ChangePassword: ChangePasswordView,
        ConfirmPassword: ConfirmPasswordView,
        OTP: OTPView,
        CategoryGeneral: CategoryGeneralView,
        Chat: ChatView,
        GroupNotification: GroupNotificationView,
        AddAddress: AddAddressView,
        SellingVehiclePost: SellingVehiclePostView,
        SellingVehicle: SellingVehicleView,
        ListChat: ListChatView,
        FilterNewsSellingVehicle: FilterNewsSellingVehicleView,
        SellingVehicleDetail: SellingVehicleDetailView,
        MyPost: MyPostView,
        ProductCategory: ProductCategoryView,
        Product: ProductView,
        ProductDetail: ProductDetailView,
        RegisterPartner: RegisterPartnerView,
        SearchSelling: SearchSellingView,
        SendReview: sendReviewView,
        Reviews: reviewsView,
        Orders: ordersView,
        Cart: CartView,
        OrderProduct: OrderProductView,
        PaymentMethod: PaymentMethodView,
        PayooPaymentMethod: PayooPaymentMethodView,
        PostNews: PostNewsView,
        UserInfoView: UserInfoView,
        TermsRegulations: TermsRegulationsView,
        ReasonReport: ReasonReportView,
        ListReasonReport: ListReasonReportView,
        ReviewSellingVehicleDetail: ReviewSellingVehicleDetailView,
        InfoSeller: InfoSellerView,
        RateSeller: RateSellerView,
        TabComment: TabCommentView,
        TabFacebook: TabFacebookView
    },
    {
        initialRouteName: "Main",
        headerMode: "none"
    }
);

const BaseNavigatorContainer = createAppContainer(AppNavigator);

export { BaseNavigatorContainer as AppNavigator };
