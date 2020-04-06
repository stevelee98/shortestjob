import React, { Component } from 'react';
import { View, Text, WebView, Dimensions } from 'react-native';
import BaseView from 'containers/base/baseView';
import { Container, Root, Content } from 'native-base';
import styles from './styles';
import { Constants } from 'values/constants';

const screen = Dimensions.get("window");

export default class TabFacebookView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            urlWeb: 'http://chophuquoc.boot.vn/post/view/Test-11-%E1%BA%A3nh-2303pcB'
        };
        this.html = `
        <html>
<body>




<div class="fb-comments" data-href="https://news.zing.vn/benh-nhan-thu-50-khien-hang-chuc-can-bo-vietnam-airlines-phai-cach-ly-post1060405.html" data-width="" data-numposts="5">

<iframe  src="https://www.facebook.com/v6.0/plugins/comments.php?app_id=2730392903692937&amp;channel=https%3A%2F%2Fstaticxx.facebook.com%2Fconnect%2Fxd_arbiter.php%3Fversion%3D46%23cb%3Df2160749e03958%26domain%3D%26origin%3Dfile%253A%252F%252F%252Ffebba0ca40822%26relation%3Dparent.parent&amp;container_width=1424&amp;height=100&amp;href=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2Fcomments%23configurator&amp;locale=vi_VN&amp;numposts=5&amp;sdk=joey&amp;version=v6.0&amp;width=550" style="border: none; visibility: visible; width: 550px; height: 1000px;" class=""></iframe>

</div>



<div id="fb-root"></div>
<script async defer crossorigin="anonymous" src="https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v6.0&appId=2730392903692937&autoLogAppEvents=1"></script>

</body>
</html>
`

        this.html1 = `
        <html>
<body>
<h1>GGGGGGGG</h1>

</body>
</html>
`
    }

    render() {
        return (
            // <View style={{ height: 700 }}>
            <WebView
                // automaticallyAdjustContentInsets={false}
                // scrollEnabled={false}
                // ref={r => this.webview = r}
                // onNavigationStateChange={this.onNavigationStateChange.bind(this)}
                // javaScriptEnabled={true}
                // injectedJavaScript={webViewScript}
                // domStorageEnabled={true}
                // onMessage={event => {
                // this.setState({ webheight: parseInt(event.nativeEvent.data) });
                // }}
                // onNavigationStateChange={this.handleNavigationStateChange.bind(this)}
                // onLoadEnd={e => {
                //     this.state.urlWeb = e.nativeEvent.url;
                //     if (this.state.urlWeb.startsWith(`https://m.facebook.com/plugins/close_popup.php`)) {
                //         this.state.urlWeb = 'http://chophuquoc.boot.vn/post/view/Test-11-%E1%BA%A3nh-2303pcB'
                //         // this.setState({
                //         //     hasInjectedVariable: true
                //         // })
                //     }
                //     console.log("end", e)
                // }}
                source={{ uri: 'http://chophuquoc.boot.vn/post/view/Test-11-%E1%BA%A3nh-2303pcB' }}

            // source={{ html: this.html1 }}
            />
            // </View>
        );
    }
}
