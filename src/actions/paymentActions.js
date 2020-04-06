import { ActionEvent, getActionSuccess } from './actionEvent';

export const getBanksPartner = () => ({
    type: ActionEvent.GET_BANKS_PARTNER
})

export const getBanksPartnerSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_BANKS_PARTNER),
    payload: { data }
})

export const getFeePaymentPayoo = () => ({
    type: ActionEvent.GET_FEE_PAYMENT_PAYOO
})

export const getFeePaymentPayooSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_FEE_PAYMENT_PAYOO),
    payload: { data }
});

export const createOrderInfoPayoo = filter => ({
    type: ActionEvent.CREATE_ORDER_INFO_PAYOO,
    payload: { ...filter }
})

export const createOrderInfoPayooSuccess = data => ({
    type: getActionSuccess(ActionEvent.CREATE_ORDER_INFO_PAYOO),
    payload: { data }
})

export const savePaymentPayooDetail = filter => ({
    type: ActionEvent.SAVE_PAYMENT_PAYOO_DETAIL,
    payload: { ...filter }
})

export const savePaymentPayooDetailSuccess = data => ({
    type: getActionSuccess(ActionEvent.SAVE_PAYMENT_PAYOO_DETAIL),
    payload: { data }
});