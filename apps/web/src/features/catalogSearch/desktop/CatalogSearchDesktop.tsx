import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { styled } from '@mui/material/styles';

import {
  CatalogSearchField,
  CatalogSearchResults,
  searchHitPath,
  useApiSearchCatalog
} from '../common';

export const CatalogSearchDesktop = () => {
  const navigate = useNavigate();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { results, isLoading, isActive } = useApiSearchCatalog(query);

  const isShown = isOpen && isActive;

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <AnchorStyled ref={anchorRef}>
        <CatalogSearchField
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(next) => {
            setQuery(next);
            setIsOpen(true);
          }}
        />
        <Popper
          open={isShown}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ width: anchorRef.current?.clientWidth, zIndex: 2 }}
        >
          <DropdownStyled elevation={8}>
            <CatalogSearchResults
              results={results}
              isLoading={isLoading}
              onPick={(hit) => {
                setIsOpen(false);
                navigate(searchHitPath(hit));
              }}
            />
          </DropdownStyled>
        </Popper>
      </AnchorStyled>
    </ClickAwayListener>
  );
};

const AnchorStyled = styled('div')`
  position: relative;
`;

const DropdownStyled = styled(Paper)`
  max-height: ${({ theme }) => theme.spacing(50)};
  overflow-y: auto;
`;
