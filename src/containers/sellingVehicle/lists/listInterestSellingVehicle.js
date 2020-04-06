import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
import { colors } from 'react-native-elements';
import FlatListCustom from 'components/flatListCustom';
import BaseView from 'containers/base/baseView';
import itemSellingVehicleType from 'enum/itemSellingVehicleType';
import * as vehicleAction from 'actions/vehicleAction';
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import Utils from 'utils/utils';
import ItemNewsSellingVehicleInterest from '../items/itemNewsSellingVehicleInterest';
import actionClickBannerType from 'enum/actionClickBannerType';
import { localizes } from 'locales/i18n';
import screenType from 'enum/screenType';

class ListInterestSellingVehicle extends BaseView {
	constructor(props) {
		super(props);
		this.state = {
			enableLoadMore: false,
		};
		this.filterInterest = {
			paging: {
				pageSize: Constants.PAGE_SIZE,
				page: 0
			}
		}
		this.isLoadMore = true
		this.data = []
		this.dataInterest = []
		this.renderItem = this.renderItem.bind(this)
		this.onClickItem = this.onClickItem.bind(this)
	}

	componentWillMount() {
		this.getSourceUrlPath()
	}

	componentDidMount() {
		this.handleRequest()
	}

	// handle request
	handleRequest() {
		this.props.getNewsSellingVehicleInterestDisplay(this.filterInterest)
	}

	/**
	 * Load more Interest
	 */
	loadMoreInterest = async () => {
		if (this.isLoadMore) {
			this.isLoadMore = false
			this.filterInterest.paging.page += 1
			this.handleRequest()
		}
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
				if (this.props.action == getActionSuccess(ActionEvent.GET_NEWS_SELLING_VEHICLE_INTEREST_DISPLAY)) {
					console.log("DATA NEWS_INTEREST: ", data)
					if (!Utils.isNull(data)) {
						if (data.data.length < Constants.PAGE_SIZE) {
							this.state.enableLoadMore = false
						} else {
							this.state.enableLoadMore = true
						}
						if (data.data.length > 0) {
							this.dataInterest = []
							data.data.forEach((item, index) => {
								this.data.push({ ...item, itemType: itemSellingVehicleType.ITEM_SELLING_VEHICLE })
							})
							this.dataInterest = this.data
						}
						this.isLoadMore = true
					}
				} else if (this.props.action == ActionEvent.REFRESH_ACTION) {
					if (data.data.isRefresh && data.data.screen == screenType.FROM_SELLING_VEHICLE_SEEN) {
						this.data = []
						this.filterInterest = {
							paging: {
								pageSize: Constants.PAGE_SIZE,
								page: 0
							}
						}
						this.handleRequest()
						!Utils.isNull(this.flatListRef) ? this.flatListRef.scrollToOffset({ animated: true, offset: 0 }) : null
					}
				}
			} else {
				this.handleError(this.props.errorCode, this.props.error)
			}
		}
	}

	render() {
		const { enableLoadMore } = this.state
		if (Utils.isNull(this.dataInterest)) {
			return null
		}
		return (
			<View>
				<Text style={[commonStyles.text, { paddingHorizontal: Constants.PADDING_X_LARGE }]}>
					{localizes('sellingVehicle.titlePostInterest')}
				</Text>
				<View style={{ marginTop: -Constants.MARGIN, marginBottom: -Constants.MARGIN_LARGE }}>
					{this.dataInterest.length == 0 ?
						<Text style={[commonStyles.text, {
							color: colors.COLOR_DRK_GREY,
							paddingHorizontal: Constants.PADDING_X_LARGE,
							marginBottom: Constants.MARGIN_X_LARGE
						}]}>
							Chưa có bài đăng nào
                                        </Text> :
						<FlatListCustom
							onRef={(ref) => { this.flatListRef = ref }}
							style={{
								paddingVertical: Constants.PADDING,
							}}
							keyExtractor={(item) => item.id}
							horizontal={true}
							data={this.dataInterest}
							itemPerCol={1}
							renderItem={this.renderItem}
							showsHorizontalScrollIndicator={false}
							enableLoadMore={enableLoadMore}
							onLoadMore={() => {
								this.loadMoreInterest()
							}}
						/>
					}
				</View>
			</View>
		);
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
			<ItemNewsSellingVehicleInterest
				key={item.id}
				data={this.dataInterest}
				item={item}
				index={index}
				onPress={this.onClickItem}
				resource={this.resourceUrlPathResize.textValue}
				enableLoadMore={this.state.enableLoadMore}
			/>
		);
	}

	/**
	 * On click item
	 */
	onClickItem(item) {
		if (item.itemType == itemSellingVehicleType.ITEM_SELLING_VEHICLE) {
			this.props.navigation.navigate("SellingVehicleDetail", {
				vehicleId: item.id,
				urlPathResource: this.resourceUrlPathResize.textValue,
			})
		}
	}
}

const mapStateToProps = state => ({
	data: state.listInterest.data,
	isLoading: state.listInterest.isLoading,
	error: state.listInterest.error,
	errorCode: state.listInterest.errorCode,
	action: state.listInterest.action
});

const mapDispatchToProps = {
	...vehicleAction
};

export default connect(mapStateToProps, mapDispatchToProps)(ListInterestSellingVehicle);
