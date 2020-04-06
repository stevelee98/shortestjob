import React, { Component } from 'react';
import { BackHandler, Text, View, Image, Alert, Dimensions } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';

// Import screens
import NotificationView from 'containers/user/notification/notificationView';
import UserProfileView from 'containers/user/profile/info/userProfileView';
import HomeView from 'containers/home/homeView';
import ListChatView from 'containers/chat/listChatView';

// import icons
import { Colors } from 'values/colors';
import { Fonts } from 'values/fonts';
import commonStyles from 'styles/commonStyles';
import { Constants } from 'values/constants';
import global from 'utils/global'
import MagicTabBar from './magicTabBar';
import HomeButton from './tabIcon/homeButton';
import ChatButton from './tabIcon/chatButton';
import NotificationButton from './tabIcon/notificationButton';
import ProfileButton from './tabIcon/profileButton';
import { PostButton } from './tabIcon/postButton';

const RouteConfig = {
	Home: {
		screen: HomeView,
		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => (
				<HomeButton focused={focused} navigation={navigation} />
			),
		}),
	},
	ListChat: {
		screen: ListChatView,
		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => (
				<ChatButton focused={focused} navigation={navigation} />
			),
		}),
	},
	Post: {
		screen: () => null,
		navigationOptions: () => ({
			tabBarIcon: (
				<PostButton />
			)
		}),
		params: {
			navigationDisabled: true
		}
	},
	Notification: {
		screen: NotificationView,
		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => (
				<NotificationButton focused={focused} navigation={navigation} />
			),
		}),
	},
	Profile: {
		screen: UserProfileView,
		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => (
				<ProfileButton focused={focused} navigation={navigation} />
			),
		}),
	},
};

const BottomNavigatorConfig = {
	tabBarComponent: props => <MagicTabBar {...props} />,
	tabBarOptions: {
		activeTintColor: 'rgb(255,255,255)',
		inactiveTintColor: 'rgb(89, 102, 139)',
		style: {
			backgroundColor: Colors.COLOR_WHITE,
		},
		showLabel: false,
	},
	tabStyle: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
};

export default createBottomTabNavigator(RouteConfig, BottomNavigatorConfig);