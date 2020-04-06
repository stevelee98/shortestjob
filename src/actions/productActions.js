import { ActionEvent, getActionSuccess } from './actionEvent';

export const getProductCategory = (filter, sttReq) => ({
    type: ActionEvent.GET_PRODUCT_CATEGORY,
    payload: { ...filter },
    sttReq: sttReq
})

export const getProductCategorySuccess = (data, sttReq) => ({
    type: getActionSuccess(ActionEvent.GET_PRODUCT_CATEGORY),
    payload: { data },
    sttReq: sttReq
})

export const getAllProductByCategory = (filter, screen) => ({
    type: ActionEvent.GET_ALL_PRODUCT_BY_CATEGORY,
    payload: { ...filter },
    screen: screen
})

export const getAllProductByCategorySuccess = (data, screen) => ({
    type: getActionSuccess(ActionEvent.GET_ALL_PRODUCT_BY_CATEGORY),
    payload: { data },
    screen: screen
})

export const getDetailProduct = filter => ({
    type: ActionEvent.GET_DETAIL_PRODUCT,
    payload: { ...filter }
})

export const getDetailProductSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_DETAIL_PRODUCT),
    payload: { data }
})

export const getDetailProductInCart = filter => ({
    type: ActionEvent.GET_DETAIL_PRODUCT_IN_CART,
    payload: { ...filter }
})

export const getDetailProductInCartSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_DETAIL_PRODUCT_IN_CART),
    payload: { data }
})

export const searchSelling = (filter, screen) => ({
    type: ActionEvent.SEARCH_SELLING,
    payload: { ...filter },
    screen: screen
})

export const searchSellingSuccess = (data, screen) => ({
    type: getActionSuccess(ActionEvent.SEARCH_SELLING),
    payload: { data },
    screen: screen
})

export const getCategoryFilterProduct = () => ({
    type: ActionEvent.GET_CATEGORY_FILTER_PRODUCT
})

export const getCategoryFilterProductSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_CATEGORY_FILTER_PRODUCT),
    payload: { data }
})

export const getOrdersOfProduct = (filter, screen) => ({
    type: ActionEvent.GET_ORDERS_OF_PRODUCT,
    payload: { ...filter },
    screen: screen
})

export const getOrdersOfProductSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_ORDERS_OF_PRODUCT),
    payload: { data }
})

export const addToCart = data => ({
    type: ActionEvent.ADD_TO_CART,
    payload: data
})

export const updateCart = data => ({
    type: ActionEvent.UPDATE_CART,
    payload: data
})

export const getAllCart = data => ({
    type: ActionEvent.GET_ALL_CART,
    payload: data
})

export const orderProduct = filter => ({
    type: ActionEvent.ORDER_PRODUCT,
    payload: { ...filter }
})

export const orderProductSuccess = data => ({
    type: getActionSuccess(ActionEvent.ORDER_PRODUCT),
    payload: { data }
})

export const cancelOrderProduct = filter => ({
    type: ActionEvent.CANCEL_ORDER_PRODUCT,
    payload: { ...filter }
})

export const cancelOrderProductSuccess = data => ({
    type: getActionSuccess(ActionEvent.CANCEL_ORDER_PRODUCT),
    payload: { data }
})

export const getDetailOfOrder = (orderId) => ({
    type: ActionEvent.GET_DETAIL_OF_ORDER,
    payload: { orderId }
})

export const getDetailOfOrderSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_DETAIL_OF_ORDER),
    payload: { data }
})

export const saveInfoPayment = filter => ({
    type: ActionEvent.SAVE_INFO_PAYMENT,
    payload: { ...filter }
})

export const saveInfoPaymentSuccess = data => ({
    type: getActionSuccess(ActionEvent.SAVE_INFO_PAYMENT),
    payload: { data }
})

export const getNewProduct = (filter, screen) => ({
    type: ActionEvent.GET_NEW_PRODUCT,
    payload: { ...filter },
    screen: screen
})

export const getNewProductSuccess = (data, screen) => ({
    type: getActionSuccess(ActionEvent.GET_NEW_PRODUCT),
    payload: { data },
    screen: screen
})

export const getHotProduct = (filter, screen) => ({
    type: ActionEvent.GET_HOT_PRODUCT,
    payload: { ...filter },
    screen: screen
})

export const getHotProductSuccess = (data, screen) => ({
    type: getActionSuccess(ActionEvent.GET_HOT_PRODUCT),
    payload: { data },
    screen: screen
})
