
//inicializamos cada celda como vacia
export const createEmptyBoard = () => Array(9).fill(null).map(() => Array(9).fill(''))

//Verificamos si el numero puede ser colocado en la celda. 
export const isValid = (board, row, col, num) => {
  for (let x = 0; x < 9; x++) {
    //Restriccion de fila y columna
    if (x !== col && board[row][x] === num) return false
    if (x !== row && board[x][col] === num) return false
  }

  //Restriccion de cuadrado 3x3 correspondiente a la celda donde estamos verificando.
  //No debe existir el numero que estamos queriendo ingresar.
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


//Usamos backtracking para resolver el sudoku. Reccorremos cada celda buscando celdas vacias.
//Cuando encontramos una intentamos llenarlas con numeros del 1 al 9. Si el numero es valido lo coloca y vuelve a llamar a la funcion recursivamente.
//Si no puede completarse, elimina el numero y continua probando con otro valor.
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

  //Retornamos false si no es posible resolver el sudoku.
  return true
}

//Usamos Branch&Bound para resolver el sudoku.
//Buscamos una celda vacia usando findEmptyCell y obtenemos una lista de posibles valores para la celda con getPossibleValues.
//Si el valor actual permite continuar con el juego lo dejamos, sino borramos y probamos con el siguiente en la lista de posibles valores.
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

  //Retornamos false si no tiene solucion.
  return false
}


//Busca la primer celda vacia y devuelve su posicion i,j.
const findEmptyCell = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === '') {
        return [row, col]
      }
    }
  }

  //Retornamos null si no hay celdas vacias (es decir, el tablero esta completo).
  return null
}

//generamos valores posibles del 1 al 9 que podrian colocarse en una celda, respetando las reglas del juego 
//(validaciones identicas al is valid)
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
      //Removemos los valores que ya existen en la misma fila, columna y subcuadrado
      values.delete(board[boxRow + i][boxCol + j])
    }
  }

  return Array.from(values)
}