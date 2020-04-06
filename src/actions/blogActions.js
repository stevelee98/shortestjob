import { ActionEvent, getActionSuccess } from './actionEvent'

export const getBlogPost = (filter) => ({
    type: ActionEvent.GET_BLOG_POST,
    filter
})

export const getBlogPostSuccess = data => ({
type: getActionSuccess(ActionEvent.GET_BLOG_POST),
    payload: { data }
})

export const getDetailBlog = id => ({
    type: ActionEvent.GET_DETAIL_BLOG,      
    payload: {id}
})

export const getDetailBlogSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_DETAIL_BLOG),
    payload: {data}
})