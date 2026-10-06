import { useLocation } from 'react-router';

import AppBar from '@mui/material/AppBar';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';

import { parentPathOf } from '@web/app/router/parentPathOf';
import { ROUTES } from '@web/app/router/routes';
import { CatalogSearchMobile } from '@web/features/catalogSearch';
import { Wordmark } from '@web/shared/ui';

import { HeaderBackButton } from './HeaderBackButton';

export const HeaderMobile = () => {
  const { pathname } = useLocation();
  const parentPath = parentPathOf(pathname);

  return (
    <HeaderStyled position="static" color="transparent" elevation={0}>
      <ToolbarStyled>
        {parentPath ? (
          <HeaderBackButton parentPath={parentPath} />
        ) : (
          <Wordmark to={ROUTES.INDEX} />
        )}
        <SearchSlotStyled>
          <CatalogSearchMobile />
        </SearchSlotStyled>
      </ToolbarStyled>
    </HeaderStyled>
  );
};

const HeaderStyled = styled(AppBar)`
  background-color: ${({ theme }) => theme.palette.background.default};
`;

const ToolbarStyled = styled(Toolbar)`
  gap: ${({ theme }) => theme.spacing(1)};
`;

const SEARCH_SLOT_HEIGHT = 40;

// Fixed height: the slot swaps a 40px icon button for a text field, and a
// toolbar that changes height shifts the whole page under it.
const SearchSlotStyled = styled('div')`
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  height: ${SEARCH_SLOT_HEIGHT}px;
  padding-left: ${({ theme }) => theme.spacing(4)};
`;
