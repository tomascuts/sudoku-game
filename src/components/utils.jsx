export const createEmptyBoard = () => Array(9).fill(null).map(() => Array(9).fill(''))

export const isValid = (board, row, col, num) => {
  for (let x = 0; x < 9; x++) {
    if (x !== col && board[row][x] === num) return false
    if (x !== row && board[x][col] === num) return false
  }

  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if ((boxRow + i !== row || boxCol + j !== col) && board[boxRow + i][boxCol + j] === num) {
        return false
      }
    }
  }

  return true
}

export const solveSudoku = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === '') {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num.toString())) {
            board[row][col] = num.toString()
            if (solveSudoku(board)) {
              return true
            }
            board[row][col] = ''
          }
        }
        return false
      }
    }
  }
  return true
}

export const solveSudokuBranchAndBound = (board) => {
  const emptyCell = findEmptyCell(board)
  if (!emptyCell) return true

  const [row, col] = emptyCell
  const possibleValues = getPossibleValues(board, row, col)

  for (const num of possibleValues) {
    board[row][col] = num
    if (solveSudokuBranchAndBound(board)) {
      return true
    }
    board[row][col] = ''
  }

  return false
}

const findEmptyCell = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === '') {
        return [row, col]
      }
    }
  }
  return null
}

const getPossibleValues = (board, row, col) => {
  const values = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9'])
  
  for (let i = 0; i < 9; i++) {
    values.delete(board[row][i])
    values.delete(board[i][col])
  }

  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      values.delete(board[boxRow + i][boxCol + j])
    }
  }

  return Array.from(values)
}