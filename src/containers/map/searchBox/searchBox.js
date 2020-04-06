import React, { Component } from "react";
import { Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { View, InputGroup, Input, ScrollView, Item } from "native-base";
import * as actions from "actions/locationAction";
import styles from "./styles.js";
import { Colors } from "values/colors.js";
import { Constants } from "values/constants.js";
import Utils from "utils/utils.js";
import { configConstants } from "values/configConstants.js";
import { connect } from "react-redux";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode.js";
import LocationItem from "./locationItem.js";
import FlatListCustom from "components/flatListCustom.js";
import global from "utils/global";
import BaseView from "containers/base/baseView.js";
import ic_search_white from "images/ic_search_white.png";
import ic_close from "images/ic_close.png";

class SearchBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            txtSearch: null,
            typing: false,
            typingTimeout: 0,
            isClick: false
        };
        this.onChangeTextInput = this.onChangeTextInput.bind(this);
        this.address = null;
        this.dataSearch = null;
        this.locationResults = [];
    }

    componentWillMount() {}

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
        const { isClick } = this.state;
        let data = this.props.data;
        this.locationResults = [];
        if (data != null && this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.SEARCH_ADDRESS)) {
                    if (global.dataAddress != data) {
                        global.dataAddress = data;
                        if (!isClick) {
                            console.log("DATA SEARCH", data);
                            data.predictions.forEach(item => {
                                this.locationResults.push(item);
                            });
                        }
                    } else {
                        this.handleAddress();
                    }
                } else {
                    this.handleAddress();
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        } else {
            this.handleAddress();
        }
    }

    // If the same address is not call
    handleAddress(address) {
        if (this.address != this.props.address && Utils.isNull(address)) {
            this.address = this.props.address;
            this.setState({
                txtSearch: this.address
            });
        } else if (!Utils.isNull(address)) {
            this.setState({
                txtSearch: address,
                isClick: true
            });
        }
    }

    render() {
        const { isFocus, txtSearch } = this.state;
        console.log("RENDER SEARCH BOX");
        return (
            <View style={styles.searchBox}>
                <View style={styles.inputWrapper}>
                    <InputGroup>
                        <Input
                            style={styles.inputSearch}
                            placeholder="Nhập địa chỉ"
                            onChangeText={this.onChangeTextInput}
                            onSubmitEditing={() => {
                                this.props.searchAddress(this.state.txtSearch);
                            }}
                            returnKeyType="search"
                            value={this.state.txtSearch}
                        />
                        {this.props.isLoading ? (
                            <View style={{ marginRight: Constants.MARGIN_LARGE, marginLeft: Constants.MARGIN }}>
                                <ActivityIndicator size="small" color={Colors.COLOR_PRIMARY} />
                            </View>
                        ) : (
                            <TouchableOpacity activeOpacity={Constants.ACTIVE_OPACITY} onPress={() => (!Utils.isNull(txtSearch) ? this.onChangeTextInput("") : null)} block>
                                <Image
                                    resizeMode={"contain"}
                                    source={!Utils.isNull(txtSearch) ? ic_close : ic_search_white}
                                    style={{
                                        width: 15,
                                        height: 15,
                                        marginRight: Constants.MARGIN_LARGE,
                                        marginLeft: Constants.MARGIN
                                    }}
                                />
                            </TouchableOpacity>
                        )}
                    </InputGroup>
                    <View>
                        <FlatListCustom
                            style={{
                                paddingVertical: Constants.PADDING
                            }}
                            horizontal={false}
                            data={this.locationResults}
                            itemPerCol={1}
                            renderItem={this.renderItem.bind(this)}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
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
        return <LocationItem item={item} onSetAddress={() => this.addressFromAddress(item)} />;
    }

    /**
     * Manager text input search
     * @param {*} txtSearch
     */
    onChangeTextInput(txtSearch) {
        const self = this;
        if (self.state.typingTimeout) {
            clearTimeout(self.state.typingTimeout);
        }
        console.log("Change Text", txtSearch);
        self.setState({
            txtSearch: txtSearch,
            typing: false,
            typingTimeout: setTimeout(() => {
                self.props.searchAddress(txtSearch, configConstants.KEY_GOOGLE);
                self.props.onSetAddressInput(txtSearch);
            }, 1000),
            isClick: false
        });
    }

    /**
     * Get address in map
     */
    addressFromAddress(address) {
        if (!Utils.isNull(address)) {
            this.props.getAddressFromPlaceId(address.place_id, configConstants.KEY_GOOGLE);
        }
    }
}

const mapStateToProps = state => ({
    data: state.autocomplete.data,
    isLoading: state.autocomplete.isLoading,
    error: state.autocomplete.error,
    errorCode: state.autocomplete.errorCode,
    action: state.autocomplete.action
});

const mapDispatchToProps = {
    ...actions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SearchBox);
