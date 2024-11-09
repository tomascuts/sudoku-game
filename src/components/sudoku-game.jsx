import React, { useState, useEffect } from 'react'
import { ThemeProvider, createTheme, Box, Typography } from '@mui/material'
import Board from './board'
import ControlPanel from './controlPanel'
import DifficultySelector from './difficultySelector'
import StatusMessage from './statusMessage'
import CustomTemplateInput from './customTemplateInput'
import { createEmptyBoard, solveSudoku, solveSudokuBranchAndBound, isValid } from './utils'


const theme = createTheme()

export default function SudokuGame() {
  const [board, setBoard] = useState(createEmptyBoard())
  const [initialBoard, setInitialBoard] = useState(createEmptyBoard())
  const [status, setStatus] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [invalidCells, setInvalidCells] = useState({})
  const [gameMode, setGameMode] = useState(null)
  const [showGrid, setShowGrid] = useState(false)
  const [solveTime, setSolveTime] = useState(null)
  const [algorithmUsed, setAlgorithmUsed] = useState(null)
  const [showCustomInput, setShowCustomInput] = useState(false)

  useEffect(() => {
    if (gameMode && gameMode !== 'custom') {
      newGame()
      setShowGrid(true)
      setShowCustomInput(false)
    } else if (gameMode === 'custom') {
      setShowCustomInput(true)
      setShowGrid(false)
    }
  }, [gameMode, difficulty])

  const newGame = (customBoard = null) => {
    let newBoard
    if (customBoard && Array.isArray(customBoard) && customBoard.length === 9 && customBoard.every(row => Array.isArray(row) && row.length === 9)) {
      newBoard = customBoard.map(row => [...row])
    } else {
      newBoard = createEmptyBoard()
      solveSudoku(newBoard)
      const cellsToFill = {
        easy: Math.floor(Math.random() * 16) + 35,
        medium: Math.floor(Math.random() * 13) + 22,
        hard: Math.floor(Math.random() * 12) + 10,
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
    }
    setBoard(newBoard)
    setInitialBoard(newBoard.map(row => [...row]))
    setStatus('')
    setInvalidCells({})
    setSolveTime(null)
    setAlgorithmUsed(null)
    setShowGrid(true)
    setShowCustomInput(false)
  }

  const handleCellChange = (row, col, value) => {
    if (initialBoard[row][col] === '' && (value === '' || /^[1-9]$/.test(value))) {
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
    }
  }

  const checkSolution = () => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === '' || !isValid(board, row, col, board[row][col])) {
          setStatus('Solución incorrecta')
          return
        }
      }
    }
    setStatus('¡Solución correcta!')
  }

  const solvePuzzle = (algorithm) => {
    const startTime = performance.now()
    const solvedBoard = board.map(row => [...row])
    let solved
    if (algorithm === 'backtracking') {
      solved = solveSudoku(solvedBoard)
    } else {
      solved = solveSudokuBranchAndBound(solvedBoard)
    }
    if (solved) {
      const endTime = performance.now()
      setBoard(solvedBoard)
      setStatus(`¡Sudoku resuelto usando ${algorithm === 'backtracking' ? 'Backtracking' : 'Ramificación y Acotación'}!`)
      setInvalidCells({})
      setSolveTime(endTime - startTime)
      setAlgorithmUsed(algorithm === 'backtracking' ? 'Backtracking' : 'Ramificación y Acotación')
    } else {
      setStatus('No existe solución')
      setSolveTime(null)
      setAlgorithmUsed(null)
    }
  }

  const handleGameModeChange = (mode) => {
    if (mode.startsWith('play-')) {
      setGameMode('play')
      setDifficulty(mode.split('-')[1])
    } else {
      setGameMode(mode)
    }
  }

  const resetGame = () => {
    setGameMode(null)
    setShowGrid(false)
    setShowCustomInput(false)
    setDifficulty('medium')
    setSolveTime(null)
    setAlgorithmUsed(null)
  }

  const clearSolution = () => {
    const clearedBoard = board.map((row, rowIndex) =>
      row.map((cell, colIndex) =>
        initialBoard[rowIndex][colIndex] !== '' ? initialBoard[rowIndex][colIndex] : ''
      )
    )
    setBoard(clearedBoard)
    setStatus('')
    setInvalidCells({})
    setSolveTime(null)
    setAlgorithmUsed(null)
  }

  const handleCustomTemplateSubmit = (customBoard) => {
    newGame(customBoard)
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Juego de Sudoku
        </Typography>
        {!showGrid && !showCustomInput ? (
          <DifficultySelector
            gameMode={gameMode}
            onGameModeChange={handleGameModeChange}
            onStartGame={() => setShowGrid(true)}
          />
        ) : showCustomInput ? (
          <CustomTemplateInput onSubmit={handleCustomTemplateSubmit} />
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {gameMode === 'custom' ? 'Template personalizado' : `Dificultad: ${difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Media' : 'Difícil'} (${
                  difficulty === 'easy' ? '35-50' : difficulty === 'medium' ? '22-34' : '10-21'
                } números iniciales)`}
              </Typography>
            </Box>
            <Board
              board={board}
              initialBoard={initialBoard}
              invalidCells={invalidCells}
              onCellChange={handleCellChange}
            />
            <ControlPanel
              onNewGame={newGame}
              onCheckSolution={checkSolution}
              onSolveBacktracking={() => solvePuzzle('backtracking')}
              onSolveBranchAndBound={() => solvePuzzle('branchAndBound')}
              onClearSolution={clearSolution}
              onResetGame={resetGame}
            />
            <StatusMessage status={status} solveTime={solveTime} algorithmUsed={algorithmUsed} />
          </>
        )}
      </Box>
    </ThemeProvider>
  )
}