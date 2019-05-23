import { Dimensions, StyleSheet } from 'react-native';
/**
 项目常用的颜色
 **/
const Colors = Object.freeze({
  PRIMARY: '#F44336',
  SECONDARY: '#FF9800',
  WARNING: '#F44336',
  SCREEN_BACKGROUND: '#F1F2F7',
  SEPARATE_LINE: '#ECECEC',
  TEXT_BACKGROUND: '#F9F9F9',
});
/**
 文字常用颜色
 **/
const TextColors = Object.freeze({
  STRONG: '#333333',
  STANDARD: '#666666',
  MINOR: '#999999',
  LIGHT: '#CCCCCC',
  WHITE: '#FFFFFF',
  LINK: '#32b3f4',
});

const FontSize = Object.freeze({
  HUGE: 30,
  XXLARGE: 20,
  TITLE_BAR: 14,
  RESULT_TITLE: 17,
  XLARGE: 16,
  LARGE: 14,
  MEDIUM: 13,
  SMALL: 12,
  TIP: 11,
  TIP_SM: 8,
});

const Points = Object.freeze({
  UI_ELEM_MARGIN_TOP: 10, // UI元素顶部标准间距
});
/**
 适配不同大小的屏幕
 **/
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_WIDTH = (SCREEN_WIDTH - 8) / 4;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCALE = SCREEN_WIDTH / 375;

const createStyles = (styles, rawStyles, config ={ scale: undefined}) => {
    Object.values(styles).forEach(style => {
      [
        'left',
        'top',
        'right',
        'bottom',
        'width',
        'height',
        'padding',
        'paddingLeft',
        'paddingTop',
        'paddingBottom',
        'paddingRight',
        'margin',
        'marginTop',
        'marginBottom',
        'marginRight',
        'marginLeft',
        'borderWidth',
        'borderLeftWidth',
        'borderRightWidth',
        'borderTopWidth',
        'borderBottomWidth',
        'fontSize',
        'maxHeight',
        'minHeight',
        'lineHeight',
        'borderRadius',
        'borderBottomLeftRadius',
        'borderBottomRightRadius',
        'borderTopLeftRadius',
        'borderTopRightRadius',
      ].forEach(property => {
        if (!style[property]) return

        if (style[property] > 1) {
          style[property] = style[property] * (config.scale || SCALE)
        }
      })
    })
  return StyleSheet.create(Object.assign(styles, rawStyles))
}

const commonStyles = createStyles({
  flex1: {
    flex: 1,
  },
  // UI元素顶部标准间距
  uiElemMarginTop: {
    marginTop: Points.UI_ELEM_MARGIN_TOP,
  },
})

export {
  createStyles,
  SCREEN_WIDTH,
  GRID_WIDTH,
  SCREEN_HEIGHT,
  commonStyles,
  SCALE,
  Colors,
  TextColors,
  FontSize,
  Points,
}
