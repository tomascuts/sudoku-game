import React from 'react'
import { Box, Button, FormControl, FormLabel, Radio, RadioGroup, FormControlLabel } from '@mui/material'

export default function DifficultySelector({ gameMode, onGameModeChange, onStartGame }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
      <FormControl component="fieldset">
        <FormLabel component="legend">Elegí el modo de juego</FormLabel>
        <RadioGroup
          aria-label="modo-de-juego"
          name="modo-de-juego"
          value={gameMode}
          onChange={(e) => onGameModeChange(e.target.value)}
        >
          <FormControlLabel value="play-facil" control={<Radio />} label="Jugar nuevo juego (Fácil)" />
          <FormControlLabel value="play-medium" control={<Radio />} label="Jugar nuevo juego (Medio)" />
          <FormControlLabel value="play-dificil" control={<Radio />} label="Jugar nuevo juego (Difícil)" />
          <FormControlLabel value="custom" control={<Radio />} label="Crear template personalizado" />
        </RadioGroup>
      </FormControl>
      <Button
        variant="contained"
        onClick={onStartGame}
        disabled={!gameMode}
      >
        Empezar juego
      </Button>
    </Box>
  )
}