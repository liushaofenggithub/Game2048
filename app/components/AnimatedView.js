import React, { Component } from 'react';
import {StyleSheet, Animated, Text } from 'react-native';
import {getNumBgColor, getNumColor, getPosition} from "../utils/support";
import { GRID_WIDTH } from '../theme'

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
    const position = getPosition(x, y, GRID_WIDTH)
    const { left, top, width, height } = this.state
    Animated.sequence([
      Animated.parallel([
        Animated.timing(left,{
          toValue: position.left + GRID_WIDTH / 2,
          duration: 0,
        }),
        Animated.timing(top,{
          toValue: position.top + GRID_WIDTH / 2,
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
          toValue: GRID_WIDTH,
          duration: 50,
        }),
        Animated.timing(height,{
          toValue: GRID_WIDTH,
          duration: 50,
        }),
        Animated.timing(left,{
          toValue: position.left,
          duration: 50,
        }),
        Animated.timing(top,{
          toValue: position.top,
          duration: 50,
        })
      ])
    ]).start()
  }

  /* 格子的移动动画 */
  startMoveAnimate = (toX, toY) => {
    const position = getPosition(toX, toY, GRID_WIDTH)
    Animated.parallel([
      Animated.timing(this.state.left,{
        toValue: position.left,
        duration: 80,
      }),
      Animated.timing(this.state.top,{
        toValue: position.top,
        duration: 80,
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
            fontSize: value < 1024 ? 0.5 * GRID_WIDTH : 0.4 * GRID_WIDTH,
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
    borderRadius: 6,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
  }
})
