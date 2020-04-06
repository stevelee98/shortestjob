import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import ImageLoader from 'components/imageLoader';
import Utils from 'utils/utils';
import { Constants } from 'values/constants';
import { Colors } from 'values/colors';
import ic_history_white from "images/ic_history_white.png";
import styles from './styles';
import commonStyles from 'styles/commonStyles';

const SIZE_IMAGE = 32
const LINE_TITLE = 1

class ItemSearchSelling extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { data, item, index, resource, inputSearch, onPressItem } = this.props
        let image = ""
        if (!Utils.isNull(item.resourcePaths)) {
            image = !Utils.isNull(item.resourcePaths[0]) && item.resourcePaths[0].path.indexOf('http') != -1
                ? item.resourcePaths[0].path : resource + "=" + item.resourcePaths[0].path
        }
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                style={{ backgroundColor: Colors.COLOR_WHITE }}
                onPress={onPressItem}>
                <View style={[styles.item, {
                    borderBottomWidth: index == data.length - 1 ? 0 : Constants.BORDER_WIDTH,
                    borderBottomColor: Colors.COLOR_BACKGROUND
                }]}>
                    {!Utils.isNull(inputSearch)
                        ? !Utils.isNull(item.resourcePaths)
                            ? <ImageLoader
                                resizeModeType={'cover'}
                                path={image}
                                style={{ width: SIZE_IMAGE, height: SIZE_IMAGE, marginRight: Constants.MARGIN_X_LARGE }} />
                            : null
                        : null
                    }
                    <Text numberOfLines={LINE_TITLE} ellipsizeMode={"tail"}
                        style={[commonStyles.text, {
                            flex: 1,
                            color: Colors.COLOR_TEXT
                        }]}>{item.name}
                    </Text>
                    {Utils.isNull(inputSearch)
                        ? <Image source={ic_history_white} />
                        : null
                    }
                </View>
            </TouchableOpacity>
        );
    }
}

export default ItemSearchSelling;
