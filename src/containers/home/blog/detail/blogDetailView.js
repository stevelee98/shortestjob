import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, RefreshControl, Linking, WebView, BackHandler } from 'react-native';
import { Header, Content, Container, Right } from "native-base";
import BaseView from 'containers/base/baseView';
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import i18n, { localizes } from "locales/i18n";
import styles from './styles';
import DateUtil from "utils/dateUtil";
import HTML from 'react-native-render-html';
import _ from 'lodash';
import { IGNORED_TAGS } from 'react-native-render-html/src/HTMLUtils';
import Share from 'react-native-share';
import { ServerPath } from 'config/Server';
import Utils from 'utils/utils';
import { connect } from 'react-redux';
import * as actions from 'actions/blogActions';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import ImageLoader from 'components/imageLoader';
import { Fonts } from 'values/fonts';
import StringUtil from 'utils/stringUtil';
import AutoHeightImage from 'react-native-auto-height-image';

const screen = Dimensions.get('window');
const tags = _.without(IGNORED_TAGS,
  'table', 'caption', 'col', 'colgroup', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr'
)
const DEFAULT_PROPS = {
  htmlStyles: { paddingHorizontal: Constants.PADDING_XX_LARGE, marginHorizontal: Constants.MARGIN_XX_LARGE },
  // imagesMaxWidth: Dimensions.get('window').width - Constants.MARGIN_XX_LARGE,
  onLinkPress: (evt, href) => { Linking.openURL(href); }
};
const defaultRenderer = {
  renderers: {
      img: (htmlAttribs, children, convertedCSSStyles, passProps) => {
          let attr = htmlAttribs;
          if (htmlAttribs && htmlAttribs.style) {
              let style = htmlAttribs.style;
              var styleMap = style.split(";").reduce((a, c) => (d = c.split(":"), a[d[0].trim()] = String(d[1]).trim(), a), {});
              let valueWidth = screen.width - Constants.PADDING_XX_LARGE;
              let valueHeight = valueWidth * (9 / 16);
              if (styleMap.height != null) {
                  valueHeight = parseInt(styleMap.height.match(/\d+/)[ 0 ]);
              }
              if (styleMap.width != null) {
                  valueWidth = parseInt(styleMap.width.match(/\d+/)[ 0 ]);
              }
              const ratio = valueWidth / valueHeight;
              let width = screen.width - Constants.PADDING_XX_LARGE;
              let height = width / ratio;
              return (<Image style={[convertedCSSStyles, { width: valueWidth > screen.width - Constants.PADDING_XX_LARGE ? width : valueWidth / ratio, height: valueHeight }]} source={{ uri: attr.src }} />)
          } else {
              let width = screen.width - Constants.PADDING_XX_LARGE;
              return <AutoHeightImage
                  width={width}
                  source={{ uri: attr.src }
                  } />
          }
      }
  }
};
class BlogDetailView extends BaseView {

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false
    }
    const { id, dataItemBlog, } = this.props.navigation.state.params;
    this.id = id;
    this.dataItemBlog = dataItemBlog
    this.data = null
    this.handleRefresh = this.handleRefresh.bind(this)
  }

  componentWillMount() {
    super.componentWillMount()
    BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
    this.props.getDetailBlog(this.id)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
  }

  /**
   * Share blog
   */
  // onShareBlog = () => {
  //   let shareOptions = {
  //     title: "Share to social",
  //     message: "Testuru",
  //     url: ServerPath.URL_BLOG + this.urlBlogPost,
  //     subject: "Share Link" //  for email
  //   };
  //   Share.open(shareOptions);
  // }

  /**
     * On press link
     * @param {*} evt 
     * @param {*} href 
     * @param {*} htmlAttribs 
     */
  // onLinkPress(evt, href, htmlAttribs) {
  //   console.log(`Opened ${href} ! Attributes: ${JSON.stringify(htmlAttribs)}`);
  // }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.props = nextProps
      this.handleData()
    }
  }

  handleData() {
    let data = this.props.data
    if (data != null && this.props.errorCode != ErrorCode.ERROR_INIT) {
      if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
        this.setState({
          refreshing: false
        })
        if (this.props.action == getActionSuccess(ActionEvent.GET_BLOG_POST)) {
          this.setState({
            enableLoadMore: !(data.data.length < Constants.PAGE_SIZE)
          })
          if (data.data.length > 0) {
            this.listBlogPost.push(...data.data);
          }
          this.isLoadMore = true
          this.isRefresh = true
        } else {
          this.handleError(this.props.errorCode, this.props.error)
        }
      }
    }
  }

  /**
     * Render children
     * @param {*} node 
     * @param {*} index 
     * @param {*} parent 
     * @param {*} defaultRenderer 
     */
  renderChildren = (node, index, parent, defaultRenderer) => {
    if (node.name == "iframe" && node.attribs ) {
      node.attribs.width = Dimensions.get('window').width - Constants.MARGIN_X_LARGE
    }
  }

  render() {
    console.log('detail blog post')
    const htmlContent = this.dataItemBlog.content;
    // let urlItemBlog = ServerPath.URL_BLOG + this.urlBlogPost;
    return (
      <Container style={{ backgroundColor: Colors.COLOR_WHITE }}>
        <Header style={{ backgroundColor: Colors.COLOR_PRIMARY }}>
          {this.renderHeaderView({
            title: this.dataItemBlog.title,
            renderRightMenu: this.renderRightHeader,
            visibleStage: false,
            visibleBack: true
          })}
          <Right style={{ flex: 0 }}>
          </Right>
        </Header>

        <Content contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
            />
          }
        >
          <View
            style={{
              // padding: Constants.MARGIN_LARGE,
              paddingVertical: Constants.PADDING_X_LARGE,
              marginHorizontal: Constants.MARGIN_X_LARGE,
            }}
          >
            {/* title */}
            <View style={{ alignItems: 'flex-start', justifyContent: 'center', }}>
              {this.dataItemBlog ? <Text style={[commonStyles.textBold, { margin: 0 }]}>{this.dataItemBlog.title}</Text> : null}
            </View>

            {/* time */}
            <View style={[{
              alignItems: 'flex-start', 
              // height: Constants.PICKER_HEIGHT,
              // marginTop: Constants.PADDING_LARGE, 
            }]}>
              {this.dataItemBlog ? <Text style={[commonStyles.text, {
                fontSize: Fonts.FONT_SIZE_XX_SMALL,
                marginRight: 0, flex: 1,
                // paddingBottom: Constants.PADDING, 
                opacity: 0.5
              }]}>{DateUtil.convertFromFormatToFormat(
                this.dataItemBlog.createdAt, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE)}</Text> : null}
            </View>

            {/* content */}
            <View style={{
              marginBottom: Constants.MARGIN_LARGE,
              marginTop: Constants.MARGIN_X_LARGE,
              // marginHorizontal: 16,
              alignItems: 'center', justifyContent: 'center',
            }}>
            { htmlContent ? <HTML {...DEFAULT_PROPS} 
              ignoredTags={tags} 
              html={htmlContent}
              {...defaultRenderer}
              staticContentMaxWidth={screen.width -48}
              imagesInitialDimensions={{ width: 0, height: 0 }}
              renderChildren={this.renderChildren.bind(this)} />
              : null }
            </View>

          </View>
        </Content>

        {this.showLoadingBar(this.props.isLoading)}
      </Container>
    );
  }

  //onRefreshing
  handleRefresh = () => {
    // this.reportIssueTemp = []
    this.setState({
      refreshing: false,
    });
    this.props.getDetailBlog(this.id)
  };

}

const mapStateToProps = state => ({
  data: state.blogdetail.data,
  isLoading: state.blogdetail.isLoading,
  errorCode: state.blogdetail.errorCode,
  action: state.blogdetail.action
})

const mapDispatchToProps = {
  ...actions,
};

export default connect(mapStateToProps, mapDispatchToProps)(BlogDetailView);
