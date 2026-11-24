import { Box, Button, Chip, Paper, Stack, Switch, TextField, Typography, FormControlLabel, Slider } from '@mui/material'
import { useState } from 'react'

export function MuiPanel() {
  const [volume, setVolume] = useState(40)
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="overline" color="text.secondary">@mui/material</Typography>
      <Typography variant="h3" sx={{ fontSize: 32, mb: 2 }}>Material UI</Typography>
      <Stack spacing={2}>
        <TextField label="Project name" defaultValue="Field notes" size="small" />
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Chip label="Draft" />
          <Chip label="Shared" color="primary" variant="outlined" />
          <Chip label="Due Fri" color="secondary" variant="outlined" />
        </Stack>
        <Box>
          <Typography variant="body2" color="text.secondary">Volume <span className="tabular-nums">{volume}</span></Typography>
          <Slider value={volume} onChange={(_, v) => setVolume(v as number)} aria-label="Volume" />
        </Box>
        <FormControlLabel control={<Switch defaultChecked />} label="Notify collaborators" />
        <Stack direction="row" spacing={1}>
          <Button variant="contained">Save</Button>
          <Button variant="outlined">Cancel</Button>
        </Stack>
      </Stack>
    </Paper>
  )
}
