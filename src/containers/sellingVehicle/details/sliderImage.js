import React, { Component } from 'react';
import { View, Text, Dimensions, TouchableOpacity, Modal, Image } from 'react-native';
import { Colors } from 'values/colors';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import ImageLoader from 'components/imageLoader';
import { Constants } from 'values/constants';
import ic_cancel_white from 'images/ic_cancel_white.png';
import ImageViewer from 'react-native-image-zoom-viewer';
import commonStyles from 'styles/commonStyles';
import Utils from 'utils/utils';

const screen = Dimensions.get("window");
const WIDTH_PAGINATION = screen.width / 3
const INACTIVE_DOT_WIDTH_HEIGHT = 10;

class SliderImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeSlide: 0,
            isModalOpened: false,
            indexZoom: 0
        };
        this.renderItemCarousel = this.renderItemCarousel.bind(this);
        this.imageUrls = [];
    }


    /**
    * Open modal display images
    */
    toggleModal(index) {
        this.setState({
            isModalOpened: !this.state.isModalOpened,
            indexZoom: index
        })
    }


    render() {
        const { activeSlide, indexZoom } = this.state;
        const { data } = this.props;
        if (!Utils.isNull(data)) {
            this.imageUrls = [];
            data.forEach(item => {
                this.imageUrls.push({ url: item.pathToResource + `&op=resize&w=800` })
            })
        }
        return (
            <View>
                <Carousel
                    ref={(c) => { this._carousel = c; }}
                    data={data}
                    renderItem={this.renderItemCarousel}
                    sliderWidth={screen.width}
                    itemWidth={screen.width}
                    // loop={true}
                    autoplay={true}
                    onSnapToItem={(index) => this.setState({ activeSlide: index })}
                    containerCustomStyle={{
                        flexGrow: 0
                    }}
                />
                <Pagination
                    dotsLength={data.length}
                    activeDotIndex={activeSlide}
                    containerStyle={{
                        ...commonStyles.viewCenter,
                        backgroundColor: Colors.COLOR_TRANSPARENT,
                        width: WIDTH_PAGINATION,
                        position: 'absolute',
                        top: screen.height / 4,
                        width: screen.width
                    }}
                    dotStyle={{
                        width: INACTIVE_DOT_WIDTH_HEIGHT,
                        height: INACTIVE_DOT_WIDTH_HEIGHT,
                        borderRadius: INACTIVE_DOT_WIDTH_HEIGHT / 2,
                        backgroundColor: Colors.COLOR_WHITE
                    }}
                    inactiveDotStyle={{
                        width: INACTIVE_DOT_WIDTH_HEIGHT,
                        height: INACTIVE_DOT_WIDTH_HEIGHT,
                        borderRadius: INACTIVE_DOT_WIDTH_HEIGHT / 2,
                        backgroundColor: Colors.COLOR_WHITE
                    }}
                    inactiveDotOpacity={0.3}
                    inactiveDotScale={0.6}
                />
                <Modal
                    onRequestClose={() => this.setState({ isModalOpened: false })}
                    visible={this.state.isModalOpened}
                    transparent={true}>
                    <ImageViewer
                        enableSwipeDown={true}
                        onCancel={() => {
                            this.setState({ isModalOpened: false })
                        }}
                        imageUrls={this.imageUrls}
                        index={indexZoom} />
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: Constants.MARGIN_XX_LARGE,
                            right: Constants.MARGIN_X_LARGE
                        }}
                        onPress={() => {
                            this.setState({ isModalOpened: false })
                        }}
                    >
                        <Image
                            style={{ resizeMode: 'contain' }}
                            source={ic_cancel_white} />
                    </TouchableOpacity>
                </Modal>
            </View>
        );
    }

    /**
     * Render Item Carousel
     * @param {*} param0 
     */
    renderItemCarousel({ item, index }) {
        return (
            <TouchableOpacity onPress={() => this.toggleModal(index)}>
                <ImageLoader isShowDefault={true}
                    resizeModeType={'cover'}
                    path={item.pathToResource}
                    resizeAtt={{ type: 'resize', width: screen.width + 150 }}
                    style={{ width: screen.width, height: screen.height / 3 }}
                />
            </TouchableOpacity>
        );
    }
}

export default SliderImage
