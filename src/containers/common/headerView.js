import React, { Component } from "react";
import PropTypes from "prop-types";
import { ImageBackground, Dimensions, View, StatusBar, TextInput, ScrollView, TouchableOpacity, Image, Keyboard } from "react-native";
import { Form, Textarea, Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text, Card, CardItem, Fab, Footer, Input, Item } from "native-base";
import { Constants } from "values/constants";
import { Colors } from "values/colors";
import BaseView from "containers/base/baseView";
import TimerCountDown from "components/timerCountDown";
import commonStyles from "styles/commonStyles";
import ic_back_white from "images/ic_back_white.png";
import ic_notification_white from "images/ic_notification_white.png";
import { Fonts } from "values/fonts";
import ic_default_user from "images/ic_default_user.png";
import shadow_avatar_home from "images/shadow_avatar_home.png";
import Utils from "utils/utils";
import ImageLoader from "components/imageLoader";
import BackgroundShadow from "components/backgroundShadow";
import ic_cart_grey from "images/ic_cart_grey.png";
import StringUtil from "utils/stringUtil";
const deviceHeight = Dimensions.get("window").height;

class HeaderView extends Component {
    static propTypes = {
        //Title
        title: PropTypes.string.isRequired,
        //Unit: Seconds
        timeLimit: PropTypes.number,
        //Handle to be called:
        //when user pressed back button
        onBack: PropTypes.func,
        //Called when countdown time has been finished
        onFinishCountDown: PropTypes.func,
        //Called when extra time has been finished
        onTick: PropTypes.func,
        titleStyle: PropTypes.object,
        isReady: PropTypes.bool,
        visibleBack: PropTypes.bool,
        visibleCart: PropTypes.bool,
        visibleNotification: PropTypes.bool,
        visibleMap: PropTypes.bool,
        visibleAccount: PropTypes.bool,
        visibleSearchBar: PropTypes.bool,
        stageSize: PropTypes.number,
        initialIndex: PropTypes.number,
        visibleStage: PropTypes.bool
    };

    static defaultProps = {
        onFinishCountDown: null,
        onFinishExtraTime: null,
        isReady: true,
        onTick: null,
        visibleBack: false,
        visibleCart: false,
        visibleNotification: false,
        visibleMap: false,
        visibleAccount: false,
        visibleSearchBar: false,
        onBack: null,
        stageSize: 4,
        initialIndex: 0,
        visibleStage: true,
        titleStyle: null
    };

    constructor(props) {
        super(props);
        this.state = {
            countDownTime: this.props.timeLimit
        };
        this.timeTick = this.state.countDownTime;
    }

    render() {
        const { title, onBack, onRefresh, onGrid, renderRightMenu } = this.props;
        return (
            <View style={styles.headerBody}>
                {/*Back button*/}
                {this.props.visibleBack ? this.renderBack() : null}
                {!StringUtil.isNullOrEmpty(title) ? (
                    <Text numberOfLines={1} style={[commonStyles.title, { textAlign: "center", flex: 1 }, this.props.titleStyle]}>
                        {title}
                    </Text>
                ) : null}
                {/* Render account */}
                {this.props.visibleAccount ? this.renderAccount() : null}
                {/* Render timer countdown */}
                {this.props.visibleSearchBar ? this.renderSearchBar() : null}
                {/* Render timer countdown */}
                {this.props.visibleCart ? this.renderCart() : null}
                {/* Notification button */}
                {this.props.visibleNotification ? this.renderNotification() : null}
                {/* Render list */}
                {this.props.visibleMap ? this.renderMap() : null}
                {/* Render stage list */}
                {this.props.visibleStage ? this.renderStageList() : null}
                {renderRightMenu && renderRightMenu()}
            </View>
        );
    }

    onTimeElapsed = () => {
        if (this.props.onFinishCountDown) this.props.onFinishCountDown();
    };

