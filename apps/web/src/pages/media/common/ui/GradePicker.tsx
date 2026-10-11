import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import { gradeOptions, useDisplayGrade } from '@web/shared/lib';

const FRENCH_GRADES = gradeOptions('french');

const filterGrades = createFilterOptions<string>({ matchFrom: 'start' });

export interface Props {
  label: string;
  grade: string;
  min?: string;
  max?: string;
  onChange: (grade: string) => void;
}

export const GradePicker = ({ label, grade, min, max, onChange }: Props) => {
  const displayGrade = useDisplayGrade();
  const labelOf = (option: string) => displayGrade(option, 'french');
  const from = min ? FRENCH_GRADES.indexOf(min) : -1;
  const to = max ? FRENCH_GRADES.indexOf(max) : -1;
  const options = FRENCH_GRADES.slice(
    Math.max(from, 0),
    to === -1 ? undefined : to + 1
  );

  return (
    <AutocompleteStyled
      size="small"
      autoHighlight
      options={options}
      value={grade || null}
      getOptionLabel={labelOf}
      filterOptions={(options, state) =>
        filterGrades(options, { ...state, getOptionLabel: labelOf })
      }
      renderInput={(params) => <TextField {...params} label={label} />}
      onChange={(_, next) => onChange(next ?? '')}
    />
  );
};

const AutocompleteStyled = styled(Autocomplete<string>)`
  width: 140px;
`;
