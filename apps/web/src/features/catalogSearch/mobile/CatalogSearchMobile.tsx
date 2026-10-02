import { useState } from 'react';

import { useLingui } from '@lingui/react/macro';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { keyframes, styled } from '@mui/material/styles';

import { CatalogSearchBox } from '../common';

export const CatalogSearchMobile = () => {
  const { t } = useLingui();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <IconButton aria-label={t`Search`} onClick={() => setIsExpanded(true)}>
        <SearchIcon />
      </IconButton>
    );
  }

  return (
    <SearchStyled
      placeholder={t`Search`}
      isAutoFocused
      slots={{ paper: DropdownStyled }}
      onBlur={(query) => {
        if (!query) setIsExpanded(false);
      }}
      onPick={() => setIsExpanded(false)}
    />
  );
};

const appear = keyframes`
  from {
    opacity: 0;
  }
`;

// Opacity, not width: the popper measures this element once when it opens, so
// an anchor that is still growing is measured at its starting size.
const SearchStyled = styled(CatalogSearchBox)`
  width: 100%;
  animation: ${appear} 0.2s ease-out;

  .MuiOutlinedInput-root {
    height: 100%;
    padding-left: ${({ theme }) => theme.spacing(1.25)};
    padding-right: ${({ theme }) => theme.spacing(0.5)};
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
  }

  .MuiInputAdornment-positionStart {
    margin-right: ${({ theme }) => theme.spacing(0.5)};
  }
`;

const DropdownStyled = styled(Paper)`
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};

  & .MuiAutocomplete-listbox {
    max-height: 60dvh;
    padding: 0;
  }
`;
