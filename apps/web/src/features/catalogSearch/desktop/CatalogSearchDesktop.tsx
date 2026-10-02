import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

import { CatalogSearchBox } from '../common';

export const CatalogSearchDesktop = () => (
  <SearchStyled slots={{ paper: DropdownStyled }} />
);

const COLLAPSED_WIDTH = 320;
const EXPANDED_WIDTH = 480;

const SearchStyled = styled(CatalogSearchBox)`
  width: ${COLLAPSED_WIDTH}px;
  transition: width 0.2s ease-out;

  &:focus-within {
    width: ${EXPANDED_WIDTH}px;
  }

  & .MuiInputBase-root {
    height: 36px;
  }
`;

const DropdownStyled = styled(Paper)`
  & .MuiAutocomplete-listbox {
    max-height: ${({ theme }) => theme.spacing(50)};
    padding: 0;
  }
`;
