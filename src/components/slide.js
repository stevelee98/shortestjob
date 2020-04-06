import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Image,
    Text,
    View,
    ScrollView,
    StyleSheet,
    Animated,
    PanResponder,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import ViewPager from 'components/viewPager'
import { Constants } from 'values/constants';

const reactNativePackage = require('react-native/package.json');
const splitVersion = reactNativePackage.version.split('.');
const majorVersion = +splitVersion[0];
const minorVersion = +splitVersion[1];

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        flex:1,
    },
    layoutIndicator: {
        height: 15,
        position: 'absolute',
        bottom: 5,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'transparent',
    },
    indicator: {
        margin: 3,
        opacity: 0.9
    },
    indicatorSelected: {
        opacity: 1,
    },
    containerImage: {
        flex: 1,
        width: Dimensions.get('window').width,
    },
    overlay: {
        opacity: 0.5,
        backgroundColor: 'black',
    },
    layoutText: {
        position: 'absolute',
        paddingHorizontal: 15,
        bottom: 30,
        left: 0,
        right: 0,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexDirection: 'column',
        backgroundColor: 'transparent',
    },
    textTitle: {
        fontWeight: 'bold',
        fontSize: 15,
        color: 'white',
    },
    textCaption: {
        fontWeight: '400',
        fontSize: 12,
        color: 'white',
    }
});

export default class Slide extends Component {
    constructor(props) {
        super(props);
        this.state = {
            position: 0,
            height: Dimensions.get('window').width * (4 / 9),
            width: Dimensions.get('window').width,
            scrolling: false,
        };
    }

    _onRef(ref) {
        this._ref = ref;
        if (ref && this.state.position !== this._getPosition()) {
            this._move(this._getPosition());
        }
    }

    _move(index) {
        const isUpdating = index !== this._getPosition();
        const x = this.state.width * index;
        if (majorVersion === 0 && minorVersion <= 19) {
            this._ref.scrollTo(0, x, true); // use old syntax
        } else {
            this._ref.scrollTo({ x: this.state.width * index, y: 0, animated: true });
        }
        this.setState({ position: index });
        if (isUpdating && this.props.onPositionChanged) {
            this.props.onPositionChanged(index);
        }
    }

    _getPosition() {
        if (typeof this.props.position === 'number') {
            return this.props.position;
        }
        return this.state.position;
    }

    _next() {
        const pos = this.state.position === this.props.size - 1 ? 0 : this.state.position + 1;
        this._move(pos);
        this.setState({ position: pos });
    }

    _prev() {
        const pos = this.state.position === 0 ? this.props.size - 1 : this.state.position - 1;
        this._move(pos);
        this.setState({ position: pos });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.position !== this.props.position) {
            this._move(this.props.position);
        }
    }

    componentWillMount() {
        const width = this.state.width;

        let release = (e, gestureState) => {
            const width = this.state.width;
            const relativeDistance = gestureState.dx / width;
            const vx = gestureState.vx;
            let change = 0;

            if (relativeDistance < -0.5 || (relativeDistance < 0 && vx <= 0.5)) {
                change = 1;
            } else if (relativeDistance > 0.5 || (relativeDistance > 0 && vx >= 0.5)) {
                change = -1;
            }
            const position = this._getPosition();
            if (position === 0 && change === -1) {
                change = 0;
            } else if (position + change >= this.props.size) {
                change = (this.props.size) - (position + change);
            }
            this._move(position + change);
            return true;
        };

        this._panResponder = PanResponder.create({
            onPanResponderRelease: release
        });

        this._interval = setInterval(() => {
            const newWidth = Dimensions.get('window').width;
            if (newWidth !== this.state.width) {
                this.setState({ width: newWidth });
            }
        }, 16);
    }

    componentWillUnmount() {
        clearInterval(this._interval);
    }

    render() {
        const width = this.state.width;
        const position = this._getPosition();
        var views = [];
        for (let index = 0; index < this.props.size; index++) {
            views.push(
                <View key={index} style={{ width }}>
                    {this.props.render({ index })}
                </View>
            )
        }
        return (
            <View style={[
                this.props.containerStyle,
            ]}>
                <ScrollView
                    keyboardDismissMode='on-drag'
                    keyboardShouldPersistTaps="always"
                    removeClippedSubviews = {true}
                    ref={ref => this._onRef(ref)}
                    decelerationRate={0.99}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={this.props.scrollEnabled}
                    {...this._panResponder.panHandlers}
                    style={styles.container}
                    // height = {Constants.QUICK_ANSWER_HEIGHT}
                    // showsPagination = {false}>
                    >
                    {views}
                </ScrollView>
            </View>
        );
    }
}

Slide.defaultProps = {
}

Slide.propTypes = {
    size: PropTypes.number,
};

const setIndicatorSize = function (size) {
    return {
        width: size,
        height: size,
        borderRadius: size / 2,
    };
}

const setIndicatorColor = function (color) {
    return {
        backgroundColor: color,
    };
}
