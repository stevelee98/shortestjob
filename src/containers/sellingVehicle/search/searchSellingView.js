import React, { Component } from 'react'
import { Text, View, TouchableOpacity, Image, BackHandler, Keyboard } from 'react-native'
import styles from './styles';
import { Container, Root, Header, Content } from 'native-base';
import BaseView from 'containers/base/baseView';
import { localizes } from 'locales/i18n';
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';
import ic_search_white from 'images/ic_search_white.png';
import ic_cancel_white from "images/ic_cancel_white.png";
import Utils from 'utils/utils';
import StringUtil from 'utils/stringUtil';
import commonStyles from 'styles/commonStyles';
import FlatListCustom from 'components/flatListCustom';
import * as productActions from 'actions/productActions';
import * as commonActions from 'actions/commonActions'
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import ItemSearchSelling from './itemSearchSelling';
import StorageUtil from 'utils/storageUtil';
import screenType from 'enum/screenType';

class searchSellingView extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
            searchString: '',
            typing: false,
            typingTimeout: 0,
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            searchHistories: []
        };
        const { categoryId, categoryName, callBack, placeholder } = this.props.navigation.state.params
        this.placeholder = placeholder
        this.categoryId = categoryId
        this.categoryName = categoryName
        this.callBack = callBack
        this.isSpliceItem = false
        this.onChangeTextInput = this.onChangeTextInput.bind(this);
        this.dataSearches = []
        this.dataSearchTemps = []
        if (!Utils.isNull(this.categoryId)) {
            this.dataSearchTemps = [{ name: '' }, { name: '' }]
        }
        this.isLoadMore = true
        this.filter = {
            searchString: null,
            categoryId: this.categoryId,
            categoryName: this.categoryName,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            }
        }
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        this.getSourceUrlPath()
        StorageUtil.retrieveItem(StorageUtil.PRODUCT_SEARCH_HISTORY).then((searchHistory) => {
            if (!Utils.isNull(searchHistory)) {
                this.setState({
                    searchHistories: searchHistory
                })
            }
        }).catch((error) => {
            this.saveException(error, 'readProductSearchHistory')
        })

    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.SEARCH_SELLING)
                    || this.props.action == getActionSuccess(ActionEvent.GET_PRODUCT_CATEGORY)) {
                    if (this.props.screen == screenType.FROM_SEARCH_SELLING) {
                        if (!Utils.isNull(data)) {
                            if (data.data.length < Constants.PAGE_SIZE) {
                                this.state.enableLoadMore = false
                            } else {
                                this.state.enableLoadMore = true
                            }
                            if (data.data.length > 0) {
                                data.data.forEach(item => {
                                    this.dataSearchTemps.push({ ...item })
                                })
                                this.dataSearches = this.dataSearchTemps
                            } else {
                                this.dataSearches = []
                            }
                            this.isLoadMore = true
                        }
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    formatData() {
        const { searchString } = this.state
        this.dataSearches.splice(0, 2,
            { name: '"' + searchString + '"' + " trong " + "Tất cả", resourcePaths: null },
            { name: '"' + searchString + '"' + " trong " + this.categoryName, resourcePaths: null },
        )
        return this.dataSearches
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    render() {
        const { searchString, searchHistories } = this.state
        return (
            <Container style={styles.container}>
                <Root>
                    <View style={{ flexGrow: 1 }}>
                        {/* {Header home view} */}
                        <Header style={commonStyles.header}>
                            {this.renderHeaderView({
                                visibleStage: false,
                                title: "",
                                visibleSearchBar: true,
                                placeholder: !Utils.isNull(this.placeholder) ? this.placeholder : localizes("search"),
                                inputSearch: searchString,
                                onRef: (ref) => { this.inputSearchRef = ref },
                                autoFocus: true,
                                onChangeTextInput: this.onChangeTextInput,
                                onSubmitEditing: () => this.onSubmitEditing(),
                                iconRightSearch: !StringUtil.isNullOrEmpty(searchString)
                                    ? ic_cancel_white : ic_search_white,
                                onPressRightSearch: () => this.onPressRightSearch(),
                                styleSearch: { paddingRight: Constants.PADDING / 2 }
                            })}
                        </Header>
                        <Content>
                            <FlatListCustom
                                style={{
                                    paddingVertical: Constants.PADDING_X_LARGE
                                }}
                                keyExtractor={(item) => item.id}
                                horizontal={false}
                                data={!Utils.isNull(searchString)
                                    ? !Utils.isNull(this.categoryId) ? this.formatData() : this.dataSearches
                                    : searchHistories}
                                itemPerCol={1}
                                renderItem={this.renderItem.bind(this)}
                                showsVerticalScrollIndicator={false}
                            />
                            {Utils.isNull(searchString)
                                ? <TouchableOpacity
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    onPress={() =>
                                        !Utils.isNull(searchHistories)
                                            ? this.deleteSearchHistory()
                                            : null
                                    }>
                                    <View style={[commonStyles.viewCenter, { marginBottom: Constants.MARGIN_X_LARGE }]}>
                                        <Text style={commonStyles.text}>
                                            {!Utils.isNull(searchHistories)
                                                ? localizes('searchSellingView.deleteDataSearched') : localizes('searchSellingView.noDataSearched')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                : null}
                        </Content>
                        {this.isLoadMore ? this.showLoadingBar(this.props.isLoading) : null}
                    </View>
                </Root>
            </Container>
        )
    }

    /**
     * Render item
     * @param {*} item
     * @param {*} index
     * @param {*} parentIndex
     * @param {*} indexInParent
     */
    renderItem(item, index, parentIndex, indexInParent) {
        const { searchString, searchHistories } = this.state
        return (
            <ItemSearchSelling
                data={!Utils.isNull(searchString)
                    ? !Utils.isNull(this.categoryId) ? this.formatData() : this.dataSearches
                    : searchHistories}
                item={item}
                index={index}
                resource={this.resourceUrlPathResize.textValue}
                inputSearch={searchString}
                onPressItem={() => this.onPressItem(item, index)}
            />
        )
    }

    /**
     * On submit editing
     */
    onSubmitEditing() {
        if (!Utils.isNull(this.callBack)) {
            this.callBack(this.filter)
            this.onBack()
        } else {
            this.props.navigation.pop()
            this.props.navigation.navigate("SellingVehicle", { filterSearch: this.filter })
        }
        this.onSaveSearchHistory()
    }

    /**
     * On press item search
     */
    onPressItem(item, index) {
        const { searchString } = this.state
        if ((!Utils.isNull(this.categoryId) ? index > 1 : index > -1) && !Utils.isNull(searchString)) {
            this.props.navigation.navigate("ProductDetail", {
                productId: item.id
            })
            this.onSaveSearchHistory()
        } else if (Utils.isNull(searchString)) {
            this.filter.searchString = item.name
            this.state.searchString = item.name
            this.onSubmitEditing()
        } else {
            if (index == 0) {
                this.filter.categoryId = null
            } else if (index == 1) {
                this.filter.categoryId = this.categoryId
                this.filter.categoryName = this.categoryName
            }
            this.filter.searchString = searchString
            this.onSubmitEditing()
            this.onSaveSearchHistory(index)
        }
    }

    /**
     * Manager text input search
     * @param {*} searchString
     */
    onChangeTextInput(searchString) {
        const self = this;
        if (self.state.typingTimeout) {
            clearTimeout(self.state.typingTimeout);
        }
        if (!StringUtil.isNullOrEmpty(searchString)) {
            self.setState({
                searchString: searchString,
                typing: false,
                typingTimeout: setTimeout(() => {
                    this.filter.searchString = searchString
                    this.resetData()
                    this.handleRequest()
                }, 0)
            });
        } else {
            self.setState({ searchString: '' })
            this.resetData()
            this.dataSearches = []
        }
    }

    /**
     * On Save Search History 
     */
    onSaveSearchHistory = (index) => {
        const { searchString, searchHistories } = this.state
        if (!StringUtil.isNullOrEmpty(searchString)) {
            if (index != 0 && index != 1) {
                this.filter.searchString = searchString
                this.resetData()
                this.handleRequest()
            }
            searchHistories.forEach((item, index) => {
                if (item.name === searchString) {
                    searchHistories.splice(index, 1)
                }
            })
            if (searchHistories.length < 10) {
                searchHistories.splice(0, 0, { name: searchString })
            } else {
                searchHistories.splice(0, 0, { name: searchString })
                searchHistories.splice(-1, 1)
            }
            StorageUtil.storeItem(StorageUtil.PRODUCT_SEARCH_HISTORY, searchHistories)
        }
    }

    /**
     * Delete search history
     */
    deleteSearchHistory() {
        StorageUtil.deleteItem(StorageUtil.PRODUCT_SEARCH_HISTORY)
        this.setState({
            searchHistories: []
        })
    }

    /**
     * Click right search
     */
    onPressRightSearch = () => {
        const { searchString } = this.state
        if (!StringUtil.isNullOrEmpty(searchString)) {
            this.setState({ searchString: '' })
            this.resetData()
            this.dataSearches = []
        } else {
            this.inputSearchRef.focus()
        }
    }

    // Reset data
    resetData() {
        this.filter.paging.page = 0
        this.filter.categoryId = this.categoryId
        this.filter.searchString = this.state.searchString
        if (!Utils.isNull(this.categoryId)) {
            this.dataSearchTemps = [{ name: '' }, { name: '' }]
        } else {
            this.dataSearchTemps = []
        }
    }

    // Handle request
    handleRequest() {
        // this.props.searchSelling(this.filter, screenType.FROM_SEARCH_SELLING)
    }
}

const mapStateToProps = state => ({
    data: state.searchSelling.data,
    isLoading: state.searchSelling.isLoading,
    error: state.searchSelling.error,
    errorCode: state.searchSelling.errorCode,
    action: state.searchSelling.action,
    screen: state.searchSelling.screen
});

const mapDispatchToProps = {
    ...productActions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(searchSellingView);
