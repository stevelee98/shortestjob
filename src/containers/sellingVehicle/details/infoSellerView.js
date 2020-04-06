import React, { Component } from 'react';
import { View, Text, BackHandler, TouchableOpacity } from 'react-native';
import BaseView from 'containers/base/baseView';
import TabsCustom from 'components/tabsCustom';
import { Container, Root, Header, Content } from 'native-base';
import styles from "./styles";
import { Colors } from 'values/colors';
import commonStyles from 'styles/commonStyles';
import { Constants } from 'values/constants';
import { Fonts } from 'values/fonts';
import ImageLoader from 'components/imageLoader';
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { localizes } from 'locales/i18n';
import TabInfoView from './tabInfoView'
import Utils from 'utils/utils';
import TabSellingView from './tabSellingView'
import StringUtil from 'utils/stringUtil';
import ModalImageViewer from "../../../../src/containers/common/modalImageViewer";

class InfoSellerView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            idTab: 1,
        };
        const { sellerId, item, avatarSeller, resourceUrlPathResize, user, callBack } = this.props.navigation.state.params;

        this.resourceUrlPathResize = resourceUrlPathResize
        this.sellerId = sellerId,
            this.item = item,
            this.avatarSeller = avatarSeller,
            this.user = user

        this.tabs = [
            {
                id: 1,
                name: 'Thông tin',
                child: <TabInfoView navigation={this.props.navigation} info={this.item} />
            },
            {
                id: 2,
                name: 'Đang bán',
                child: <TabSellingView user={this.user} navigation={this.props.navigation} sellerId={this.sellerId} resourceUrlPathResize={this.resourceUrlPathResize} />,
            }
        ];
        this.callBack = callBack
    }

    componentDidMount() {
        const { navigation } = this.props;
        this.getSourceUrlPath();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                this.state.refreshing = false;
                this.state.isLoadingMore = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_ALL_STAFF_BY_BRANCH)) {

                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    /**
     * On back
     */
    onBack = () => {
        if (this.props.navigation) {
            this.callBack();
            this.props.navigation.goBack()
        }
    }

    render() {

        console.log('sellerId: ', this.sellerId)
        console.log('item', this.item)
        console.log('avatarSeller', this.avatarSeller)
        console.log('resourceUrlPathResize', this.resourceUrlPath)
        console.log('user', this.user)

        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header, { backgroundColor: Colors.COLOR_PRIMARY }]}>
                        {this.renderHeaderView({
                            title: 'Thông tin người bán',
                            visibleStage: false,
                            titleStyle: { color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightHeader,
                            onBack: this.onBack
                        })}
                    </Header>
                    <Content contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                        {this.renderHeaderUser()}
                        <TabsCustom
                            tabs={!Utils.isNull(this.tabs) ? this.tabs : []}
                            child={(tab) => {
                                return (
                                    this.renderChild(tab.child)
                                )
                            }}
                            underlineStyle={{ backgroundColor: Colors.COLOR_PRIMARY }}
                            isRenderTabBar={false}
                        />
                    </Content>
                    <ModalImageViewer
                        ref={'modalImageViewer'}
                        parentView={this}
                    />
                </Root>
            </Container>
        );
    }

    renderChild(child) {
        return (
            <View style={{ flex: 1 }}>
                {child}
            </View>
        );
    }

    /**
     * On click Avatar
     */
    onClickAvatar() {
        let index = 0;
        let images = [{ path: this.item.avatarPath }]
        this.refs.modalImageViewer.showModal(images, index)
    }

    /**
     * Render header user
     */
    renderHeaderUser = () => {
        const { source, txtPhoneNumber, txtAccountName, userFB, userGG } = this.state;
        let isSocial = !Utils.isNull(this.item.avatarPath) ? (this.item.avatarPath.indexOf("http") != -1 ? true : false) : false

        return (
            <View
                style={{
                    flexDirection: "row",
                    backgroundColor: Colors.COLOR_WHITE,
                    marginBottom: Constants.MARGIN_X_LARGE,
                    padding: Constants.PADDING_X_LARGE,
                    paddingBottom: Constants.PADDING_LARGE
                }}
            >
                <TouchableOpacity style={{ position: "relative" }}
                    onPress={() => {
                        this.onClickAvatar();
                    }}
                >
                    <ImageLoader
                        style={[styles.imageSizeAvatar]}
                        // resizeAtt={isSocial ? null : {
                        //     type: "thumbnail",
                        //     width: Constants.AVATAR_WIDTH_HEIGHT,
                        //     height: Constants.AVATAR_WIDTH_HEIGHT
                        // }}
                        resizeModeType={"cover"}
                        path={this.avatarSeller}
                    />
                </TouchableOpacity>
                <View style={{ marginLeft: Constants.MARGIN_LARGE }}>
                    <Text
                        style={[
                            commonStyles.textBold,
                            {
                                fontSize: Fonts.FONT_SIZE_X_MEDIUM,
                                color: Colors.COLOR_BLACK,
                                margin: 0,
                                flexDirection: "row",
                                marginBottom: Constants.MARGIN,
                                alignItems: "center",
                                marginHorizontal: Constants.MARGIN
                            }
                        ]}
                    >
                        {this.item.name}
                    </Text>
                    <Text
                        style={[
                            commonStyles.text,
                            {
                                flexDirection: "row",
                                fontSize: Fonts.FONT_SIZE_MEDIUM,
                                marginBottom: Constants.MARGIN,
                                alignItems: "center",
                                marginHorizontal: Constants.MARGIN
                            }
                        ]}
                    >
                        {StringUtil.formatPhoneSpace(this.item.phone)}
                    </Text>
                </View>
            </View>
        );
    };

}

const mapStateToProps = state => ({
    // data: state.userProfile.data,
    // action: state.userProfile.action,
    // isLoading: state.userProfile.isLoading,
    // error: state.userProfile.error,
    // errorCode: state.userProfile.errorCode
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(InfoSellerView);