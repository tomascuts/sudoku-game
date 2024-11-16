import {React} from 'react'
import { Alert, Typography } from '@mui/material'


export default function StatusMessage({ status, solveTime, algorithmUsed, recursionBBCount,recursionBTCount,casillasVaciasBBCuenta }) {
  if (!status) return null

  return (
    <Alert severity={status.includes('resuelto') || status === 'Solución correcta!' ? 'success' : 'error'} sx={{ mt: 2 }}>
      {status}
      {solveTime !== null && algorithmUsed && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Resuelto en {solveTime.toFixed(2)} milisegundos | Utilizando {algorithmUsed == 'Backtracking'? recursionBTCount : recursionBBCount} veces recursividad
        </Typography>
      )}
    </Alert>
  )
}