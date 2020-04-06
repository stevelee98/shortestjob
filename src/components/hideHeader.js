import React, { Component } from 'react';
import { Animated, Text, View, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { Constants } from 'expo';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const HEADER_HEIGHT = 44 + Constants.statusBarHeight;
const BOX_SIZE = (Dimensions.get('window').width / 2) - 12;
const PHOTOS = Array.from({ length: 24 }).map((_, i) => `https://unsplash.it/300/300/?random&__id${i}`);

export default class App extends Component {
  state = {
    scrollAnim: new Animated.Value(0),
    offsetAnim: new Animated.Value(0),
  };
  
  componentDidMount() {
    this.state.scrollAnim.addListener(this._handleScroll);
  }

  componentWillUnmount() {
    this.state.scrollAnim.removeListener(this._handleScroll);
  }
  
  _handleScroll = ({ value }) => {
    this._previousScrollvalue = this._currentScrollValue;
    this._currentScrollValue = value;
  };
  
  _handleScrollEndDrag = () => {
    this._scrollEndTimer = setTimeout(this._handleMomentumScrollEnd, 250);
  };

  _handleMomentumScrollBegin = () => {
    clearTimeout(this._scrollEndTimer);
  };
  
  _handleMomentumScrollEnd = () => {
    const previous = this._previousScrollvalue;
    const current = this._currentScrollValue;
    
    if (previous > current || current < HEADER_HEIGHT) {
      // User scrolled down or scroll amount was too less, lets snap back our header
      Animated.spring(this.state.offsetAnim, {
        toValue: -current,
        tension: 300,
        friction: 35,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(this.state.offsetAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };
  
  render() {
    const { scrollAnim, offsetAnim } = this.state;
    
    const translateY = Animated.add(scrollAnim, offsetAnim).interpolate({
      inputRange: [0, HEADER_HEIGHT],
      outputRange: [0, -HEADER_HEIGHT],
      extrapolate: 'clamp'
    });
    
    return (
      <View style={styles.container}>
        <AnimatedScrollView
          contentContainerStyle={styles.gallery}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [ { nativeEvent: { contentOffset: { y: this.state.scrollAnim } } } ],
            { useNativeDriver: true },
          )}
          onMomentumScrollBegin={this._handleMomentumScrollBegin}
          onMomentumScrollEnd={this._handleMomentumScrollEnd}
          onScrollEndDrag={this._handleScrollEndDrag}
        >
          {PHOTOS.map(uri => (
            <Image source={{ uri }} style={styles.photo} />
          ))}
        </AnimatedScrollView>
        <Animated.View style={[styles.header, { transform: [{translateY}] }]}>
          <Text style={styles.title}>
            GALLERY
          </Text>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
    paddingTop: HEADER_HEIGHT,
  },
  photo: {
    height: BOX_SIZE,
    width: BOX_SIZE,
    resizeMode: 'cover',
    margin: 4,
  },
  header: {
    height: HEADER_HEIGHT,
    paddingTop: Constants.statusBarHeight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 16,
  },
});