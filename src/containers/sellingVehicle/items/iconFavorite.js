import React, { PureComponent } from 'react';
import { View, Text, Linking, TouchableOpacity, Image } from 'react-native';
import * as vehicleAction from 'actions/vehicleAction';
import * as commonAction from 'actions/commonActions';
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import ItemNewsSellingVehicle from './itemNewsSellingVehicle';
import BaseView from 'containers/base/baseView';
import itemSellingVehicleType from 'enum/itemSellingVehicleType';
import global from 'utils/global';
import actionClickBannerType from 'enum/actionClickBannerType';
import { Constants } from 'values/constants';
import Utils from 'utils/utils';
import ic_heart_red from "images/ic_heart_red.png";
import ic_heart_white from "images/ic_heart_white.png";

class IconFavorite extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.LIKE_POST)) {
                    if (data && this.props.handleRefresh) {
                        this.props.handleRefresh()
                    }
                }
            } else {
                // this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    render() {
        const { item, user, isLoading, showLogin, callBack } = this.props;
        console.log('aaaaaaa1',item);
        console.log('aaaaaaa2',user);
        return (
            !Utils.isNull(user) ? (
                user.id != item.seller.id ? (
                    <TouchableOpacity
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        style={{ padding: Constants.PADDING_LARGE, margin: -Constants.MARGIN_LARGE }}
                        onPress={() => {
                            if (!Utils.isNull(callBack)) {
                                // item.isFavorite = !item.isFavorite;
                                // this.onClickFavorite(item);
                                callBack(item);
                            } else {
                                if (!Utils.isNull(user)) {
                                    if (!isLoading) {
                                        item.isFavorite = !item.isFavorite;
                                        this.onClickFavorite(item);
                                    }
                                } else {
                                    showLogin();
                                }
                            }
                        }}
                    >
                        <Image source={!item.isFavorite ? ic_heart_white : ic_heart_red} />
                    </TouchableOpacity>
                ) : null
            ) : null
        );
    }

    /**
     * On click favorite
     * @param {*} item
     */
    onClickFavorite(item) {
        this.props.likePost({
            tableId: item.id,
            isFavorite: item.isFavorite
        })
    }
}


const mapStateToProps = state => ({
    data: state.favorite.data,
    isLoading: state.favorite.isLoading,
    error: state.favorite.error,
    errorCode: state.favorite.errorCode,
    action: state.favorite.action
});

const mapDispatchToProps = {
    ...vehicleAction,
    ...commonAction
};

export default connect(mapStateToProps, mapDispatchToProps)(IconFavorite);