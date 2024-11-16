import React, { useState, useEffect } from 'react'
import { ThemeProvider, createTheme, Box, Typography,CssBaseline  } from '@mui/material'
import Board from './board'
import ControlPanel from './controlPanel'
import DifficultySelector from './difficultySelector'
import StatusMessage from './statusMessage'
import CustomTemplateInput from './customTemplateInput'
import { cuadriculaVacia, resolverSudoku, resolverSudokuBranchAndBound, esValido, crearSudokuRandom } from './utils'

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
  const [board, setBoard] = useState(cuadriculaVacia())
  const [initialBoard, setInitialBoard] = useState(cuadriculaVacia())
  const [status, setStatus] = useState('')
  const [dificultad, setDifficulty] = useState('medium')
  const [invalidCells, setInvalidCells] = useState({})
  const [gameMode, setGameMode] = useState(null)
  const [showGrid, setShowGrid] = useState(false)
  const [solveTime, setSolveTime] = useState(null)
  const [algorithmUsed, setAlgorithmUsed] = useState(null)
  const [showCustomInput, setShowCustomInput] = useState(false)

  //contadores
  const [recursionBBCount, setRecursionBBCuenta] = useState(0)
  const [recursionBTCount, setRecursionBTCount] = useState(0)
  const [casillasVaciasBBCuenta, setLugarVacioBBCuenta] = useState(0)

  useEffect(() => {
    if (gameMode && gameMode !== 'custom') {
      newGame()
      setShowGrid(true)
      setShowCustomInput(false)
    } else if (gameMode === 'custom') {
      setShowCustomInput(true)
      setShowGrid(false)
    }
  }, [gameMode, dificultad])

  const counterHandlers = {
    recursionBBCount,
    setRecursionBBCuenta,
    casillasVaciasBBCuenta,
    setLugarVacioBBCuenta,
    recursionBTCount,
    setRecursionBTCount
  };

  //Generamos un nuevo tablero segun la dificultad seleccionada o el tablero personalizado
  
  const newGame = (customBoard = null) => {
    let newBoard = crearSudokuRandom(dificultad);

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
        const esValidoInput = esValido(newBoard, row, col, value)
        newInvalidCells[`${row}-${col}`] = !esValidoInput
      }
      //Recorremos filas y columnas verificando con el esValido si es un valor correcto, caso contrario lo agregamos al InvalidCells state.
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (newBoard[r][c] !== '' && !esValido(newBoard, r, c, newBoard[r][c])) {
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
        if (board[row][col] === '' || !esValido(board, row, col, board[row][col])) {
          setStatus('Solución incorrecta')
          return
        }
      }
    }
    setStatus('Solución correcta!')
  }

  const handleSolve = (algorithm,solvedBoard) => {
    setRecursionBBCuenta(0);
    setLugarVacioBBCuenta(0);
    setRecursionBTCount(0);

    let solved
  
    if (algorithm === 'backtracking') {
      solved = resolverSudoku(solvedBoard,counterHandlers)
    } else {
      solved = resolverSudokuBranchAndBound(solvedBoard, counterHandlers)
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
    setRecursionBBCuenta(0);
    setLugarVacioBBCuenta(0);
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
                        dificultad === "facil"
                          ? "Fácil"
                          : dificultad === "medium"
                          ? "Media"
                          : "Difícil"
                      }
                    (${
                      dificultad === "facil"
                        ? "35-50"
                        : dificultad === "medium"
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
                casillasVaciasBBCuenta={casillasVaciasBBCuenta}
                recursionBTCount={recursionBTCount}
              />
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
  
}