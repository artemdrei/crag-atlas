import { useState } from 'react';

import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

import { useOpenCatalogItem } from '@web/app/router/useOpenCatalogItem';

import {
  CatalogSearchField,
  CatalogSearchResults,
  useApiSearchCatalog
} from '../common';

export const CatalogSearchMobile = () => {
  const openCatalogItem = useOpenCatalogItem();
  const [query, setQuery] = useState('');
  const { results, isLoading, isActive } = useApiSearchCatalog(query);

  return (
    <SearchStyled>
      <CatalogSearchField value={query} onChange={setQuery} />
      {isActive && (
        <DropdownStyled elevation={0}>
          <CatalogSearchResults
            results={results}
            isLoading={isLoading}
            onPick={(hit) => {
              setQuery('');
              openCatalogItem('search', hit);
            }}
          />
        </DropdownStyled>
      )}
    </SearchStyled>
  );
};

const SearchStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const DropdownStyled = styled(Paper)`
  max-height: ${({ theme }) => theme.spacing(40)};
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;
