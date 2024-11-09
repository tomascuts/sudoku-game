import React, { useState, useEffect } from 'react'
import {
  Button,
  Grid,
  Paper,
  TextField,
  ThemeProvider,
  createTheme,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
} from '@mui/material'

const theme = createTheme()

const createEmptyBoard = () => Array(9).fill(null).map(() => Array(9).fill(''))

const isValid = (board, row, col, num) => {
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

const solveSudoku = (board) => {
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

const solveSudokuBranchAndBound = (board) => {
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

function App() {
  const [board, setBoard] = useState(createEmptyBoard())
  const [initialBoard, setInitialBoard] = useState(createEmptyBoard())
  const [status, setStatus] = useState('')
  const [isTemplateMode, setIsTemplateMode] = useState(false)
  const [difficulty, setDifficulty] = useState('medium')
  const [invalidCells, setInvalidCells] = useState({})
  const [gameMode, setGameMode] = useState(null)
  const [showGrid, setShowGrid] = useState(false)
  const [customTemplate, setCustomTemplate] = useState(createEmptyBoard())
  const [solveTime, setSolveTime] = useState(null)

  useEffect(() => {
    if (gameMode) {
      newGame()
      setShowGrid(true)
    }
  }, [gameMode, difficulty])

  const newGame = () => {
    let newBoard = createEmptyBoard()
    if (gameMode === 'template') {
      setBoard(newBoard)
      setInitialBoard(newBoard)
      setIsTemplateMode(true)
    } else if (gameMode === 'useTemplate') {
      newBoard = customTemplate.map(row => [...row])
      setBoard(newBoard)
      setInitialBoard(newBoard.map(row => [...row]))
      setIsTemplateMode(false)
    } else {
      solveSudoku(newBoard)
      const cellsToFill = {
        easy: Math.floor(Math.random() * 16) + 35, // 35 to 50
        medium: Math.floor(Math.random() * 13) + 22, // 22 to 34
        hard: Math.floor(Math.random() * 12) + 10, // 10 to 21
      }[difficulty]
      const cellsToRemove = 81 - cellsToFill
      for (let i = 0; i < cellsToRemove; i++) {
        let row, col
        do {
          row = Math.floor(Math.random() * 9)
          col = Math.floor(Math.random() * 9)
        } while (newBoard[row][col] === '')
        newBoard[row][col] = ''
      }
      setBoard(newBoard)
      setInitialBoard(newBoard.map(row => [...row]))
      setIsTemplateMode(false)
    }
    setStatus('')
    setInvalidCells({})
    setSolveTime(null)
  }

  const handleChange = (row, col, value) => {
    if ((isTemplateMode || initialBoard[row][col] === '') && (value === '' || /^[1-9]$/.test(value))) {
      const newBoard = board.map(r => [...r])
      newBoard[row][col] = value
      setBoard(newBoard)

      const newInvalidCells = { ...invalidCells }
      if (value === '') {
        delete newInvalidCells[`${row}-${col}`]
      } else {
        const isValidInput = isValid(newBoard, row, col, value)
        newInvalidCells[`${row}-${col}`] = !isValidInput
      }
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (newBoard[r][c] !== '' && !isValid(newBoard, r, c, newBoard[r][c])) {
            newInvalidCells[`${r}-${c}`] = true
          } else if (newInvalidCells[`${r}-${c}`]) {
            delete newInvalidCells[`${r}-${c}`]
          }
        }
      }
      setInvalidCells(newInvalidCells)

      if (isTemplateMode) {
        setCustomTemplate(newBoard)
      }
    }
  }

  const checkSolution = () => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === '' || !isValid(board, row, col, board[row][col])) {
          setStatus('Incorrect solution')
          return
        }
      }
    }
    setStatus('Correct solution!')
  }

  const solvePuzzle = () => {
    const startTime = performance.now()
    const solvedBoard = board.map(row => [...row])
    if (solveSudoku(solvedBoard)) {
      const endTime = performance.now()
      setBoard(solvedBoard)
      setStatus('Puzzle solved!')
      setInvalidCells({})
      setSolveTime(endTime - startTime)
    } else {
      setStatus('No solution exists')
      setSolveTime(null)
    }
  }

  const solvePuzzleBranchAndBound = () => {
    const startTime = performance.now()
    const solvedBoard = board.map(row => [...row])
    if (solveSudokuBranchAndBound(solvedBoard)) {
      const endTime = performance.now()
      setBoard(solvedBoard)
      setStatus('Puzzle solved using Branch and Bound!')
      setInvalidCells({})
      setSolveTime(endTime - startTime)
    } else {
      setStatus('No solution exists')
      setSolveTime(null)
    }
  }

  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value)
  }

  const handleGameModeChange = (event) => {
    const mode = event.target.value;
    if (mode.startsWith('play-')) {
      setGameMode('play');
      setDifficulty(mode.split('-')[1]);
    } else {
      setGameMode(mode);
    }
  };

  const resetGame = () => {
    setGameMode(null)
    setShowGrid(false)
    setDifficulty('medium')
    setCustomTemplate(createEmptyBoard())
    setSolveTime(null)
  }

  const saveTemplate = () => {
    setCustomTemplate(board);
    setGameMode('useTemplate');
    setIsTemplateMode(false);
    setShowGrid(true);
    setInitialBoard(board.map(row => [...row]));
    setBoard(board.map(row => [...row]));
  }

  const isTemplateValid = () => {
    for (let i = 0; i < 9; i++) {
      const rowSet = new Set();
      const colSet = new Set();
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== '' && rowSet.has(board[i][j])) return false;
        if (board[j][i] !== '' && colSet.has(board[j][i])) return false;
        rowSet.add(board[i][j]);
        colSet.add(board[j][i]);
      }
    }
    return board.some(row => row.some(cell => cell !== ''));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Sudoku Game
        </Typography>
        {!showGrid ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Choose Game Mode</FormLabel>
              <RadioGroup
                aria-label="game-mode"
                name="game-mode"
                value={gameMode}
                onChange={handleGameModeChange}
              >
                <FormControlLabel value="template" control={<Radio />} label="Create Custom Template" />
                <FormControlLabel value="play-easy" control={<Radio />} label="Play New Game (Easy)" />
                <FormControlLabel value="play-medium" control={<Radio />} label="Play New Game (Medium)" />
                <FormControlLabel value="play-hard" control={<Radio />} label="Play New Game (Hard)" />
                {isTemplateValid() && (
                  <FormControlLabel value="useTemplate" control={<Radio />} label="Use Custom Template" />
                )}
              </RadioGroup>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => setShowGrid(true)}
              disabled={!gameMode}
            >
              Start Game
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {isTemplateMode 
                  ? 'Custom Template' 
                  : gameMode === 'useTemplate' 
                    ? 'Custom Game' 
                    : `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} (${
                      difficulty === 'easy' ? '35-50' : difficulty === 'medium' ? '22-34' : '10-21'
                    } initial numbers)`}
              </Typography>
              <Button variant="outlined" onClick={resetGame}>
                New Game / Mode
              </Button>
            </Box>
            <Grid container spacing={1}>
              {board.map((row, rowIndex) => (
                row.map((cell, colIndex) => (
                  <Grid item xs={1.33} key={`${rowIndex}-${colIndex}`}>
                    <Paper
                      elevation={3}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isTemplateMode || initialBoard[rowIndex][colIndex] ? '#f0f0f0' : 'white',
                        ...(invalidCells[`${rowIndex}-${colIndex}`] && { backgroundColor: '#ffcccb' }),
                      }}
                    >
                      <TextField
                        value={cell}
                        onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                        inputProps={{
                          style: { textAlign: 'center' },
                          maxLength: 1,
                        }}
                        disabled={!isTemplateMode && initialBoard[rowIndex][colIndex] !== ''}
                        sx={{ 
                          width: '100%', 
                          input: { 
                            textAlign: 'center',
                            color: invalidCells[`${rowIndex}-${colIndex}`] ? 'red' : 'inherit',
                          } 
                        }}
                      />
                    </Paper>
                  </Grid>
                ))
              ))}
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              {isTemplateMode ? (
                <>
                  <Button variant="contained" onClick={() => setBoard(createEmptyBoard())}>
                    Clear Template
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={saveTemplate} 
                    disabled={!isTemplateValid()}
                  >
                    Save and Use Template
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="contained" onClick={newGame}>
                    New Game
                  </Button>
                  <Button variant="contained" onClick={checkSolution}>
                    Check
                  </Button>
                  <Button variant="contained" onClick={solvePuzzle}>
                    Solve
                  </Button>
                  <Button variant="contained" onClick={solvePuzzleBranchAndBound}>
                    Solve (B&B)
                  </Button>
                </>
              )}
            </Box>
            {status && (
              <Alert severity={status.includes('solved') || status === 'Correct solution!' ? 'success' : 'error'} sx={{ mt: 2 }}>
                {status}
                {solveTime !== null && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Solved in {solveTime.toFixed(2)} milliseconds
                  </Typography>
                )}
              </Alert>
            )}
          </>
        )}
      </Box>
    </ThemeProvider>
  )
}

export default App;
