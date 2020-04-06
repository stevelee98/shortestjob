import React, { PureComponent } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Constants } from "values/constants";
import Utils from "utils/utils";
import slidingMenuType from "enum/slidingMenuType";
import screenType from "enum/screenType";
import ic_next_grey from "images/ic_next_grey.png";
import ChatUnseenIcon from "containers/main/tabIcon/chatUnseenIcon";
import { Colors } from "values/colors";
import commonStyles from "styles/commonStyles";
import screenMyPostType from "enum/screenMyPostType";

class ItemSlidingMenu extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {
            data,
            item,
            index,
            navigation,
            userInfo,
            callBack,
            resourceUrlPathResize,
            source,
            onLogout
        } = this.props;
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => {
                    if (!Utils.isNull(item.screen)) {
                        if (item.screen == slidingMenuType.USER_INFO) {
                            navigation.navigate(item.screen, {
                                userInfo: userInfo,
                                source: source,
                                callBack: callBack,
                                resourceUrlPathResize: resourceUrlPathResize
                            });
                        } else if (item.screen == slidingMenuType.FAVORITE_POST) {
                            navigation.navigate(slidingMenuType.MY_POST, {
                                typeShow: screenMyPostType.MY_POST_LIKED
                            });
                        } else if (item.screen == slidingMenuType.CHANGE_PASSWORD) {
                            navigation.navigate(item.screen);
                        } else if (item.screen == slidingMenuType.MY_POST) {
                            navigation.navigate(item.screen, {
                                typeShow: screenMyPostType.MY_POST
                            });
                        } else if (item.screen == slidingMenuType.RULES) {
                            navigation.navigate(item.screen);
                        }
                    } else if (index == data.length - 1) {
                        onLogout();
                    }
                }}
                block
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        height: Constants.HEADER_HEIGHT + 10
                    }}
                >
                    <Text
                        style={[
                            commonStyles.text,
                            {
                                flex: 1,
                                margin: 0,
                                color: index == data.length - 1 ? Colors.COLOR_RED_LIGHT : null
                            }
                        ]}
                    >
                        {item.name}
                    </Text>
                    {index != data.length - 1 ? <Image source={ic_next_grey} /> : null}
                </View>
            </TouchableOpacity>
        );
    }
}

export default ItemSlidingMenu;
