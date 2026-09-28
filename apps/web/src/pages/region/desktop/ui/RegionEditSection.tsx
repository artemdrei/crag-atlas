import { useNavigate } from 'react-router';

import type { Region } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { ROUTES } from '@web/app/router/routes';
import { ArchiveRegionButton, RegionEditForm } from '@web/features/catalogEdit';
import { coordsOf, useStoredFlag } from '@web/shared/lib';

const STORAGE_KEY = 'crag-atlas:region-form-open';

export interface Props {
  region?: Region;
}

export const RegionEditSection = ({ region }: Props) => {
  const navigate = useNavigate();
  const { value: isOpen, toggle } = useStoredFlag(STORAGE_KEY, true);

  return (
    <SectionStyled>
      <ToggleStyled type="button" aria-expanded={isOpen} onClick={toggle}>
        <Typography variant="subtitle2">
          <Trans>Region</Trans>
        </Typography>
        <ExpandMoreIcon fontSize="small" />
      </ToggleStyled>
      <Collapse in={isOpen} unmountOnExit>
        {region && (
          <RegionEditForm
            region={region}
            point={coordsOf(region)}
            leftAction={
              <ArchiveRegionButton
                region={region}
                onArchived={() => navigate(ROUTES.INDEX)}
              />
            }
          />
        )}
      </Collapse>
    </SectionStyled>
  );
};

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const ToggleStyled = styled(ButtonBase)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(0.5, 0)};

  & svg {
    transition: transform 0.15s ease-out;
  }

  &[aria-expanded='true'] svg {
    transform: rotate(180deg);
  }
`;
