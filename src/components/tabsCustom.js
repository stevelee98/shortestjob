'use strict';
import React, { Component } from "react";
import PropTypes from 'prop-types';
import {
    ImageBackground, View, StatusBar, TextInput,
} from "react-native";
import {
    Tabs, ScrollableTab, Tab
} from "native-base";
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import { Fonts } from "values/fonts";
import Utils from "utils/utils";

export default class TabsCustom extends Component {

    constructor(props) {
        super(props)
        this.state = {

        };
    }

    render = () => {
        const { tabs = [], child, isRenderTabBar, initialPage, onChangeTab, onScroll, underlineStyle, disableScroll = false } = this.props;
        return (
            <Tabs
                initialPage={initialPage}
                renderTabBar={isRenderTabBar ? () =>
                    <ScrollableTab
                        tabsContainerStyle={{ backgroundColor: Colors.COLOR_BACKGROUND }}
                        style={commonStyles.scrollableTab}
                    /> : null
                }
                locked={disableScroll}
                tabContainerStyle={{ elevation: 0 }}
                tabBarUnderlineStyle={[commonStyles.tabBarUnderlineStyle, underlineStyle]}
                onChangeTab={(event) => onChangeTab && onChangeTab(event)}
                onScroll={(event) => onScroll && onScroll(event)}>
                {tabs.map((tab, index) => {
                    return (
                        <Tab
                            key={index.toString()}
                            heading={tab.name}
                            tabStyle={commonStyles.tabStyle}
                            activeTabStyle={commonStyles.activeTabStyle}
                            textStyle={commonStyles.textStyle}
                            activeTextStyle={commonStyles.activeTextStyle}
                        >
                            {child(tab)}
                        </Tab>
                    )
                })}
            </Tabs>
        )
    }
}

TabsCustom.defaultProps = {

}

TabsCustom.propTypes = {

}

const styles = {

}