import React, { useState, useCallback } from 'react'
import { Box, TextField, Button, Grid, Paper } from '@mui/material'
import { esValido } from './utils'

export default function CustomTemplateInput({ onSubmit }) {
  const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill('')))
  const [invalidCells, setInvalidCells] = useState({})

  const validateBoard = useCallback((newBoard) => {
    const newInvalidCells = {}
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (newBoard[row][col] !== '') {
          const esValidoInput = esValido(newBoard, row, col, newBoard[row][col])
          if (!esValidoInput) {
            newInvalidCells[`${row}-${col}`] = true
          }
        }
      }
    }

    setInvalidCells(newInvalidCells)
    return Object.keys(newInvalidCells).length === 0
  }, [])

  const handleCellChange = (row, col, value) => {
    if (value === '' || (value >= '1' && value <= '9')) {
      const newBoard = board.map(r => [...r])
      newBoard[row][col] = value
      setBoard(newBoard)
      validateBoard(newBoard)
    }
  }

  const handleSubmit = () => {
    if (Object.keys(invalidCells).length === 0) {
      onSubmit(board)
    }
  }

  const isBoardValid = Object.keys(invalidCells).length === 0

  return (
    <Box sx={{ mt: 2, maxWidth: 600, margin: 'auto' }}>
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
                  backgroundColor: invalidCells[`${rowIndex}-${colIndex}`] ? '#ffcccb' : 'white',
                }}
              >
                <TextField
                  value={cell}
                  onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                  inputProps={{
                    style: { 
                      textAlign: 'center',
                      fontSize: '1.2rem',
                      padding: '8px',
                      width: '100%',
                      height: '100%',
                      boxSizing: 'border-box',
                    },
                    maxLength: 1,
                  }}
                  sx={{ 
                    width: '100%',
                    height: '100%',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        border: 'none',
                      },
                    },
                    '& input': {
                      color: invalidCells[`${rowIndex}-${colIndex}`] ? 'red' : 'inherit',
                    },
                  }}
                />
              </Paper>
            </Grid>
          ))
        ))}
      </Grid>
      <Button 
        variant="contained" 
        onClick={handleSubmit} 
        disabled={!isBoardValid}
        sx={{ 
          mt: 2,
          display: 'block',
          margin: '20px auto',
        }}
      >
        Crear juego con este template
      </Button>
    </Box>
  )
}