    /**
     * Render back
     */
    renderBack() {
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                style={{
                    paddingVertical: "100%",
                    paddingHorizontal: Constants.PADDING_LARGE
                }}
                onPress={() => {
                    if (this.props.onBack) this.props.onBack();
                }}
            >
                <Image source={ic_back_white} />
            </TouchableOpacity>
        );
    }

    /**
     * Render cart
     */
    renderCart() {
        const { quantityCart } = this.props;
        return (
            <TouchableOpacity
                style={{ padding: Constants.PADDING_12 }}
                onPress={() => {
                    if (this.props.showCart) this.props.showCart();
                }}
            >
                <Image source={ic_cart_grey} />
                {quantityCart != 0 ? (
                    <View
                        style={[
                            commonStyles.viewCenter,
                            {
                                position: "absolute",
                                top: Constants.MARGIN,
                                right: 0,
                                width: quantityCart >= 10 ? 24 : 16,
                                height: 16,
                                borderRadius: Constants.CORNER_RADIUS,
                                backgroundColor: Colors.COLOR_BACKGROUND_COUNT_NOTIFY
                            }
                        ]}
                    >
                        <Text
                            style={[
                                commonStyles.text,
                                {
                                    color: Colors.COLOR_WHITE,
                                    fontSize: Fonts.FONT_SIZE_SMALL
                                }
                            ]}
                        >
                            {quantityCart}
                        </Text>
                    </View>
                ) : null}
            </TouchableOpacity>
        );
    }

    renderMap() {
        return (
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    position: "absolute",
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    flexDirection: "row",
                    right: 0,
                    marginRight: Constants.PADDING_12
                }}
                onPress={this.props.openMenu}
            >
                <View>
                    <Image source={this.props.icon} style={{ height: Constants.DIVIDE_HEIGHT_LARGE * 6, width: Constants.DIVIDE_HEIGHT_LARGE * 6 }} resizeMode={"contain"} />
                </View>
            </TouchableOpacity>
        );
    }

    renderAccount() {
        const { user, userName, gotoLogin, source } = this.props;
        console.log('RENDER HOME VIEW1', source)
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={this.props.gotoLogin}
                style={{
                    alignItems: "center",
                    flexDirection: "row",
                    padding: Constants.PADDING_12
                }}
            >
                <BackgroundShadow
                    source={shadow_avatar_home}
                    styleBackground={{
                        paddingTop: 0,
                        paddingHorizontal: Constants.PADDING / 2,
                        paddingBottom: Constants.PADDING,
                        marginHorizontal: -(Constants.PADDING / 2),
                        marginBottom: -Constants.PADDING
                    }}
                    content={
                        <ImageLoader
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                position: "relative"
                            }}
                            resizeModeType={"cover"}
                            path={!Utils.isNull(source) ? source : null}
                        />
                    }
                />
                {!Utils.isNull(userName) ? (
                    <View>
                        <Text style={[commonStyles.text, { marginLeft: Constants.MARGIN_LARGE }]}>{userName}</Text>
                    </View>
                ) : null}
            </TouchableOpacity>
        );
    }

    /**
     * Render notification button
     */
    renderNotification() {
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                style={{
                    position: "absolute",
                    justifyContent: "center",
                    right: Constants.MARGIN_X_LARGE,
                    paddingVertical: "100%"
                }}
                onPress={this.props.gotoNotification}
            >
                <Image source={ic_notification_white} />
            </TouchableOpacity>
        );
    }

    /**
     * Render timer count down
     */
    renderSearchBar() {
        return (
            <View style={[{ flex: 1, flexDirection: "row", alignItems: "center" }, this.props.styleSearch]}>
                {/*Left button*/}
                {!Utils.isNull(this.props.iconLeftSearch) ? (
                    <TouchableOpacity
                        style={{
                            paddingVertical: "100%",
                            paddingHorizontal: Constants.PADDING_LARGE
                        }}
                        onPress={() => {
                            this.props.onPressLeftSearch();
                        }}
                    >
                        <Image source={this.props.iconLeftSearch} />
                    </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    style={[commonStyles.viewHorizontal, commonStyles.viewCenter]}
                    onPress={() => {
                        if (this.props.onTouchStart) {
                            this.props.onTouchStart(); // with editable = false
                        }
                    }}
                >
                    <TextInput
                        style={[
                            commonStyles.text,
                            {
                                margin: 0,
                                borderRadius: 0,
                                flex: 1,
                                paddingHorizontal: Constants.PADDING_LARGE,
                                color: Colors.COLOR_WHITE
                            }
                        ]}
                        placeholder={this.props.placeholder}
                        placeholderTextColor={Colors.COLOR_WHITE}
                        ref={ref => {
                            if (this.props.onRef) this.props.onRef(ref);
                        }}
                        value={this.props.inputSearch}
                        onChangeText={this.props.onChangeTextInput}
                        onSubmitEditing={() => {
                            this.props.onSubmitEditing();
                            Keyboard.dismiss();
                        }}
                        keyboardType="default"
                        underlineColorAndroid="transparent"
                        returnKeyType={"search"}
                        blurOnSubmit={false}
                        autoCorrect={false}
                        autoFocus={this.props.autoFocus}
                        editable={this.props.editable}
                    />
                </TouchableOpacity>
                {/*Right button*/}
                {!Utils.isNull(this.props.iconRightSearch) ? (
                    <TouchableOpacity
                        style={{
                            paddingVertical: "100%",
                            paddingHorizontal: Constants.PADDING_LARGE
                        }}
                        onPress={() => {
                            this.props.onPressRightSearch();
                        }}
                    >
                        <Image source={this.props.iconRightSearch} />
                    </TouchableOpacity>
                ) : null}
            </View>
        );
    }

    componentWillReceiveProps(newProps) {
        if (newProps.timeLimit <= 0) this.timeTick = newProps.timeLimit;
        this.setState({
            countDownTime: newProps.timeLimit
        });
    }

    /**
     * Get remain time is countdown
     */
    getTime() {
        return this.timeTick;
    }

    /**
     * Render stage list include dot & bar
     */
    renderStageList() {
        if (this.props.removeHeader == true) {
            return <View />;
        }
        const size = this.props.stageSize;
        let stages = [];
        const initialIndex = this.props.initialIndex;
        for (let i = 0; i < size; i++) {
            let styleForBar = [styles.barStage];
            let styleForDot = [styles.dotStage];
            if (i > initialIndex) {
                styleForDot.push({ backgroundColor: "rgba(255,255,255,0.2)" });
                styleForBar.push({ backgroundColor: "rgba(255,255,255,0.2)" });
            }
            let dotStage = (
                <View key={i * 2 + 1} style={styleForDot}>
                    <Text style={{ color: Colors.COLOR_PRIMARY }}>{i + 1}</Text>
                </View>
            );
            let barStage = <View style key={i * 2 + 2} style={styleForBar} />;
            if (i !== 0) {
                stages.push(barStage);
            }
            stages.push(dotStage);
        }
        return (
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: Constants.MARGIN_LARGE,
                    marginLeft: Constants.MARGIN_LARGE
                }}
            >
                {stages}
            </View>
        );
    }
}

const styles = {
    headerBody: {
        flex: 1,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between"
    },

    whiteIcon: {
        color: Colors.COLOR_WHITE
    },

    dotStage: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.COLOR_WHITE,
        justifyContent: "center",
        alignItems: "center"
    },

    barStage: {
        width: 10,
        height: 5,
        backgroundColor: Colors.COLOR_WHITE
    }
};
export default HeaderView;
