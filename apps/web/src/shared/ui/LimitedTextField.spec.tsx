import { useState } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createAppTheme } from '@web/shared/theme/theme';

import { LimitedTextField } from './LimitedTextField';

const theme = createAppTheme('light');

const Harness = ({ maxLength }: { maxLength: number }) => {
  const [value, setValue] = useState('');

  return (
    <ThemeProvider theme={theme}>
      <LimitedTextField
        label="Note"
        maxLength={maxLength}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </ThemeProvider>
  );
};

const type = (text: string) =>
  fireEvent.change(screen.getByLabelText('Note'), { target: { value: text } });

describe('LimitedTextField', () => {
  it('stays quiet while there is plenty of room', () => {
    render(<Harness maxLength={10} />);
    type('abc');

    expect(screen.queryByText(/\/ 10/)).toBeNull();
  });

  it('counts down once the limit is near', () => {
    render(<Harness maxLength={10} />);
    type('abcdefgh');

    expect(screen.getByText('8 / 10')).toBeDefined();
  });

  it('says so once the limit is reached', () => {
    render(<Harness maxLength={10} />);
    type('abcdefghij');

    expect(screen.getByText('10 / 10')).toBeDefined();
  });
});
