import React, { Component } from 'react';
import {View, Button } from 'react-native'
import AnimatedView from './components/AnimatedView'

export default class Test extends Component {

  state = {
    start: false,
  }

  showAnimate = ()=> {
    this.setState({
      start: true
    })
  }

  getEle = () => {
    const { start } = this.state
    let ele = []
    for(let i = 1; i < 3; i++) {
      for(let j = 1; j < 3; j++) {
        ele.push(
          <AnimatedView
            key={`val-cell-${i}-${j}`}
            value={2}
            style={{
              width: 50,
              height: 50,
              left: start ? j * 200 : j * 10,
              top: start? i * 200: i * 10,
              backgroundColor: 'powderblue'
            }}
          />
        )
      }
    }
    return ele

  }

  render() {
    return (
      <View>
        {this.getEle()}
        <Button
          title='开始动画'
          onPress={this.showAnimate}
        />
      </View>
    )
  }
}
