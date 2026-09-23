import type { ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import { useModal } from '@web/app/providers';
import { ArchivedNotice, RestoreButton } from '@web/shared/ui';

import type { ContentScope } from '../hooks';
import { useApiArchiveAction, useApiGetClimberContent } from '../hooks';
import { isErasable } from '../lib';
import { ClimberContentNote } from './ClimberContentNote';

export interface Props {
  scope: ContentScope;
  id: string;
  name: string;
  notice: ReactNode;
  catalogLoss?: ReactNode;
  onDone: () => void;
}

export const ArchivedItemPanel = ({
  scope,
  id,
  name,
  notice,
  catalogLoss,
  onDone
}: Props) => {
  const { openModal } = useModal();
  const { content } = useApiGetClimberContent(scope, id);
  const { isPending: isRestoring, run: restore } = useApiArchiveAction(
    'restore',
    { scope, onDone }
  );
  const { isPending: isErasing, run: erase } = useApiArchiveAction('erase', {
    scope,
    onDone
  });

  const isBusy = isRestoring || isErasing;

  return (
    <PanelStyled>
      <ArchivedNotice>{notice}</ArchivedNotice>
      <ClimberContentNote content={content} catalogLoss={catalogLoss} />
      <ActionsStyled>
        <RestoreButton isPending={isBusy} onClick={() => restore(id)} />
        <Button
          type="button"
          size="small"
          color="error"
          variant="outlined"
          disabled={isBusy || !isErasable(content)}
          onClick={() =>
            openModal('PURGE_CATALOG_ITEM', {
              name,
              onConfirm: () => erase(id)
            })
          }
        >
          <Trans>Erase for good</Trans>
        </Button>
      </ActionsStyled>
    </PanelStyled>
  );
};

const PanelStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const ActionsStyled = styled('div')`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(1)};

  & > * {
    flex: 1 1 50%;
  }
`;
