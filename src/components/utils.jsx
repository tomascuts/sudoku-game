
//inicializamos cada celda como vacia
export const createEmptyBoard = () => Array(9).fill(null).map(() => Array(9).fill(''))

const addRandomNumbersToBoard = (board, count) => {
  let added = 0;
  while (added < count) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] === '') {
      const num = (Math.floor(Math.random() * 9) + 1).toString();
      if (isValid(board, row, col, num)) {
        board[row][col] = num;
        added++;
      }
    }
  }
};

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

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};


export const createRandomSudokuBoard = (difficulty) => {
  // Crear tablero vacío
  let board = createEmptyBoard();

  // Agregar algunos números aleatorios
  addRandomNumbersToBoard(board, Math.floor(Math.random() * 10) + 5);

  // Resolver el tablero
  solveSudokuBranchAndBound(board, { setRecursionBBCount: () => {}, setEmptyAssignmentsBBCount: () => {} });

  // Determinar la cantidad de celdas a rellenar según dificultad
  const cellsToFill = {
    easy: Math.floor(Math.random() * 16) + 35,
    medium: Math.floor(Math.random() * 13) + 22,
    hard: Math.floor(Math.random() * 12) + 10,
  }[difficulty];

  // Vaciar celdas aleatorias
  const cellsToRemove = 81 - cellsToFill;
  for (let i = 0; i < cellsToRemove; i++) {
    let row, col;
    do {
      row = Math.floor(Math.random() * 9);
      col = Math.floor(Math.random() * 9);
    } while (board[row][col] === '');
    board[row][col] = '';
  }

  return board;
};



//Usamos backtracking para resolver el sudoku. Reccorremos cada celda buscando celdas vacias.
//Cuando encontramos una intentamos llenarlas con numeros del 1 al 9. Si el numero es valido lo coloca y vuelve a llamar a la funcion recursivamente.
//Si no puede completarse, elimina el numero y continua probando con otro valor.
export const solveSudoku = (board,counters = null) => {

  if (counters) {
    counters.setRecursionBTCount(counters.recursionBTCount++);
  }

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === '') {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num.toString())) {
            board[row][col] = num.toString()
            if (solveSudoku(board,counters)) {
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

//Usamos Branch&Bound con una heuristica MRV (Minimun Remaining Value) para resolver el sudoku.
//Heurística: Buscamos una celda vacia con menor numero de valores posibles usando findMostConstrainedEmptyCell y obtenemos una lista de posibles valores para la celda.
//Si el valor actual permite continuar con el juego lo dejamos, sino borramos y probamos con el siguiente en la lista de posibles valores.
export const solveSudokuBranchAndBound = (board, counters = null) => {

  if (counters) {
    counters.setRecursionBBCount(counters.recursionBBCount++);
  }

  // Busca la celda más restringida
  const bestEmptyCell = findMostConstrainedEmptyCell(board);
  if (!bestEmptyCell) return true; // Si no hay celdas vacías, hemos encontrado una solución

  const [row, col] = bestEmptyCell;
  const possibleValues = getPossibleValues(board, row, col);

  // Poda: Si no hay valores posibles para la celda, este camino es inválido
  if (possibleValues.length === 0) {
    return false;
  }

  //Asignamos cada valor posible
  for (const num of possibleValues) {
    board[row][col] = num;
    if (solveSudokuBranchAndBound(board, counters)) {
      return true;
    }
    counters.setEmptyAssignmentsBBCount(counters.emptyAssignmentsBBCount++);
    board[row][col] = ''; // Si no es exitoso revierte la celda
  }

  return false; // No se encontró solución
};


//Busca la primer celda vacia y devuelve su posicion i,j.
const findMostConstrainedEmptyCell = (board) => {
  let minOptions = 10;
  let bestCell = null;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === '') {
        const possibleValues = getPossibleValues(board, row, col);
        if (possibleValues.length === 1) return [row, col];
        if (possibleValues.length < minOptions) {
          minOptions = possibleValues.length;
          bestCell = [row, col];
        }
      }
    }
  }
  return bestCell;
};

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