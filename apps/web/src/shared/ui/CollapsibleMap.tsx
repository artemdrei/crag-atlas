import type { ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import { useStoredFlag } from '@web/shared/lib';

export interface Props {
  storageKey: string;
  children: ReactNode;
}

export const CollapsibleMap = ({ storageKey, children }: Props) => {
  const { value: isCollapsed, toggle } = useStoredFlag(storageKey, false);

  if (isCollapsed) {
    return (
      <ToggleRowStyled>
        <ToggleButtonStyled
          size="small"
          color="inherit"
          startIcon={<MapOutlinedIcon />}
          onClick={toggle}
        >
          <Trans>Show map</Trans>
        </ToggleButtonStyled>
      </ToggleRowStyled>
    );
  }

  return (
    <div>
      <AreaStyled>{children}</AreaStyled>
      <ToggleRowStyled>
        <ToggleButtonStyled
          size="small"
          color="inherit"
          startIcon={<ExpandLessIcon />}
          onClick={toggle}
        >
          <Trans>Hide map</Trans>
        </ToggleButtonStyled>
      </ToggleRowStyled>
    </div>
  );
};

const BUTTON_HEIGHT_PX = 30;

const AreaStyled = styled('div')`
  position: relative;
  height: 40vh;
  height: 40dvh;
`;

const ToggleButtonStyled = styled(Button)`
  height: ${BUTTON_HEIGHT_PX}px;
  border-radius: 999px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const ToggleRowStyled = styled('div')`
  display: flex;
  justify-content: flex-end;
`;
