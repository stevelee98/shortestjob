import React, { Component } from 'react';
import { View, Text, RefreshControl, BackHandler } from 'react-native';
import BaseView from 'containers/base/baseView';
import { Container, Root, Header, Content } from 'native-base';
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';
import styles from 'containers/sellingVehicle/report/list/styles'
import ItemReport from './itemReport';
import FlatListCustom from 'components/flatListCustom';
import * as actions from 'actions/vehicleAction'
import * as commonActions from 'actions/commonActions'
import { connect } from 'react-redux';
import { ErrorCode } from 'config/errorCode';
import { getActionSuccess, ActionEvent } from 'actions/actionEvent';
import commonStyles from 'styles/commonStyles';

class listReasonReportView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            enableRefresh: true
        };
        this.reportIssue = []
        this.reportIssueTemp = []
        const { sellingItemId } = this.props.navigation.state.params
        // global.gotoReasonReport = this.gotoReasonReport.bind(this);
        this.sellingItemId = sellingItemId
        this.handleRefresh = this.handleRefresh.bind(this)
    }


    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.props.getReportIssue()
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
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
                if (this.props.action == getActionSuccess(ActionEvent.GET_REPORT_ISSUE)) {
                    if (data.data.length > 0) {
                        data.data.forEach(item => {
                            this.reportIssueTemp.push({ ...item })
                        });
                        this.reportIssue = this.reportIssueTemp
                        // this.reportIssue = data.data
                    }
                }
            }
        }
    }

    render() {
        return (
            <Container style={styles.container}>
                <Root>
                    <View style={{
                        flexGrow: 1
                    }}>
                        <Header style={commonStyles.header}>
                            {this.renderHeaderView({
                                visibleBack: true,
                                visibleStage: false,
                                title: "Tin rao vặt này có vấn đề gì?",
                                renderRightMenu: this.renderRightHeader
                            })}
                        </Header>
                        <Content showsVerticalScrollIndicator={false}
                            enableRefresh={this.state.enableRefresh}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.handleRefresh}
                                />
                            }
                        >
                            <View style={{
                                // flex: 0,
                                paddingVertical: Constants.MARGIN_X_LARGE,
                                backgroundColor: Colors.COLOR_BACKGROUND
                            }}>
                                <FlatListCustom
                                    style={{
                                        backgroundColor: Colors.COLOR_WHITE
                                    }}
                                    data={this.reportIssue}
                                    renderItem={this.renderItem}
                                    keyExtractor={item => item.code}
                                    textForEmpty={"Chưa có tin nào"}
                                />
                            </View>
                        </Content>
                    </View>
                    {this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>

        );
    }

    //onRefreshing
    handleRefresh = () => {
        this.reportIssueTemp = []
        this.setState({
            refreshing: false,
        });
        this.props.getReportIssue();
    };

    // resetData
    // resetData() {
    // this.filter.paging.page = 0
    // this.reportIssueTemp = []
    // this.isLoadMore = true
    // }

    /**
         * Go blog detail
         */
    gotoReasonReport = (item) => {
        this.props.navigation.pop();
        this.props.navigation.push("ReasonReport", { dataItemReport: item, sellingItemId: this.sellingItemId })
    }


    /**
     * render Item Blog
     */

    renderItem = (item, index, parentIndex, indexInParent) => {
        return (
            <ItemReport
                item={item}
                data={this.reportIssue}
                index={index}
                gotoReasonReport={this.gotoReasonReport}
            />
        );
    }
}

const mapStateToProps = state => ({
    data: state.listReasonReport.data,
    isLoading: state.listReasonReport.isLoading,
    error: state.listReasonReport.error,
    errorCode: state.listReasonReport.errorCode,
    action: state.listReasonReport.action
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(listReasonReportView);
