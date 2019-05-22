import React, { Component } from 'react';
import { View, TouchableHighlight, Text, PanResponder, StyleSheet, Dimensions, Platform, Alert, Linking } from 'react-native';
import Sound from 'react-native-sound';
import { Storage } from './utils/index'
import AnimatedView from './components/AnimatedView';
import { noSpace, canMoveLeft, canMoveRight, canMoveUp, canMoveDown, noBlockHorizontal, noBlockVertical, isGameOver } from "./utils/support";
import _updateConfig from '../update.json';
import {
  isFirstTime,
  isRolledBack,
  packageVersion,
  currentVersion,
  checkUpdate,
  downloadUpdate,
  switchVersion,
  switchVersionLater,
  markSuccess,
} from 'react-native-update';

const { appKey } = _updateConfig[Platform.OS];
const move = require('./sounds/move.mp3')
const merge = require('./sounds/merge.mp3')
const SCREEN_WIDTH = Dimensions.get('window').width
const gridWidth = (SCREEN_WIDTH - 88) / 4

export default class Main extends Component {

  state = {
    score: 0,
    highScore: 0,
    board: [],
    hasConflicted: []
  }

  /* 获取最高分 */
  getHighScore = async ()=> {
    const highScore = await Storage.get('highScore')
    highScore && this.setState({highScore})
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

  updateBoardView = (score, board, hasConflicted, hasMerged) => {
    const { highScore } = this.state
    const boardNow = board
    setTimeout(() => {
      if (hasMerged) {
        const s = new Sound(move, (e) => {
          alert(JSON.stringify(e))
          if(e) {
            return;
          }
          s.play()
        })
      } else {
        const s = new Sound(merge, (e) => {
          alert(JSON.stringify(e))
          if(e) {
            return;
          }
          s.play()
        })
      }

      if (score > highScore) {
        Storage.set('highScore', `${score}`)
        this.setState({
          score,
          highScore: score,
          board: boardNow,
          hasConflicted
        }, () => {
          this.generateOneNumber()
        })
      } else {
        this.setState({
          score,
          board: boardNow,
          hasConflicted
        }, () => {
          this.generateOneNumber()
        })
      }

    }, 150)
  }

  moveLeft = () => {
    let { score, board, hasConflicted } = this.state
    let hasMerged = false
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
              hasMerged = true
            }
          }
        }

      }
    }
    this.updateBoardView(score, board, hasConflicted, hasMerged)
  }

  moveRight = () => {
    let { score, board, hasConflicted } = this.state
    let hasMerged = false
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
              hasMerged = true
            }
          }
        }
      }
    }
    this.updateBoardView(score, board, hasConflicted, hasMerged)
  }

  moveUp = () => {
    let { score, board, hasConflicted } = this.state
    let hasMerged = false
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
              hasMerged = true
            }
          }
        }
      }
    }
    this.updateBoardView(score, board, hasConflicted, hasMerged)
  }

  moveDown = () => {
    let { score, board, hasConflicted } = this.state
    let hasMerged = false
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
              hasMerged = true
            }
          }
        }
      }
    }
    this.updateBoardView(score, board, hasConflicted, hasMerged)
  }

  doUpdate = info => {
    downloadUpdate(info).then(hash => {
      Alert.alert('提示', '下载完毕,是否重启应用?', [
        {text: '是', onPress: ()=>{switchVersion(hash);}},
        {text: '否',},
        {text: '下次启动时', onPress: ()=>{switchVersionLater(hash);}},
      ]);
    }).catch(err => {
      Alert.alert('提示', '更新失败.');
    });
  }
  checkUpdate = () => {
    if (isFirstTime) {
      markSuccess()
    } else if (isRolledBack) {
      Alert.alert('提示', '刚刚更新失败了,版本被回滚.');
    }
    checkUpdate(appKey).then(info => {
      if (info.expired) {
        Alert.alert('提示', '您的应用版本已更新,请前往应用商店下载新的版本', [
          {text: '确定', onPress: ()=>{info.downloadUrl && Linking.openURL(info.downloadUrl)}},
        ]);
      } else if (info.upToDate) {
        // Alert.alert('提示', '您的应用版本已是最新.');
      } else {
        Alert.alert('提示', '检查到新的版本'+info.name+',是否下载?\n'+ info.description, [
          {text: '是', onPress: ()=>{this.doUpdate(info)}},
          {text: '否',},
        ]);
      }
    }).catch(err => {
      Alert.alert('提示', '更新失败.');
    });
  };

  /* 添加手势响应、 热更新 */
  componentWillMount() {
    this.checkUpdate()
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
        } else if(abX < abY && dy > 0) {
          this.moveDown()
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {},
      onShouldBlockNativeResponder: (evt, gestureState) => true,
    })
  }

  render() {
    const { score, highScore } = this.state
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.left}>
            <Text style={styles.title}>2048</Text>
          </View>
          <View style={styles.right}>
            <View style={styles.score}>
              <Text style={styles.scoreText}>最高分: {highScore}</Text>
            </View>
            <View style={styles.score}>
              <Text style={styles.scoreText}>分数: {score}</Text>
            </View>
          </View>
        </View>
        <View style={styles.newGame}>
          <TouchableHighlight
            underlayColor='#9f8b77'
            onPress={this.newGame}
            style={styles.btn}
          >
            <Text
              style={styles.btnText}
            >
              New Game
            </Text>
          </TouchableHighlight>
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
    this.getHighScore()
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
    flexDirection: 'row',
    padding: 10,
    paddingTop: 40,
    flex: 1,
  },
  left: {
    width: 200,
    height: 150,
    borderRadius: 20,
    backgroundColor: '#EEC918',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 80,
    color: '#FFFFFF'
  },
  right: {
    flexDirection: 'column',
    flex: 1,
    height: 150,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  score: {
    width: 180,
    height: 65,
    backgroundColor: '#B9ADA0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Arial',
    fontSize: 24
  },

  /* 开始游戏按钮样式 */
  newGame: {
    height: 100,
    alignItems: 'center',
    paddingTop: 10
  },
  btn: {
    width: 180,
    height: 65,
    backgroundColor: '#FF9A42',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 30,
    color: '#FFFFFF'
  },

  /* content部分样式 */
  content: {
    padding: 4,
    paddingBottom: 20
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
