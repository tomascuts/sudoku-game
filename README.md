# Sudoku utilizando React

Este proyecto es un juego de Sudoku interactivo desarrollado en React. Permite a los usuarios jugar al Sudoku, validar los movimientos y resolver el tablero mediante algoritmos de **Backtracking** y **Branch & Bound**. También ofrece detalles sobre el rendimiento de cada método de resolución.

---

## Descripción

Este juego de Sudoku permite resolver un tablero de 9x9 de manera interactiva. Los jugadores pueden llenar las celdas vacías siguiendo las reglas tradicionales del Sudoku. Además, la aplicación puede validar las entradas y resolver el tablero automáticamente, mostrando el tiempo necesario para encontrar la solución mediante dos algoritmos distintos.

## Funcionalidades

1. **Tablero de Sudoku**: Interfaz visual del tablero de 9x9 donde el usuario puede ingresar valores.
2. **Verificación de Movimiento**: Al ingresar un número en una celda, se valida si es un movimiento permitido según las reglas del Sudoku.
3. **Resolución Automática**: Los jugadores pueden solicitar la solución del tablero, usando dos métodos diferentes:
   - **Backtracking**: Un método tradicional de prueba y error para resolver el Sudoku.
   - **Branch & Bound**: Un método optimizado que utiliza listas de posibles valores, lo que mejora la eficiencia en algunos casos.
4. **Indicador de Tiempo de Resolución**: Muestra cuánto tiempo tomó cada algoritmo para resolver el tablero, proporcionando un análisis de rendimiento.
5. **Estado del Juego**: Indica si el Sudoku ha sido resuelto exitosamente o si no tiene solución.

## Estructura del Proyecto

- `src/`
  - `components/`
    - `sudoku-game.jsx`: Componente principal del juego de Sudoku.
  - `utils/`
    - `util.js`: Algoritmos de resolución (Backtracking y Branch & Bound) y funciones auxiliares (`isValid` y `getPossibleValues`).
  - `index.jsx`: Punto de entrada de la aplicación.

## Instalación

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 12 o superior)

### Instrucciones

1. Clona este repositorio en tu máquina local.
    ```bash
    git clone https://github.com/tu-usuario/sudoku-game.git
    cd sudoku-game
    ```

2. Instala las dependencias.
    ```bash
    npm install
    ```

3. Inicia la aplicación.
    ```bash
    npm start
    ```

4. Abre el navegador y visita `http://localhost:3000` para jugar.

## Uso

1. **Interfaz del Tablero**: Haz clic en una celda vacía e ingresa un número del 1 al 9. Si el número cumple las reglas del Sudoku, permanecerá en la celda; de lo contrario, recibirás una notificación.
2. **Resolver Automáticamente**:
   - Selecciona uno de los algoritmos (Backtracking o Branch & Bound) y presiona el botón de "Resolver".
   - La aplicación mostrará el tiempo de ejecución y el estado de la resolución (si el tablero se resolvió o no tiene solución).
3. **Reiniciar Tablero**: Puedes reiniciar el tablero para comenzar una nueva partida en cualquier momento.

## Algoritmos de Resolución

### Backtracking

Este método explora todas las posibles combinaciones de números en el tablero. En cada celda vacía:
1. Intenta colocar números del 1 al 9.
2. Si un número es válido, procede a la siguiente celda vacía.
3. Si no hay opciones válidas, retrocede (backtrack) y prueba con otro número.

#### Complejidad

Este método es exhaustivo y, aunque garantiza encontrar la solución, puede ser lento para configuraciones complejas del tablero.

### Branch & Bound

Este método optimiza el Backtracking:
1. En lugar de probar todos los números, utiliza `getPossibleValues` para limitar el conjunto de números posibles en cada celda vacía.
2. Si una celda tiene solo una opción válida, se elige directamente.
3. Esto reduce el número de iteraciones y mejora la velocidad de resolución en algunos casos.

#### Complejidad

Aunque no siempre es más rápido que el Backtracking, puede mejorar el rendimiento al reducir el número de opciones en cada celda, especialmente en tableros con pocas celdas vacías.

## Ejemplo de Código

Muestra del código para cada algoritmo:

- **Backtracking**:

    ```javascript
    export const solveSudoku = (board) => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === '') {
            for (let num = 1; num <= 9; num++) {
              if (isValid(board, row, col, num.toString())) {
                board[row][col] = num.toString();
                if (solveSudoku(board)) return true;
                board[row][col] = '';
              }
            }
            return false;
          }
        }
      }
      return true;
    };
    ```

- **Branch & Bound**:

    ```javascript
    export const solveSudokuBranchAndBound = (board) => {
      const emptyCell = findEmptyCell(board);
      if (!emptyCell) return true;

      const [row, col] = emptyCell;
      const possibleValues = getPossibleValues(board, row, col);

      for (const num of possibleValues) {
        board[row][col] = num;
        if (solveSudokuBranchAndBound(board)) return true;
        board[row][col] = '';
      }
      return false;
    };
    ```

