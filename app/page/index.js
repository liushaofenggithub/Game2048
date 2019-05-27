import React, { Component } from 'react';
import { View, TouchableHighlight, Text, PanResponder, Alert } from 'react-native';
import Sound from 'react-native-sound';
import AnimatedView from '../components/AnimatedView';
import {
  getMaxNum,
  noSpace,
  noMove,
  canMoveLeft,
  canMoveRight,
  canMoveUp,
  canMoveDown,
  noBlockHorizontal,
  noBlockVertical,
  getGridText
} from "../utils/support";
import { Storage } from '../utils/index';
import { createStyles, SCREEN_WIDTH, GRID_WIDTH } from "../theme/index";

const move = require('../sounds/move.mp3')
const merge = require('../sounds/merge.mp3')

export default class Main extends Component {

  state = {
    score: 0,
    highScore: 0,
    highMilitaryRank: 0,
    highEducation: 0,
    board: [],
    hasConflicted: []
  }

  /* 获取最高分 */
  getHighScore = async ()=> {
    const { mode } = this.props
    if (mode === 0) {
      const highScore = await Storage.get('highScore')
      highScore && this.setState({highScore})
    } else if (mode === 1) {
      const highMilitaryRank = await Storage.get('highMilitaryRank')
      highMilitaryRank && this.setState({highMilitaryRank})
    } else {
      const highEducation = await Storage.get('highEducation')
      highEducation && this.setState({highEducation})
    }


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
              left: 16 + j * (GRID_WIDTH + 16),
              top: 16 + i * (GRID_WIDTH + 16)
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
    const { mode } = this.props
    if (board.length === 0) return
    return board.map((item, i) => {
      return item.map((innerItem, j) => {
        hasConflicted[i][j] = false
        return <AnimatedView
                  key={`val-cell-${i}-${j}`}
                  ref={`val-cell-${i}-${j}`}
                  mode={mode}
                  value={innerItem}
                  style={{
                    left: 16 + j * (GRID_WIDTH + 16),
                    top: 16 + i * (GRID_WIDTH + 16),
                    width: innerItem > 0 ? GRID_WIDTH : 0,
                    height: innerItem > 0 ? GRID_WIDTH : 0
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
        if (noSpace(board) && noMove(board)) {
          Alert.alert('游戏结束', '是否重新开始?', [
            {text: '是', onPress: ()=>{this.newGame()}},
            {text: '否',}
          ])
        }
      })
    })
  }

  newGame = ()=> {
    this.init();
    this.generateOneNumber()
    this.generateOneNumber()
    this.getHighScore()
  }

  showMoveAnimation = (fromX, fromY, toX, toY) => {
    const valCell = this.refs[`val-cell-${fromX}-${fromY}`]
    valCell.startMoveAnimate(toX, toY)
  }

  updateBoardView = (score, board, hasConflicted, hasMerged) => {
    const { highScore, highMilitaryRank, highEducation } = this.state
    const { mode } = this.props
    const boardNow = board
    setTimeout(() => {
      if (hasMerged) {
        const s = new Sound(move, (e) => {
          if(e) {
            return;
          }
          s.play()
        })
      } else {
        const s = new Sound(merge, (e) => {
          if(e) {
            return;
          }
          s.play()
        })
      }

      const maxNum = getMaxNum(board)

      if (mode === 0 && score > highScore) {
        Storage.set('highScore', `${score}`)
        this.setState({
          score,
          highScore: score,
          board: boardNow,
          hasConflicted
        }, () => {
          this.generateOneNumber()
        })
      } else if (mode === 1 && maxNum > highMilitaryRank) {
        Storage.set('highMilitaryRank', `${maxNum}`)
        this.setState({
          score,
          highMilitaryRank: maxNum,
          board: boardNow,
          hasConflicted
        }, () => {
          this.generateOneNumber()
        })
      } else if (mode === 2 && maxNum > highEducation) {
        Storage.set('highEducation', `${maxNum}`)
        this.setState({
          score,
          highEducation: maxNum,
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

    }, 85)
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.modeChanged) {
      this.newGame()
    }
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
        } else if(abX < abY && dy > 0) {
          this.moveDown()
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {},
      onShouldBlockNativeResponder: (evt, gestureState) => true,
    })
  }

  render() {
    const { board, score, highScore, highMilitaryRank, highEducation } = this.state
    const { mode, toggleModeShow } = this.props
    const maxNum = getMaxNum(board)
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.left}>
            <Text style={styles.title}>2048</Text>
            <Text style={[styles.title, styles.modeText]}>
              {
                mode === 0 ? '经典模式' : mode === 1 ? '军旅模式' : '升学模式'
              }
            </Text>
          </View>
          <View style={styles.right}>
            <View style={styles.score}>
              <Text style={styles.scoreText}>
                {
                  mode === 0 ? '最高得分' : mode === 1 ? '最高职位' : '最高学历'
                }
              </Text>
              <Text style={styles.scoreText}>
                {
                  mode === 0 ? getGridText(highScore, mode) : mode === 1 ? getGridText(highMilitaryRank, mode) : getGridText(highEducation, mode)
                }
              </Text>
            </View>
            <View style={[styles.score, styles.bottomScore]}>
              <Text style={styles.scoreText}>
                {
                  mode === 0 ? '当前得分' : mode === 1 ? '当前职位' : '当前学历'
                }
              </Text>
              <Text style={styles.scoreText}>
                {
                  mode === 0 ? getGridText(score, mode) : getGridText(maxNum, mode)
                }
               </Text>
            </View>
          </View>
        </View>
        <View style={styles.btnContainer}>
          <TouchableHighlight
            underlayColor='#9f8b77'
            onPress={() => {toggleModeShow()}}
            style={styles.menu}
          >
            <Text
              style={styles.newGameText}
            >
              菜单
            </Text>
          </TouchableHighlight>
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

const styles = createStyles({
  container: {
    flex: 1,
    backgroundColor: '#FEFCEF'
  },
  /* header部分样式 */
  header: {
    flexDirection: 'row',
    padding: 10,
    flex: 1,
  },
  left: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#EEC918',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 60,
    color: '#FFFFFF'
  },
  modeText: {
    fontSize: 20,
    marginTop: 10
  },
  right: {
    padding: 5,
    flexDirection: 'column',
    flex: 1
  },
  score: {
    flex: 1,
    backgroundColor: '#B9ADA0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomScore: {
    marginTop: 15,
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Arial',
    fontSize: 15
  },
  /* 开始游戏按钮样式 */
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },
  menu: {
    width: 100,
    height: 60,
    marginRight: 20,
    backgroundColor: '#FF9A42',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newGame: {
    flex: 1,
    backgroundColor: '#FF9A42',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  newGameText: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 30,
    color: '#FFFFFF'
  }
},
  /* content部分样式 */
 {
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
    width: GRID_WIDTH,
    height: GRID_WIDTH,
    backgroundColor: '#ccc0b3',
    borderRadius: 6
 }
})
