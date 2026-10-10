import type { ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export interface Props {
  isCollapsed: boolean;
  hasShowButton?: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export const CollapsibleMap = ({
  isCollapsed,
  hasShowButton = true,
  onToggle,
  children
}: Props) => {
  if (isCollapsed) {
    if (!hasShowButton) return null;

    return (
      <ToggleRowStyled>
        <ToggleButtonStyled
          size="small"
          color="inherit"
          startIcon={<MapOutlinedIcon />}
          onClick={onToggle}
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
          onClick={onToggle}
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
