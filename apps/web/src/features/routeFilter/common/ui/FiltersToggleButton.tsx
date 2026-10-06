import { Trans } from '@lingui/react/macro';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export interface Props {
  activeCount: number;
  isExpanded: boolean;
  onClick: () => void;
}

export const FiltersToggleButton = ({
  activeCount,
  isExpanded,
  onClick
}: Props) => (
  <ButtonStyled
    size="small"
    variant="contained"
    color="inverse"
    startIcon={<TuneIcon />}
    endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
    aria-expanded={isExpanded}
    onClick={onClick}
  >
    <Trans>Filters</Trans>
    {activeCount > 0 && <CountStyled>{activeCount}</CountStyled>}
  </ButtonStyled>
);

const ButtonStyled = styled(Button)`
  flex: none;
  text-transform: none;
`;

const CountStyled = styled('span')`
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  margin-left: ${({ theme }) => theme.spacing(0.75)};
  padding: 0 ${({ theme }) => theme.spacing(0.5)};
  border-radius: 10px;
  background-color: ${({ theme }) => theme.palette.inverse.contrastText};
  color: ${({ theme }) => theme.palette.inverse.main};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: 700;
`;
