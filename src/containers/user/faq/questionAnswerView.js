import React, { Component } from "react";
import { ImageBackground, View, StatusBar, Image, TouchableOpacity, BackHandler, ScrollView, WebView, ActivityIndicator } from "react-native";
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text, Card, CardItem } from "native-base";
import BaseView from "containers/base/baseView";
import { Colors } from 'values/colors';
import * as actions from 'actions/userActions';
import { Constants } from "values/constants";
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import StorageUtil from 'utils/storageUtil';
import { localizes } from "locales/i18n";
import Utils from "utils/utils";

class QuestionAnswerView extends BaseView {
    constructor(props) {
        super(props)
        this.state = {
            visible: true,
            urlFaq: {}
        }
        this.configList = []
        const { actionTarget } = this.props.navigation.state.params;
        this.actionTarget = actionTarget;
        this.titleScreen = ""
    }
    hideSpinner() {
        this.setState({ visible: false });
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        if (!Utils.isNull(this.actionTarget)) {
            var myObj = JSON.parse(this.actionTarget);
            // var x = myObj["url"].price;
            console.log(myObj)
            this.setState({
                urlFaq: myObj
            })
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    handlerBackButton() {
        this.props.navigation.pop(1);
        return true;
    }

    render() {
        console.log('faq', this.state.urlFaq)
        return (
            <Container style={{ backgroundColor: Colors.COLOR_WHITE }}>
                <Header style={{ backgroundColor: Colors.COLOR_PRIMARY }}>
                    {this.renderHeaderView({
                        title: `${this.titleScreen}`,
                        visibleStage: false,
                        titleStyle: { marginRight: Constants.MARGIN_X_LARGE * 2 }
                    })}
                </Header>
                <Content contentContainerStyle={{ flexGrow: 1 }}>
                    <WebView
                        source={{ uri: this.state.urlFaq != null ? this.state.urlFaq.url : '' }}
                        originWhitelist={['*']}
                        onLoad={() => (this.hideSpinner())}
                        style={{ marginTop: Constants.MARGIN_LARGE }}
                    >
                    </WebView>
                    {this.showLoadingBar(this.state.visible)}
                </Content>
            </Container>
        )
    }
}

export default QuestionAnswerView;