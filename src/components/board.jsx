import React from 'react'
import { Grid } from '@mui/material'
import Cell from './cell'

export default function Board({ board, initialBoard, invalidCells, onCellChange }) {
  return (
    <Grid container spacing={1}>
      {board.map((row, rowIndex) => (
        row.map((cell, colIndex) => (
          <Grid item xs={1.33} key={`${rowIndex}-${colIndex}`}>
            <Cell
              value={cell}
              isInitial={initialBoard[rowIndex][colIndex] !== ''}
              isInvalid={invalidCells[`${rowIndex}-${colIndex}`]}
              onChange={(value) => onCellChange(rowIndex, colIndex, value)}
            />
          </Grid>
        ))
      ))}
    </Grid>
  )
}