import React, { Component } from "react";
import { View, Text, RefreshControl, BackHandler, TouchableOpacity, Image, Dimensions } from "react-native";
import BaseView from "containers/base/baseView";
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import StorageUtil from "utils/storageUtil";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import { Container, Root, Header, Content } from "native-base";
import commonStyles from "styles/commonStyles";
import styles from "../info/styles";
import { localizes } from "locales/i18n";
import { Colors } from "values/colors";
import Utils from "utils/utils";
import { Constants } from "values/constants";
import screenType from "enum/screenType";
import HTML from "react-native-render-html";

class TermsRegulationsView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            enableRefresh: true,
            refreshing: false,
            termsRegulations: null,
            isConfirm: false
        };
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        this.getTermsRegulations();
    }

    /**
     * Get terms regulations
     */
    getTermsRegulations = () => {
        StorageUtil.retrieveItem(StorageUtil.MOBILE_CONFIG).then((faq) => {
            if (!Utils.isNull(faq)) {
                let termsRegulations = faq.find(x => x.name == 'terms_regulations')
                if (!Utils.isNull((termsRegulations))) {
                    this.setState({ termsRegulations: termsRegulations.textValue })
                }
            }
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error: ' + error);
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    render() {
        const { termsRegulations } = this.state;
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header, { backgroundColor: Colors.COLOR_PRIMARY }]}>
                        {this.renderHeaderView({
                            title: localizes("termsRegulations.title"),
                            visibleStage: false,
                            titleStyle: { color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightHeader
                        })}
                    </Header>
                    <Content contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
                        <View style={{ flex: 1, paddingHorizontal: Constants.PADDING_X_LARGE }}>
                            {!Utils.isNull(termsRegulations)
                                ? <HTML html={termsRegulations} imagesMaxWidth={Dimensions.get("window").width} />
                                : null
                            }
                        </View>
                        {/* Policy */}
                    </Content>
                </Root>
            </Container>
        );
    }

    /**
     * Check confirm
     */
    checkConfirm = () => {
        this.setState({
            isConfirm: !this.state.isConfirm
        });
    };
}

export default TermsRegulationsView;
