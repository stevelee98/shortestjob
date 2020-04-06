import React, { Component } from 'react';
import { View, Text, BackHandler } from 'react-native';
import { Container, Root, Header, Content } from 'native-base';
import BaseView from 'containers/base/baseView';
import { Constants } from 'values/constants';
import { Colors } from 'values/colors';
import styles from 'containers/sellingVehicle/report/styles'
import TextInputCustom from 'components/textInputCustom';
import { connect } from 'react-redux';
import { ErrorCode } from 'config/errorCode';
import { getActionSuccess, ActionEvent } from 'actions/actionEvent';
import * as actions from 'actions/vehicleAction'
import * as commonActions from 'actions/commonActions'
import commonStyles from 'styles/commonStyles';
import Utils from 'utils/utils';

class reasonReportView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            description: null,
        };
        const { dataItemReport, sellingItemId, id } = this.props.navigation.state.params
        this.dataItemReport = dataItemReport
        this.sellingItemId = sellingItemId
        this.idItem = id
    }


    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
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
                if (this.props.action == getActionSuccess(ActionEvent.ADD_REPORT_ISSUE)) {
                    this.showMessage("Gửi báo cáo thành công!")
                    this.onBack()
                }
            }
        }
    }

    // validate data input
    validateData() {
        const { description } = this.state
        if (Utils.isNull(description) || Utils.validateSpaces(description)) {
            this.showMessage(`Vui lòng nhập mô tả về ${this.dataItemReport.name}!`)
            return false
        }
        return true
    }

    render() {
        return (
            <Container style={styles.container}>
                <Root>
                    <View style={{ flexGrow: 1 }}>
                        <Header style={commonStyles.header}>
                            {this.renderHeaderView({
                                visibleBack: true,
                                visibleStage: false,
                                title: "Vui lòng nhập thêm thông tin",
                                renderRightMenu: this.renderRightHeader
                            })}
                        </Header>
                        <Content>
                            <View>
                                <TextInputCustom
                                    title={`Mô tả`}
                                    ref={r => (this.description = r)}
                                    value={this.state.description}
                                    onChangeText={(text) => { this.setState({ description: text }) }}
                                    onSubmitEditing={() => {
                                    }}
                                    isMultiLines={true}
                                    placeholder={`Mô tả thêm về ${this.dataItemReport.name}`}
                                    keyboardType="default"
                                    editable={true}
                                    numberOfLines={this.NUMBER_OF_LINES}
                                    multiline={true}
                                    underlineColorAndroid="transparent"
                                    isValidate={false}
                                />
                                <View style={{ backgroundColor: Colors.COLOR_BACKGROUND }}>
                                    {
                                        this.renderCommonButton(
                                            'GỬI',
                                            { color: Colors.COLOR_WHITE },
                                            {
                                                marginHorizontal: Constants.MARGIN_X_LARGE,
                                                backgroundColor: Colors.COLOR_PRIMARY,
                                                shadowColor: Colors.COLOR_PRIMARY
                                            },
                                            () => {
                                                if (this.validateData()) {
                                                    this.props.addReportIssue(
                                                        {
                                                            catelogyId: this.dataItemReport.id,
                                                            sellingItemId: this.sellingItemId,
                                                            content: this.state.description,
                                                        }
                                                    )
                                                }
                                            },
                                            // this.state.isDisableButton, //disableButton
                                        )
                                    }
                                </View>
                            </View>
                        </Content>
                    </View>
                    {this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }
}
const mapStateToProps = state => ({
    data: state.reasonReport.data,
    isLoading: state.reasonReport.isLoading,
    error: state.reasonReport.error,
    errorCode: state.reasonReport.errorCode,
    action: state.reasonReport.action
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(reasonReportView);