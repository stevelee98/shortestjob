import { AppRegistry } from 'react-native';
import App from './App';
import { Platform } from "react-native";

AppRegistry.registerComponent(Platform.OS  === 'android' ? 'market' : 'ielts', () => App);
