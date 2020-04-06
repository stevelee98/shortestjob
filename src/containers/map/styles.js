import React from "react-native";
import { Colors } from "values/colors";
import { Constants } from 'values/constants';
import commonStyles from "styles/commonStyles";
const { Dimensions, Platform } = React;
const { StyleSheet } = React;
const screen = Dimensions.get("window");

export default styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.COLOR_BACKGROUND,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  myLocationButton: {
    ...commonStyles.shadowOffset,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.COLOR_WHITE,
    marginBottom: Constants.MARGIN_LARGE,
    marginHorizontal: Constants.MARGIN,
    borderRadius: 25,
    width: 50,
    height: 50
  },
  loadingBar: {
    ...commonStyles.shadowOffset,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Constants.MARGIN_LARGE,
    backgroundColor: Colors.COLOR_WHITE,
    borderRadius: Constants.CORNER_RADIUS,
    marginHorizontal: Constants.MARGIN_X_LARGE,
    paddingHorizontal: Constants.PADDING_LARGE,
    height: 50
  },
  callOut: {
    ...commonStyles.shadowOffset,
    width: screen.width - Constants.MARGIN_XX_LARGE,
    backgroundColor: Colors.COLOR_WHITE,
    padding: Constants.PADDING_LARGE,
    marginBottom: Constants.MARGIN_LARGE,
    borderRadius: Constants.CORNER_RADIUS,
    borderWidth: Constants.BORDER_WIDTH,
    borderColor: Colors.COLOR_GREY,
  },
  titleCallout: {
    ...commonStyles.textBold,
  },
  desCallout: {
    ...commonStyles.text,
  },
  viewBottom: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'center'
  }
});