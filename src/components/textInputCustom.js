import React, { Component } from 'react';
import { Text, View, TextInput, Dimensions, ImageBackground, Image, TouchableOpacity } from 'react-native';
import GridView from 'components/gridView';
import PropTypes from 'prop-types';
import { Textarea } from 'native-base';
import commonStyles from 'styles/commonStyles';
import ic_next_grey from 'images/ic_next_grey.png';
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';
import Utils from 'utils/utils';
import { Fonts } from 'values/fonts';
import Hr from './hr';

/**
 * This is text input custom without using state to change value
 * You can use this component instead of TextInput
 */

const heightDevice = Dimensions.get('window').height;

export default class TextInputCustom extends Component {

    constructor(props) {
        super(props)
        this.state = {
            value: props.value ? props.value : "",
            isFocus: props.isFocus
        }
    }

    render() {
        const { isMultiLines, isInputAction, isInputNormal } = this.props
        return (
            <View>
                {isMultiLines ? this.renderInputMultiLines() : null}
                {isInputAction ? this.renderInputAction() : null}
                {isInputNormal ? this.renderInputOneLine() : null}
            </View>
        )
    }

    renderInputOneLine() {
        const { refInput, inputNormalStyle, autoCapitalize, returnKeyType, placeholder, onSubmitEditing,
            keyboardType, secureTextEntry, onSelectionChange, blurOnSubmit,
            onFocus, numberOfLines, title, warnTitle, isValidate, hrEnable = true } = this.props;
        return (
            <View style={{ backgroundColor: Colors.COLOR_WHITE }}>
                {this.renderTitle()}
                <TextInput
                    {...this.props}
                    ref={refInput}
                    secureTextEntry={secureTextEntry}
                    placeholder={placeholder}
                    returnKeyType={returnKeyType}
                    autoCapitalize={autoCapitalize}
                    style={[commonStyles.text, commonStyles.inputText, {
                        margin: 0
                    }, inputNormalStyle]}
                    value={this.state.value}
                    onChangeText={this.changeText.bind(this)}
                    underlineColorAndroid='transparent'
                    onSubmitEditing={onSubmitEditing}
                    keyboardType={keyboardType}
                    onSelectionChange={onSelectionChange}
                    blurOnSubmit={blurOnSubmit}
                    onFocus={onFocus}
                    numberOfLines={numberOfLines}
                />
                {hrEnable ? <Hr color={Colors.COLOR_BACKGROUND} style={{ marginHorizontal: Constants.MARGIN_X_LARGE }} /> : null}
            </View>
        );
    }

    renderInputAction() {
        const { refInput, onPress, touchSpecialStyle, inputSpecialStyle, imageSpecialStyle, placeholder,
            myBackgroundColor, disabled, autoCapitalize, opacity, placeholderTextColor, imgRight, title, warnTitle, isValidate } = this.props;
        return (
            <View style={{
                backgroundColor: Colors.COLOR_WHITE
            }}>
                {this.renderTitle()}
                <TouchableOpacity
                    disabled={disabled}
                    onPress={onPress}
                    activeOpacity={1}
                    style={[touchSpecialStyle]}>
                    <TextInput
                        {...this.props}
                        autoCapitalize={autoCapitalize}
                        ref={refInput}
                        style={[commonStyles.text, commonStyles.inputText, inputSpecialStyle, {
                            backgroundColor: myBackgroundColor
                        }]}
                        placeholder={placeholder}
                        placeholderTextColor={placeholderTextColor}
                        value={this.state.value}
                        onChangeText={this.changeText.bind(this)}
                        underlineColorAndroid='transparent'
                        blurOnSubmit={false}
                        autoCorrect={false}
                        editable={false}
                        selectTextOnFocus={false}
                    />
                    <View
                        style={[commonStyles.inputText, imageSpecialStyle, {
                            borderBottomLeftRadius: 0, borderTopLeftRadius: 0,
                            backgroundColor: myBackgroundColor
                        }]}>
                        <Image source={!Utils.isNull(imgRight) ? imgRight : ic_next_grey} />
                    </View>
                </TouchableOpacity>
                <Hr color={Colors.COLOR_BACKGROUND} style={{ marginHorizontal: Constants.MARGIN_X_LARGE, }} />
            </View>
        )
    }

    renderInputMultiLines() {
        const { inputNormalStyle, refInput } = this.props;
        return (
            <View style={{
                backgroundColor: Colors.COLOR_WHITE
            }}>
                {this.renderTitle()}
                <TextInput
                    {...this.props}
                    ref={refInput}
                    style={[commonStyles.text, commonStyles.inputText, inputNormalStyle, {
                        margin: 0,
                        textAlignVertical: "top"
                    }]}
                    onChangeText={this.changeText.bind(this)}
                    underlineColorAndroid='transparent'
                    blurOnSubmit={false}
                    multiline={true}
                />
            </View>
        )
    }

    renderTitle() {
        const { title, warnTitle, isValidate } = this.props;
        return (
            !isValidate
                ? <Text style={{
                    fontSize: Fonts.FONT_SIZE_X_SMALL,
                    marginLeft: Constants.MARGIN_X_LARGE,
                    marginTop: Constants.MARGIN_12,
                    color: Colors.COLOR_TEXT,
                    marginBottom: 0
                }}>
                    {title}
                </Text>
                : <Text style={{
                    fontSize: Fonts.FONT_SIZE_X_SMALL,
                    color: Colors.COLOR_RED,
                    marginLeft: Constants.MARGIN_X_LARGE,
                    marginTop: Constants.MARGIN_12,
                    marginBottom: 0
                }}>
                    {warnTitle}
                </Text>

        )
    }

    changeText(text) {
        this.setState({
            value: text
        })
        if (this.props.onChangeText)
            this.props.onChangeText(text)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        })
    }
}