import React from 'react';
import ReactDOM from 'react-dom/client';
import SudokuGame from './components/sudoku-game';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SudokuGame />
  </React.StrictMode>
);
