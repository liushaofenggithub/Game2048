import React, { Component } from 'react';
import {StyleSheet, Animated, Dimensions, Text } from 'react-native'
import {getNumBgColor, getNumColor, getPosition} from "../utils/support";

const gridWidth = (Dimensions.get('window').width - 88) / 4

export default class AnimatedView extends Component {
  constructor(props){
    super(props)
    this.state = {
      left: new Animated.Value(props.style.left),
      top: new Animated.Value(props.style.top),
      width: new Animated.Value(props.style.width),
      height: new Animated.Value(props.style.width)
    }
  }

  /* 生成新的数字或数字叠加之后格子自身的动画 */
  startBoxAnimate = (x, y) => {
    const position = getPosition(x, y, gridWidth)
    const { left, top, width, height } = this.state
    Animated.sequence([
      Animated.parallel([
        Animated.timing(left,{
          toValue: position.left + gridWidth / 2,
          duration: 0,
        }),
        Animated.timing(top,{
          toValue: position.top + gridWidth / 2,
          duration: 0,
        }),
        Animated.timing(width,{
          toValue: 0,
          duration: 0,
        }),
        Animated.timing(height,{
          toValue: 0,
          duration: 0,
        }),
      ]),
      Animated.parallel([
        Animated.timing(width,{
          toValue: gridWidth,
          duration: 30,
        }),
        Animated.timing(height,{
          toValue: gridWidth,
          duration: 30,
        }),
        Animated.timing(left,{
          toValue: position.left,
          duration: 30,
        }),
        Animated.timing(top,{
          toValue: position.top,
          duration: 30,
        })
      ])
    ]).start()
  }

  /* 格子的移动动画 */
  startMoveAnimate = (toX, toY) => {
    const position = getPosition(toX, toY, gridWidth)
    Animated.parallel([
      Animated.timing(this.state.left,{
        toValue: position.left,
        duration: 150,
      }),
      Animated.timing(this.state.top,{
        toValue: position.top,
        duration: 150,
      }),
    ]).start()
  }

  render() {
    const { value } = this.props
    const { left, top, width, height } = this.state
    return (
      <Animated.View
        style={[styles.grid, {
          left,
          top,
          width,
          height,
          backgroundColor:  value > 0 ? getNumBgColor(value) : '#ccc0b3',
        }]}
      >
        <Text
          style={[styles.text, {
            color: getNumColor(value),
            fontSize: value < 1024 ? 0.6 * gridWidth : 0.4 * gridWidth,
          }]}
        >
            {value}
          </Text>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  grid: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
  }
})
