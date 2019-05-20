import React, { Component } from 'react';
import { View, TouchableHighlight, Text, PanResponder, StyleSheet, Dimensions } from 'react-native';
import AnimatedView from './components/AnimatedView';
import { noSpace, canMoveLeft, canMoveRight, canMoveUp, canMoveDown, noBlockHorizontal, noBlockVertical, isGameOver } from "./support";

const SCREEN_WIDTH = Dimensions.get('window').width
const gridWidth = (SCREEN_WIDTH - 88) / 4

export default class Main extends Component {

  state = {
    score: 0,
    board: [],
    hasConflicted: []
  }

  /* 生成背景格 */
  setBgGrid = ()=> {
    let bgGridEle = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j< 4; j++) {
        bgGridEle.push(
          <View
            key={`bg-cell-${i}-${j}`}
            style={[styles.bgGridEle, {
              left: 16 + j * (gridWidth + 16),
              top: 16 + i * (gridWidth + 16)
            }]}
          />
        )
      }
    }
    return bgGridEle
  }

  /* 生成有数字的格 */
  setValGrid = ()=> {
    const { board, hasConflicted } = this.state
    if (board.length === 0) return
    return board.map((item, i) => {
      return item.map((innerItem, j) => {
        hasConflicted[i][j] = false
        return <AnimatedView
                  key={`val-cell-${i}-${j}`}
                  ref={`val-cell-${i}-${j}`}
                  value={innerItem}
                  style={{
                    left: 16 + j * (gridWidth + 16),
                    top: 16 + i * (gridWidth + 16),
                    width: innerItem > 0 ? gridWidth : 0,
                    height: innerItem > 0 ? gridWidth : 0
                  }}
                />
            })
    })
  }

  /* 初始化每个格子的数字为0，将总得分置为0 */
  init = ()=> {
    const { board, hasConflicted } = this.state
    for (let i = 0; i < 4; i++) {
      board[i] = []
      hasConflicted[i] = []
      for (let j = 0; j < 4; j++) {
        board[i][j] = 0
        hasConflicted[i][j] = false
      }
    }
    this.setState({
      score: 0,
      board: board,
      hasConflicted
    })
  }

  /* 在一个随机位置随机生成一个数字（2或4）*/
  generateOneNumber = () => {
    const { board } = this.state
    if (noSpace(board)) return
    /* 随机生成一个位置 */
    let randX = Math.floor(Math.random() * 4)
    let randY = Math.floor(Math.random() * 4)
    let times = 0
    while(times < 50) {
      if (board[randX][randY] === 0) {
        break
      }
      randX = Math.floor(Math.random() * 4)
      randY = Math.floor(Math.random() * 4)
      times++
    }
    if (times === 50) {
      for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
          if (board[i][j] === 0) {
            randX = i
            randY = j
          }
        }
      }
    }
    /* 随机生成一个数字 */
    const randNum = Math.random() < 0.5 ? 2 : 4
    board[randX][randY] = randNum
    this.setState({
      board: []
    }, () => {
      this.setState({
        board
      }, () => {
        const valCell = this.refs[`val-cell-${randX}-${randY}`]
        valCell.startBoxAnimate(randX, randY)
        isGameOver(board)
      })
    })
  }

  newGame = ()=> {
    this.init();
    this.generateOneNumber()
    this.generateOneNumber()
  }

  showMoveAnimation = (fromX, fromY, toX, toY) => {
    const valCell = this.refs[`val-cell-${fromX}-${fromY}`]
    valCell.startMoveAnimate(toX, toY)
  }

  updateBoardView = (score, board, hasConflicted) => {
    const boardNow = board
    setTimeout(() => {
      this.setState({
        score,
        board: boardNow,
        hasConflicted
      }, () => {
        this.generateOneNumber()
      })
    }, 150)
  }

  moveLeft = () => {
    let { score, board, hasConflicted } = this.state
    if (!canMoveLeft(board)) return
    for (let i = 0; i < 4; i++) {
      for (let j = 1; j < 4; j++) {
        if (board[i][j] !== 0) {
          for (let k = 0; k < j; k++) {
            if (board[i][j] !== 0 && board[i][k] === 0 && noBlockHorizontal(i, k, j, board)) {
              this.showMoveAnimation(i, j, i, k)
              board[i][k] = board[i][j]
              board[i][j] = 0
            } else if (board[i][j] !== 0 && board[i][k] === board[i][j] && noBlockHorizontal(i, k, j, board) && !hasConflicted[i][k]) {
              this.showMoveAnimation(i, j, i, k)
              board[i][k] += board[i][j]
              board[i][j] = 0
              score += board[i][k]
              hasConflicted[i][k] = true
            }
          }
        }

      }
    }
    this.updateBoardView(score, board, hasConflicted)
  }

  moveRight = () => {
    let { score, board, hasConflicted } = this.state
    if (!canMoveRight(board)) return
    for (let i = 0; i < 4; i++) {
      for (let j = 2; j >= 0; j--) {
        if (board[i][j] !== 0) {
          for (let k = 3; k > j; k--) {
            if (board[i][j] !== 0 && board[i][k] === 0 && noBlockHorizontal(i, j, k, board)) {
              this.showMoveAnimation(i, j, i, k)
              board[i][k] = board[i][j]
              board[i][j] = 0
            } else if (board[i][j] !== 0 && board[i][k] === board[i][j] && noBlockHorizontal(i, j, k, board) && !hasConflicted[i][k]) {
              this.showMoveAnimation(i, j, i, k)
              board[i][k] += board[i][j]
              board[i][j] = 0
              score += board[i][k]
              hasConflicted[i][k] = true
            }
          }
        }
      }
    }
    this.updateBoardView(score, board, hasConflicted)
  }

  moveUp = () => {
    let { score, board, hasConflicted } = this.state
    if (!canMoveUp(board)) return
    for (let i = 1; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] !== 0) {
          for (let k = 0; k < i; k++) {
            if (board[i][j] !== 0 && board[k][j] === 0 && noBlockVertical(j, k, i, board)) {
              this.showMoveAnimation(i, j, k, j)
              board[k][j] = board[i][j]
              board[i][j] = 0
            } else if (board[i][j] !== 0 && board[k][j] === board[i][j] && noBlockVertical(j, k, i, board) && !hasConflicted[k][j]) {
              this.showMoveAnimation(i, j, k, j)
              board[k][j] += board[i][j]
              board[i][j] = 0
              score += board[k][j]
              hasConflicted[k][j] = true
            }
          }
        }
      }
    }
    this.updateBoardView(score, board, hasConflicted)
  }

  moveDown = () => {
    let { score, board, hasConflicted } = this.state
    if (!canMoveDown(board)) return
    for (let i = 2; i >= 0; i--) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] !== 0) {
          for (let k = 3; k > i; k--) {
            if (board[i][j] !== 0 && board[k][j] === 0 && noBlockVertical(j, i, k, board)) {
              this.showMoveAnimation(i, j, k, j)
              board[k][j] = board[i][j]
              board[i][j] = 0
            } else if (board[i][j] !== 0 && board[k][j] === board[i][j] && noBlockVertical(j, i, k, board) && !hasConflicted[k][j]) {
              this.showMoveAnimation(i, j, k, j)
              board[k][j] += board[i][j]
              board[i][j] = 0
              score += board[k][j]
              hasConflicted[k][j] = true
            }
          }
        }
      }
    }
    this.updateBoardView(score, board, hasConflicted)
  }

  /* 添加手势响应 */
  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {},
      onPanResponderMove: (evt, gestureState) => {},
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState
        const abX = Math.abs(dx)
        const abY = Math.abs(dy)
        if (abX > abY && dx < 0) {
          this.moveLeft()
        } else if (abX > abY && dx > 0) {
          this.moveRight()
        } else if (abX < abY && dy < 0) {
          this.moveUp()
        } else {
          this.moveDown()
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {},
      onShouldBlockNativeResponder: (evt, gestureState) => true,
    })
  }

  render() {
    const { score } = this.state
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>2048</Text>
          <TouchableHighlight
            underlayColor='#9f8b77'
            onPress={this.newGame}
            style={styles.newGame}
          >
            <Text
              style={styles.newGameText}
            >
              New Game
            </Text>
          </TouchableHighlight>
          <Text style={styles.score}>score: {score}</Text>
        </View>
        <View {...this._panResponder.panHandlers} style={styles.content}>
          <View style={styles.panel} ref='container'>
            {this.setBgGrid()}
            {this.setValGrid()}
          </View>
        </View>
      </View>

    )
  }

  componentDidMount() {
    this.newGame()
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFCEF'
  },
  /* header部分样式 */
  header: {
    paddingTop: 30,
    alignItems: 'center'
  },
  title: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 60,
  },
  newGame: {
    width: 120,
    height: 50,
    backgroundColor: '#8f7a66',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 30
  },
  newGameText: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 20,
    color: '#FFFFFF'
  },
  score: {
    fontFamily: 'Arial',
    fontSize: 25
  },
  /* content部分样式 */
  content: {
    padding: 4,
    marginTop: 50
  },
  panel: {
    position: 'relative',
    height: SCREEN_WIDTH - 8,
    backgroundColor: '#bbada0',
    borderRadius: 5,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  /* 背景格样式 */
  bgGridEle: {
    position: 'absolute',
    width: gridWidth,
    height: gridWidth,
    backgroundColor: '#ccc0b3',
    borderRadius: 6
  }
})
