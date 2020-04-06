import React, { Component } from 'react';
import { View, Text, Image, Form, TouchableOpacity, RefreshControl, ImageBackground, BackHandler } from 'react-native';
import styles from './styles';
import { Container, Root, Header, Content } from 'native-base';
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';
import { localizes } from 'locales/i18n';
import BaseView from 'containers/base/baseView';
import ic_logo_large from "images/ic_logo_large.png";
import commonStyles from 'styles/commonStyles';
import { Fonts } from 'values/fonts';
import FlatListCustom from 'components/flatListCustom';
import ItemPartner from './itemPartner';
import * as actions from 'actions/userActions';
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import Utils from 'utils/utils';

class RegisterPartnerView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            selected: 0,
            nextText: localizes('registerPartner.confirm'),
            next: false,
            data: null
        };
        const { refreshProfile, data, titlePartner } = this.props.navigation.state.params
        this.listPartner = []
        this.onItemSelected = this.onItemSelected.bind(this)
        this.confirmAction = this.confirmAction.bind(this)
        this.handleRefresh = this.handleRefresh.bind(this)
        this.refreshProfile = refreshProfile
        this.title = titlePartner
        this.data = data
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        if (Utils.isNull(this.data)) {
            this.props.getListPartner()
        } else {
            this.data.forEach((item, index) => {
                if (index == 0) {
                    this.setState({ data: item })
                }
                this.listPartner.push({ ...item })
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    // Confirm choose partner
    confirmChoosePartner() {
        if (this.refreshProfile) {
            this.props.navigation.state.params.refreshProfile()
            this.props.navigation.navigate('Profile')
        } else {
            this.goHomeScreen()
        }
    }

    /**
    * Handler back button
    */
    handlerBackButton() {
        console.log(this.className, 'back pressed')
        if (this.props.navigation && this.refreshProfile) {
            this.onBack()
        }
        return true
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_LIST_PARTNER)) {
                    this.listPartner = []
                    if (data.length > 0) {
                        data.forEach((item, index) => {
                            if (index == 0) {
                                this.setState({ data: item })
                            }
                            this.listPartner.push({ ...item })
                        })
                    }
                    console.log("DATA PARTNER", this.listPartner)
                } else if (this.props.action == getActionSuccess(ActionEvent.SAVE_PARTNER)) {
                    if (data) {
                        this.confirmChoosePartner()
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error)
            }
        }
    }

    render() {
        const { nextText } = this.state
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[{ backgroundColor: Colors.COLOR_BACKGROUND, borderBottomWidth: 0 }]}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            {this.renderHeaderView({
                                visibleBack: this.refreshProfile ? true : false,
                                visibleStage: false,
                                title: ""
                            })}
                            <TouchableOpacity activeOpacity={Constants.ACTIVE_OPACITY} onPress={this.confirmAction} >
                                <Text style={[commonStyles.text,
                                { fontSize: Fonts.FONT_SIZE_MEDIUM, marginRight: Constants.MARGIN_LARGE }
                                ]}>{nextText}</Text>
                            </TouchableOpacity>
                        </View>

                    </Header>
                    <Content
                        // refreshControl={
                        //     <RefreshControl
                        //         refreshing={this.state.refreshing}
                        //         onRefresh={this.handleRefresh}
                        //     />
                        // }
                        contentContainerStyle={{ flexGrow: 1 }}
                        style={{ flex: 1 }}>
                        <View style={{ flexGrow: 1 }}>
                            <View style={[commonStyles.viewCenter]}>
                                <Image source={ic_logo_large} />
                                <View style={{ paddingHorizontal: Constants.PADDING_X_LARGE }}>
                                    <Text style={[commonStyles.text, {
                                        fontSize: Fonts.FONT_SIZE_MEDIUM,
                                        marginHorizontal: Constants.MARGIN_XX_LARGE,
                                        marginTop: Constants.MARGIN_X_LARGE
                                    }]}>
                                        {this.title}
                                    </Text>
                                </View>
                            </View>
                            {this.renderListPartner()}
                        </View>
                    </Content>
                    {this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    // Next or confirm
    confirmAction() {
        const { next, data } = this.state
        next
            ? this.props.navigation.push("RegisterPartner", {
                refreshProfile: this.confirmChoosePartner.bind(this),
                data: data,
                titlePartner: localizes('registerPartner.notePartner')
            })
            : !Utils.isNull(data) ?
                this.props.savePartner({ partnerId: data.id })
                : null
    }

    /**
     * Render list partner
     */
    renderListPartner() {
        return (
            <View style={{ flex: 1 }}>
                <FlatListCustom
                    style={{
                        paddingVertical: Constants.PADDING
                    }}
                    horizontal={false}
                    data={this.listPartner}
                    itemPerCol={1}
                    renderItem={this.renderItem.bind(this)}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

        )
    }

    //onRefreshing
    handleRefresh() {
        this.setState({
            refreshing: false,
            selected: 0,
            nextText: localizes('registerPartner.confirm'),
            next: false,
            data: null
        })
        this.props.getListPartner()
    }

    /**
     * Render item
     * @param {*} onItemSelected
     * @param {*} item 
     * @param {*} index 
     * @param {*} parentIndex 
     * @param {*} indexInParent 
     */
    renderItem(item, index, parentIndex, indexInParent) {
        const { selected } = this.state
        return (
            <ItemPartner
                data={this.listPartner}
                item={item}
                index={index}
                onItemSelected={this.onItemSelected}
                selected={selected}
            />
        );
    }

    /**
     * On itemSelected
     */
    onItemSelected(item, index) {
        this.setState({ selected: index })
        if (!Utils.isNull(item.child)) {
            this.props.navigation.push("RegisterPartner", {
                refreshProfile: this.confirmChoosePartner.bind(this),
                data: item.child,
                titlePartner: localizes('registerPartner.notePartner')
            })
            this.setState({
                nextText: localizes('registerPartner.next'),
                next: true,
                data: item.child
            })
        } else {
            this.setState({
                nextText: localizes('registerPartner.confirm'),
                next: false,
                data: item
            })
        }
    }
}

const mapStateToProps = state => ({
    data: state.partner.data,
    isLoading: state.partner.isLoading,
    error: state.partner.error,
    errorCode: state.partner.errorCode,
    action: state.partner.action
});

const mapDispatchToProps = {
    ...actions
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterPartnerView);
