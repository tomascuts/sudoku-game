import React from 'react'
import { Box, Button } from '@mui/material'

export default function ControlPanel({ onNewGame, onCheckSolution, onSolveBacktracking, onSolveBranchAndBound, onClearSolution, onResetGame }) {
  return (
    <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
      <Button variant="contained" onClick={onNewGame}>
        Nuevo juego
      </Button>
      <Button variant="contained" onClick={onCheckSolution}>
        Verificar
      </Button>
      <Button variant="contained" onClick={onSolveBacktracking}>
        Resolver (Backtracking)
      </Button>
      <Button variant="contained" onClick={onSolveBranchAndBound}>
        Resolver (B&B)
      </Button>
      <Button variant="contained" onClick={onClearSolution}>
        Borrar solución
      </Button>
      <Button variant="outlined" onClick={onResetGame}>
        Nuevo Modo
      </Button>
    </Box>
  )
}