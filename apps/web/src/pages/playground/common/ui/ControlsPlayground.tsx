import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

import { PlaygroundSection } from './PlaygroundSection';

export const ControlsPlayground = () => (
  <>
    <PlaygroundSection title="Buttons">
      <Button variant="contained">contained</Button>
      <Button variant="outlined">outlined</Button>
      <Button>text</Button>
      <Button variant="contained" disabled>
        disabled
      </Button>
      <Switch defaultChecked />
    </PlaygroundSection>

    <PlaygroundSection title="Inputs">
      <TextField size="small" label="Text" defaultValue="Мізерна логіка" />
      <TextField
        size="small"
        type="date"
        label="Date"
        defaultValue="2026-09-19"
      />
      <TextField size="small" select label="Select" defaultValue="redpoint">
        <MenuItem value="redpoint">redpoint</MenuItem>
        <MenuItem value="flash">flash</MenuItem>
      </TextField>
      <TextField
        size="small"
        label="Error"
        defaultValue="bad"
        error
        helperText="Invalid value"
      />
    </PlaygroundSection>
  </>
);
