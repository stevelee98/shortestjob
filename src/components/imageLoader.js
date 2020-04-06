import React, { Component } from "react";
import { View, Image } from 'react-native';
import PropTypes from 'prop-types';
import FastImage from 'react-native-fast-image';
import { ServerPath } from 'config/Server';
import ic_default_user from 'images/ic_default_user.png';
import Utils from "utils/utils";
import BaseView from "containers/base/baseView";
import StorageUtil from "utils/storageUtil";

export default class ImageLoader extends Component {

    constructor(props) {
        super(props);
        this.state = {
            _path: null,
            errorImage: null,
            loaded: false
        }
        this.path = require('../images/ic_default_user.png')
    }

    /**
     * On loadStart
     */
    onLoadStart() { }

    /**
     * On load image finish 
     */
    onLoadEnd() {
        this.setState({ loaded: true })
    }

    componentDidMount() {
        this.handlePath()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handlePath()
        }
    }

    //handle path
    handlePath() {
        const { path, resizeAtt } = this.props
        if (this.path != path) {
            this.path = path
            this.state._path = path

            if (this.path === "" || this.path === null) {
                this.state._path = this.state.errorImage
            } else {
                var returnPath = this.path.indexOf('http') !== -1 ? this.path : "" + this.path
                this.state._path = returnPath
                if (!Utils.isNull(resizeAtt)) {
                    if (!Utils.isNull(resizeAtt.type)) {
                        this.state._path += `&op=${resizeAtt.type}`
                    }
                    if (!Utils.isNull(resizeAtt.width) && resizeAtt.width != '100%') {
                        this.state._path += `&w=${parseInt(resizeAtt.width) + 150}`
                    }
                    if (!Utils.isNull(resizeAtt.height) && resizeAtt.height != '100%') {
                        this.state._path += `&h=${parseInt(resizeAtt.height) + 150}`
                    }
                }
            }
        }
    }

    //return resizeMode 
    returnResizeMode = (_id) => {
        var result = FastImage.resizeMode.contain;
        var id = _id.replace(/ /g, '');
        if (id === 'contain') {
            result = FastImage.resizeMode.contain
        } else if (id === 'cover') {
            result = FastImage.resizeMode.cover
        } else if (id === 'stretch') {
            result = FastImage.resizeMode.stretch
        } else {
            result = FastImage.resizeMode.center
        }
        return result;
    }

    render = () => {
        var { path, width, resizeModeType, height, style, isShowDefault } = this.props;
        return (
            <View>
                {
                    !this.state.loaded &&
                    <Image style={style} source={ic_default_user}></Image>
                }
                <FastImage
                    style={[style, this.state.loaded ? {} : { width: 0, height: 0 }]}
                    source={
                        !Utils.isNull(this.state._path)
                            ? {
                                uri: this.state._path,
                                priority: FastImage.priority.high,
                                cache: FastImage.priority.immutable
                            }
                            : ic_default_user
                    }
                    resizeMode={this.returnResizeMode(resizeModeType)}
                    onError={() => {
                        this.setState({
                            _path: this.state.errorImage
                        })
                    }}
                    onLoadStart={this.onLoadStart.bind(this)}
                    onLoadEnd={this.onLoadEnd.bind(this)}
                />
            </View>
        )
    }
}