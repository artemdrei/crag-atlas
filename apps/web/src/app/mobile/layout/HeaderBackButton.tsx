import { useNavigate } from 'react-router';

import { useLingui } from '@lingui/react/macro';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

export interface Props {
  parentPath: string;
}

export const HeaderBackButton = ({ parentPath }: Props) => {
  const { t } = useLingui();
  const navigate = useNavigate();

  // idx 0 is the entry the app was opened on and survives replace navigations
  // (filters); location.key does not. -1 there would leave the app.
  const handleBack = () =>
    window.history.state?.idx > 0
      ? navigate(-1)
      : navigate(parentPath, { replace: true });

  return (
    <BackButtonStyled edge="start" aria-label={t`Back`} onClick={handleBack}>
      <ArrowBackIcon />
    </BackButtonStyled>
  );
};

const BackButtonStyled = styled(IconButton)`
  color: ${({ theme }) => theme.palette.text.primary};
`;
