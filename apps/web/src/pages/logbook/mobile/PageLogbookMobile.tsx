import { Trans } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { ApiFeedback } from '@web/shared/ui';

import { TicksList, useApiGetTicks } from '../common';

export const PageLogbookMobile = () => {
  const { ticks, isLoading, failure } = useApiGetTicks();

  return (
    <PageStyled spacing={2}>
      <Typography variant="h5">
        <Trans>My logbook</Trans>
      </Typography>
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading ascents…</Trans>}
      />
      <TicksList ticks={ticks} isLoading={isLoading} />
    </PageStyled>
  );
};

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(2)};
`;
