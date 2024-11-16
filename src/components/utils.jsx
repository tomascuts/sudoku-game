
//inicializamos cada celda como vacia
export const cuadriculaVacia = () => Array(9).fill(null).map(() => Array(9).fill(''))

const agregarValoresRandom = (board, count) => {
  let agregado = 0;
  while (agregado < count) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] === '') {
      const num = (Math.floor(Math.random() * 9) + 1).toString();
      if (esValido(board, row, col, num)) {
        board[row][col] = num;
        agregado++;
      }
    }
  }
};

//Verificamos si el numero puede ser colocado en la celda. 
export const esValido = (board, row, col, num) => {
  for (let x = 0; x < 9; x++) {
    if (x !== col && board[row][x] === num) return false
    if (x !== row && board[x][col] === num) return false
  }

  //Restriccion de cuadrado 3x3 correspondiente a la celda donde estamos verificando.
  //No debe existir el numero que estamos queriendo ingresar.
  const cajaFila = Math.floor(row / 3) * 3
  const cajaCol = Math.floor(col / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if ((cajaFila + i !== row || cajaCol + j !== col) && board[cajaFila + i][cajaCol + j] === num) {
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


export const crearSudokuRandom = (dificultad) => {
  let board = cuadriculaVacia();

  agregarValoresRandom(board, Math.floor(Math.random() * 10) + 5);

  // Resolver el tablero
  resolverSudokuBranchAndBound(board, { setRecursionBBCuenta: () => {}, setLugarVacioBBCuenta: () => {} });

  
  const cellsToFill = {
    facil: Math.floor(Math.random() * 16) + 35,
    medium: Math.floor(Math.random() * 13) + 22,
    dificil: Math.floor(Math.random() * 12) + 10,
  }[dificultad];

  const sacarCeldas = 81 - cellsToFill;
  for (let i = 0; i < sacarCeldas; i++) {
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
export const resolverSudoku = (board,contadores = null) => {

  if (contadores) {
    contadores.setRecursionBTCount(contadores.recursionBTCount++);
  }

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === '') {
        for (let num = 1; num <= 9; num++) {
          if (esValido(board, row, col, num.toString())) {
            board[row][col] = num.toString()
            if (resolverSudoku(board,contadores)) {
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
//Heurística: Buscamos una celda vacia con menor numero de valores posibles usando celdaConMenosOpciones y obtenemos una lista de posibles valores para la celda.
//Si el valor actual permite continuar con el juego lo dejamos, sino borramos y probamos con el siguiente en la lista de posibles valores.
export const resolverSudokuBranchAndBound = (board, contadores = null) => {

  if (contadores) {
    contadores.setRecursionBBCuenta(contadores.recursionBBCount++);
  }

  
  const bestEmptyCell = celdaConMenosOpciones(board);
  if (!bestEmptyCell) return true; // Si no hay celdas vacías, hemos encontrado una solución

  const [row, col] = bestEmptyCell;
  const valoresPosibles = getValoresPosibles(board, row, col);

  // Poda: Si no hay valores posibles para la celda, este camino es inválido
  if (valoresPosibles.length === 0) {
    return false;
  }

  
  for (const num of valoresPosibles) {
    board[row][col] = num;
    if (resolverSudokuBranchAndBound(board, contadores)) {
      return true;
    }
    contadores.setLugarVacioBBCuenta(contadores.casillasVaciasBBCuenta++);
    board[row][col] = ''; 
  }

  return false; 
};


//Busca la primer celda vacia
const celdaConMenosOpciones = (board) => {
  let minOptions = 10;
  let bestCell = null;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === '') {
        const valoresPosibles = getValoresPosibles(board, row, col);
        if (valoresPosibles.length === 1) return [row, col];
        if (valoresPosibles.length < minOptions) {
          minOptions = valoresPosibles.length;
          bestCell = [row, col];
        }
      }
    }
  }
  return bestCell;
};

//generamos valores posibles del 1 al 9 que podrian colocarse en una celda, respetando las reglas del juego 

const getValoresPosibles = (board, row, col) => {
  const values = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9'])
  
  for (let i = 0; i < 9; i++) {
    values.delete(board[row][i])
    values.delete(board[i][col])
  }

  const cajaFila = Math.floor(row / 3) * 3
  const cajaCol = Math.floor(col / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      
      values.delete(board[cajaFila + i][cajaCol + j])
    }
  }

  return Array.from(values)
}