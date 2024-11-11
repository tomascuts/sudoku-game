import React, { useState, useEffect } from 'react'
import { ThemeProvider, createTheme, Box, Typography,CssBaseline  } from '@mui/material'
import Board from './board'
import ControlPanel from './controlPanel'
import DifficultySelector from './difficultySelector'
import StatusMessage from './statusMessage'
import CustomTemplateInput from './customTemplateInput'
import { createEmptyBoard, solveSudoku, solveSudokuBranchAndBound, isValid } from './utils'

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f0f4f8',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
})

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

  //Counters
  const [recursionBBCount, setRecursionBBCount] = useState(0)
  const [recursionBTCount, setRecursionBTCount] = useState(0)
  const [emptyAssignmentsBBCount, setEmptyAssignmentsBBCount] = useState(0)

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

  const counterHandlers = {
    recursionBBCount,
    setRecursionBBCount,
    emptyAssignmentsBBCount,
    setEmptyAssignmentsBBCount,
    recursionBTCount,
    setRecursionBTCount
  };

  //Generamos un nuevo tablero segun la dificultad seleccionada o el tablero personalizado
  const newGame = (customBoard = null) => {
    let newBoard
    
    //tablero personalizado, clonamos ingresamos el custom donde se ingresaro los datos
    if (customBoard && Array.isArray(customBoard) && customBoard.length === 9 && customBoard.every(row => Array.isArray(row) && row.length === 9)) {
      newBoard = customBoard.map(row => [...row])
    } else {
      //Tablero nuevo segun dificultad, se resuelve y se vacian celdas al azar. Para que el tablero tenga coherencia
      newBoard = createEmptyBoard()
      solveSudoku(newBoard)
      // Usamos la formula (Math.random() * (max - min) + min) para generar un numero aleatorio dentro del rango.
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

  //Controlamos los cambios en las celdas. En cada cambio se actualiza el tablero. Se verifica si es incorrecto el valor.
  const handleCellChange = (row, col, value) => {
    if (initialBoard[row][col] === '' && 
        (value === '' || /^[1-9]$/.test(value)) // el valor ingresado debe ser del 1 al 9
    ) {
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
      //Recorremos filas y columnas verificando con el IsValid si es un valor correcto, caso contrario lo agregamos al InvalidCells state.
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

  //Comprobamos si el tablero actual es una solución correcta del Sudoku
  const checkSolution = () => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === '' || !isValid(board, row, col, board[row][col])) {
          setStatus('Solución incorrecta')
          return
        }
      }
    }
    setStatus('Solución correcta!')
  }

  const handleSolve = (algorithm,solvedBoard) => {
    setRecursionBBCount(0);
    setEmptyAssignmentsBBCount(0);
    setRecursionBTCount(0);

    let solved
  
    if (algorithm === 'backtracking') {
      solved = solveSudoku(solvedBoard,counterHandlers)
    } else {
      solved = solveSudokuBranchAndBound(solvedBoard, counterHandlers)
    }

    return solved;
  };

  // Resolvemos el sudoku segun el algoritmo seleccionado. (backtracking o branch & bound).
  const solvePuzzle = (algorithm) => {
    const solvedBoard = board.map(row => [...row])
    const startTime = performance.now()

    //Le pasamos una copia del tablero al algoritmo seleccionado para resolver el sudoku.
    let solved = handleSolve(algorithm,solvedBoard);
   
    if (solved) {
      const endTime = performance.now()
      setBoard(solvedBoard)
      setStatus(`Sudoku resuelto usando ${algorithm === 'backtracking' ? 'Backtracking' : 'Branch and Bound'}!`)
      setInvalidCells({})
      setSolveTime(endTime - startTime)
      setAlgorithmUsed(algorithm === 'backtracking' ? 'Backtracking' : 'Branch and Bound')
    } else {
      const endTime = performance.now()
      setStatus('No existe solución')
      setSolveTime(endTime - startTime)
      setAlgorithmUsed(algorithm === 'backtracking' ? 'Backtracking' : 'Branch and Bound')
    }
  }

  //Establecemos el modo de juego segun la seleccion realizada al comienzo.
  const handleGameModeChange = (mode) => {
    if (mode.startsWith('play-')) {
      setGameMode('play')
      setDifficulty(mode.split('-')[1])
    } else {
      setGameMode(mode)
    }
  }

  //Restablecemos el juego al estado inicial, seteando los states en null
  const resetGame = () => {
    setGameMode(null)
    setShowGrid(false)
    setShowCustomInput(false)
    setDifficulty('medium')
    setSolveTime(null)
    setAlgorithmUsed(null)
  }


  //Limpia la solucion, dejando solo el tablero con su template inicial.
  const clearSolution = () => {
    setRecursionBBCount(0);
    setEmptyAssignmentsBBCount(0);
    setRecursionBTCount(0);


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

  //Setea el tablero custom personalizado por el usuario para comenzar a jugar 
  const handleCustomTemplateSubmit = (customBoard) => {
    newGame(customBoard)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(45deg, #2980b9 30%, #2c3e50 90%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 3,
        }}
      >
        <Box
          sx={{
            backgroundColor: "background.paper",
            borderRadius: 4,
            padding: 4,
            boxShadow: 3,
            maxWidth: 1000,
            width: "100%",
          }}
        >
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">
                  {gameMode === "custom"
                    ? "Template personalizado"
                    : `Dificultad: ${
                        difficulty === "easy"
                          ? "Fácil"
                          : difficulty === "medium"
                          ? "Media"
                          : "Difícil"
                      }
                    (${
                      difficulty === "easy"
                        ? "35-50"
                        : difficulty === "medium"
                        ? "22-34"
                        : "10-21"
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
                onSolveBacktracking={() => solvePuzzle("backtracking")}
                onSolveBranchAndBound={() => solvePuzzle("branchAndBound")}
                onClearSolution={clearSolution}
                onResetGame={resetGame}
              />
              <StatusMessage
                status={status}
                solveTime={solveTime}
                algorithmUsed={algorithmUsed}
                recursionBBCount={recursionBBCount}
                emptyAssignmentsBBCount={emptyAssignmentsBBCount}
                recursionBTCount={recursionBTCount}
              />
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
  
}