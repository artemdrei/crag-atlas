import { Link } from 'react-router';

import { Trans } from '@lingui/react/macro';
import CloudDoneOutlined from '@mui/icons-material/CloudDoneOutlined';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  links: { id: string; name: string; path: string }[];
}

export const OfflineShortcutLinks = ({ links }: Props) => (
  <SectionStyled>
    <Typography variant="body2" color="text.secondary">
      <Trans>You are offline. Saved regions:</Trans>
    </Typography>
    <ChipsStyled>
      {links.map((link) => (
        <Chip
          key={link.id}
          clickable
          component={Link}
          to={link.path}
          icon={<CloudDoneOutlined />}
          label={link.name}
          variant="outlined"
        />
      ))}
    </ChipsStyled>
  </SectionStyled>
);

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ChipsStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;
