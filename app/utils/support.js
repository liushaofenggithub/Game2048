import {Alert} from "react-native";

const noSpace = (board) => {
  for(let i = 0; i < 4; i++) {
    for(let j = 0; j < 4; j++) {
      if (board[i][j] === 0) {
        return false
      }
    }
  }
  return true
}

const noMove = (board) => {
  if (canMoveLeft(board) || canMoveRight(board) || canMoveUp(board) || canMoveDown(board)) return false
  return true
}

const isGameOver = (board, newGame) => {
  if (noSpace(board) && noMove(board)) {
    alert('Game Over')
  }
}

const getNumColor = (num) => {
  if (num <= 4) return '#776e65'
  return "white"
}

const getNumBgColor = (num) => {
  switch (num) {
    case 2: return "#eee4da"; break;
    case 4: return "#ede0c8"; break;
    case 8: return "#f2b179"; break;
    case 16: return "#f59563"; break;
    case 32: return "#f67c5f"; break;
    case 64: return "#f65e3b"; break;
    case 128: return "#edcf72"; break;
    case 256: return "#edcc61"; break;
    case 512: return "#9c0"; break;
    case 1024: return "#33b5e5"; break;
    case 2048: return "#09c"; break;
    case 4096: return "#a6c"; break;
    case 8192: return "#93c"; break;
  }
}

const getPosition = (x, y, gridWidth) => {
  return {
    left: 16 + y * (gridWidth + 16),
    top: 16 + x * (gridWidth + 16)
  }
}

const canMoveLeft = (board) => {
  for(let i = 0; i < 4; i++) {
    for(let j = 1; j < 4; j++) {
      if (board[i][j] !== 0) {
        if (board[i][j-1] === 0 || board[i][j-1] === board[i][j]) return true
      }
    }
  }
  return false
}

const canMoveRight = (board) => {
  for(let i = 0; i < 4; i++) {
    for(let j = 2; j >= 0; j--) {
      if (board[i][j] !== 0) {
        if (board[i][j+1] === 0 || board[i][j+1] === board[i][j]) return true
      }
    }
  }
  return false
}

const canMoveUp = (board) => {
  for(let i = 1; i < 4; i++) {
    for(let j = 0; j < 4; j++) {
      if (board[i][j] !== 0) {
        if (board[i-1][j] === 0 || board[i-1][j] === board[i][j]) return true
      }
    }
  }
  return false
}

const canMoveDown = (board) => {
  for(let i = 2; i >= 0; i--) {
    for(let j = 0; j < 4; j++) {
      if (board[i][j] !== 0) {
        if (board[i+1][j] === 0 || board[i+1][j] === board[i][j]) return true
      }
    }
  }
  return false
}

const noBlockHorizontal = (row, col1, col2, board) => {
  for (let col = col1 + 1; col < col2; col++) {
    if (board[row][col] !== 0) {
      return false
    }
  }
  return true
}

const noBlockVertical = (col, row1, row2, board) => {
  for (let row = row1 + 1; row < row2; row++) {
    if (board[row][col] !== 0) return false
  }
  return true
}

export { noSpace, noMove, getNumBgColor, getNumColor, getPosition, canMoveLeft, canMoveRight, canMoveUp, canMoveDown, noBlockHorizontal, noBlockVertical, isGameOver }
