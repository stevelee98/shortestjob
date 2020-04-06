import React, { Component } from 'react';
import { View, Text, Dimensions } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import CustomMarker from './customMaker';
import styles from './styles';
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

const UNIT = 100000;
const MIN_PRICE = 0;
const MAX_PRICE = 100000000000;

class MultiSliderCustom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            multiSliderValue: [MIN_PRICE, MAX_PRICE / UNIT]
        };
        this.height = height * 1.5 / 100
        this.width = width - Constants.MARGIN_X_LARGE * 2 - Constants.PADDING * 2
    }

    render() {
        const { multiSliderValue } = this.state
        return (
            <View style={styles.sliders}>
                <MultiSlider
                    values={[
                        this.props.minNumber !== MIN_PRICE ? this.props.minNumber / UNIT : multiSliderValue[0],
                        this.props.maxNumber !== MAX_PRICE ? this.props.maxNumber / UNIT : multiSliderValue[1],
                    ]}
                    selectedStyle={{
                        backgroundColor: Colors.COLOR_TRANSPARENT
                    }}
                    unselectedStyle={{
                        backgroundColor: Colors.COLOR_TRANSPARENT
                    }}
                    containerStyle={{
                        height: 40,
                    }}
                    touchDimensions={{
                        height: 40,
                        width: 40,
                        borderRadius: 20,
                        slipDisplacement: 40,
                    }}
                    sliderLength={this.width - 16}
                    onValuesChange={this.multiSliderValuesChange}
                    min={multiSliderValue[0]}
                    max={multiSliderValue[1]}
                    step={1}
                    allowOverlap
                    snapped
                    customMarker={CustomMarker}
                />
                <View
                    style={{
                        width: this.width,
                        height: this.height,
                        marginHorizontal: Constants.MARGIN,
                        marginBottom: Constants.MARGIN_X_LARGE,
                        marginTop: -Constants.MARGIN_LARGE,
                        backgroundColor: "#78849E",
                        borderRadius: 19,
                        borderColor: 'transparent'
                    }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={[commonStyles.viewHorizontal, {
                            flex: 0,
                            width: `${multiSliderValue[1] * UNIT / MAX_PRICE * 100}%`,
                            paddingLeft: `${multiSliderValue[0] * UNIT / MAX_PRICE * 100}%`,
                            height: this.height,
                        }]} >
                            <View style={{ flex: 1, backgroundColor: '#5149E8', borderBottomLeftRadius: 15, borderTopLeftRadius: 15, height:"100%"}} />
                            <View style={{ flex: 1, backgroundColor: '#5773FF', height:"100%" }}></View>
                            <View style={{ flex: 1, backgroundColor: '#3497FD', height:"100%" }}></View>
                            <View style={{ flex: 1, backgroundColor: '#3ACCE1', borderBottomRightRadius: 15, borderTopRightRadius: 15, height:"100%" }} />
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    /**
     * Multi Slider Values Change
     */
    multiSliderValuesChange = values => {
        const { onSetPrice } = this.props
        this.setState({
            multiSliderValue: values
        });
        onSetPrice(values[0] * UNIT, values[1] * UNIT)
    };
}

export default MultiSliderCustom
