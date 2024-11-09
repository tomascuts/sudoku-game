import React from 'react'
import { Paper, TextField } from '@mui/material'

export default function Cell({ value, isInitial, isInvalid, onChange }) {
  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isInitial ? '#f0f0f0' : 'white',
        ...(isInvalid && { backgroundColor: '#ffcccb' }),
      }}
    >
      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputProps={{
          style: { textAlign: 'center' },
          maxLength: 1,
        }}
        disabled={isInitial}
        sx={{ 
          width: '100%', 
          input: { 
            textAlign: 'center',
            color: isInvalid ? 'red' : 'inherit',
          } 
        }}
      />
    </Paper>
  )
}