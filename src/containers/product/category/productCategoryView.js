import React, { Component } from 'react';
import {
    View, Text, ImageBackground, TouchableOpacity, TextInput, Image, Keyboard,
    RefreshControl, BackHandler
} from 'react-native';
import BaseView from 'containers/base/baseView';
import styles from './styles';
import ic_search_white from 'images/ic_search_white.png';
import ic_home_white from 'images/ic_home_white.png';
import ic_back_white from 'images/ic_back_white.png';
import ic_cart_grey from 'images/ic_cart_grey.png';
import { Colors } from 'values/colors';
import { Content, Header, Container, Root } from 'native-base';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
import { localizes } from 'locales/i18n';
import FlatListCustom from 'components/flatListCustom';
import * as productActions from 'actions/productActions'
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import Utils from 'utils/utils';
import ic_cancel_white from "images/ic_cancel_white.png";
import StringUtil from 'utils/stringUtil';
import CategoryGeneraItem from 'containers/post/categories/categoryGeneraItem';
import screenType from 'enum/screenType';
import global from 'utils/global';

class ProductCategoryView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            inputSearch: '',
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            isLoadingMore: false,
            hasChild: false
        };
        this.callBack = null;
        this.gotoBack = null;
        this.parentCategory = null;
        this.sttRequest = 0;
        if (!Utils.isNull(this.props.navigation.state.params)) {
            const { callBack, gotoBack, parentCategory, sttRequest, screen } = this.props.navigation.state.params;
            this.callBack = callBack;
            this.parentCategory = parentCategory;
            this.sttRequest = sttRequest;
            this.gotoBack = gotoBack;
            this.screenType = screen;
        }
        this.filter = {
            searchString: null,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
            parentCategory: !Utils.isNull(this.parentCategory) ? this.parentCategory.id : null
        }
        this.isLoadMore = true;
        this.productCategories = [];
        this.productCategoryTemps = [];
        this.showNoData = false;
        this.onChangeTextInput = this.onChangeTextInput.bind(this);
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        this.getSourceUrlPath();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            if (this.props.sttReq == this.sttRequest) {
                this.handleData()
            }
        }
    }

    /**
     * On back
     */
    onBack = () => {
        if (this.props.navigation) {
            this.props.navigation.goBack();
        }
    }

    /**
     * On back
     */
    onBackCustom = () => {
        if (Utils.isNull(this.parentCategory.id)) {
            this.onBack();
        } else {
            this.parentCategory = {
                id: null,
                name: null
            }
            this.filter.parentCategory = null;
            this.handleRequest();
        }
    }

    /**
     * Handler back button
     */
    handlerBackButton = () => {
        console.log(this.className, 'back pressed')
        if (this.props.navigation) {
            this.onBackCustom();
        } else {
            return false
        }
        return true
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_PRODUCT_CATEGORY)) {
                    // this.getCart()
                    this.state.refreshing = false;
                    this.state.isLoadingMore = false;
                    if (!Utils.isNull(data)) {
                        console.log("PRODUCT_CATEGORY_DATA", data)
                        if (data.data.length > 0) {
                            this.state.enableLoadMore = !(data.data.length < Constants.PAGE_SIZE);
                            if (!StringUtil.isNullOrEmpty(this.state.inputSearch)) {
                                data.data.forEach(item => {
                                    if (item.seq > 1) {
                                        this.productCategoryTemps.push({ ...item })
                                    }
                                })
                            } else {
                                this.state.enableLoadMore = false;
                                if (!Utils.isNull(this.parentCategory)) {
                                    if (!Utils.isNull(this.parentCategory.id)) {
                                        this.productCategoryTemps = [{ id: this.parentCategory.id, name: this.parentCategory.name }]
                                    } else {
                                        // if (this.screenType == screenType.FROM_SELLING_VEHICLE_SEEN) {
                                        this.productCategoryTemps = [{ id: null, name: localizes('productCategoryView.all') + ' danh mục' }]
                                        // }
                                    }
                                } else {
                                    if (this.screenType == screenType.FROM_SELLING_VEHICLE_SEEN) {
                                        this.productCategoryTemps = [{ id: null, name: localizes('productCategoryView.all') + ' danh mục' }]
                                    } else { null }
                                }
                                data.data.forEach(item => {
                                    this.productCategoryTemps.push({ ...item })
                                })
                            }
                            this.productCategories = this.productCategoryTemps
                        } else {
                            this.productCategories = []
                        }
                        this.isLoadMore = true
                    }
                    this.showNoData = true;
                } else if (this.props.action == ActionEvent.GET_ALL_CART) {
                    this.quantityCart = data.quantity
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    componentDidMount() {
        this.handleRequest()
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    render() {
        const { enableRefresh, refreshing, inputSearch } = this.state
        console.log("RENDER PRODUCT CATEGORY VIEW")
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={{ backgroundColor: Colors.COLOR_PRIMARY, borderBottomWidth: 0 }}>
                        {this.renderToolbar()}
                    </Header>
                    <FlatListCustom
                        contentContainerStyle={{
                            paddingVertical: Constants.MARGIN_X_LARGE
                        }}
                        style={{ flex: 1, paddingVertical: Constants.MARGIN_X_LARGE, }}
                        keyExtractor={(item) => item.id}
                        horizontal={false}
                        data={this.productCategories}
                        itemPerCol={1}
                        renderItem={this.renderItem.bind(this)}
                        showsVerticalScrollIndicator={false}
                        numColumns={1}
                        enableRefresh={enableRefresh}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        enableLoadMore={this.state.enableLoadMore}
                        onLoadMore={() => {
                            this.loadMore()
                        }}
                        isShowEmpty={this.showNoData}
                        isShowImageEmpty={true}
                        textForEmpty={localizes('productCategoryView.noData')}
                        styleEmpty={{}}
                    />
                    {this.state.isLoadingMore || this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    /**
     * Click search
     */
    onPressSearch = () => {
        const { inputSearch } = this.state
        if (!StringUtil.isNullOrEmpty(inputSearch)) {
            this.filter.searchString = ''
            this.setState({ inputSearch: '' })
            this.resetData()
            this.handleRequest()
        } else {
            this.inputSearchRef.focus()
        }
    }

    // Handle request
    handleRequest() {
        this.props.getProductCategory(this.filter, this.sttRequest)
    }

    //onRefreshing
    handleRefresh = () => {
        this.setState({
            refreshing: true
        })
        this.isLoadMore = true
        this.resetData()
        this.handleRequest()
    }

    // Reset data
    resetData() {
        this.filter.paging.page = 0
        this.productCategoryTemps = []
    }

    /**
     * Load more
     */
    loadMore = () => {
        if (this.state.isLoadingMore) {
            // this.isLoadMore = false
            this.filter.paging.page += 1
            this.handleRequest()
        }
    }

    /**
     * Render search bar
     */
    renderToolbar = () => {
        const { inputSearch } = this.state;
        return (
            <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter]}>
                {this.renderHeaderView({
                    onBack: this.handlerBackButton,
                    visibleStage: false,
                    title: "",
                    visibleSearchBar: true,
                    visibleCart: false,
                    quantityCart: this.quantityCart,
                    showCart: this.showCart,
                    placeholder: localizes('productCategoryView.title'),
                    inputSearch: inputSearch,
                    onRef: (ref) => { this.inputSearchRef = ref },
                    autoFocus: false,
                    onChangeTextInput: this.onChangeTextInput,
                    onSubmitEditing: () => Keyboard.dismiss(),
                    iconRightSearch: !StringUtil.isNullOrEmpty(inputSearch) ? ic_cancel_white : ic_search_white,
                    onPressRightSearch: () => this.onPressSearch()
                })}
            </View>
        )
    }

    /**
     * Manager text input search 
     * @param {*} inputSearch 
     */
    onChangeTextInput(inputSearch) {
        const self = this;
        if (self.state.typingTimeout) {
            clearTimeout(self.state.typingTimeout);
        }
        self.setState({
            inputSearch: inputSearch,
            typing: false,
            typingTimeout: setTimeout(() => {
                this.filter.searchString = inputSearch
                this.resetData()
                this.handleRequest(this.filter)
            }, 0),
        });
    }

    /**
     * Handle callback
     */
    handleCallBack = () => {
        this.callBack
    }

    /**
     * On click item
     */
    onClickItem(item) {
        global.idChoose = item.id
        if (item.hasChild) {
            this.props.navigation.pop();
            this.props.navigation.push("ProductCategory", {
                callBack: this.callBack,
                gotoBack: () => this.onBack(),
                parentCategory: {
                    id: item.id,
                    name: item.name
                },
                sttRequest: this.sttRequest + 1
            })
        } else {
            this.onBack()
            this.callBack(item.id, item.name, this.parentCategory)
            if (this.gotoBack) {
                this.gotoBack()
            }
        }
    }

    /**
     * Render item
     * @param {*} item
     * @param {*} index
     * @param {*} parentIndex
     * @param {*} indexInParent
     */
    renderItem(item, index, parentIndex, indexInParent) {
        return (
            <CategoryGeneraItem
                data={this.productCategories}
                item={item}
                index={index}
                onChangeValue={() => this.onClickItem(item)}
                sttRequest={this.sttRequest}
                isProduct={true}
            />
        );
    }
}

const mapStateToProps = state => ({
    data: state.productCategory.data,
    isLoading: state.productCategory.isLoading,
    error: state.productCategory.error,
    errorCode: state.productCategory.errorCode,
    action: state.productCategory.action,
    sttReq: state.productCategory.sttReq
});

const mapDispatchToProps = {
    ...productActions
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductCategoryView);