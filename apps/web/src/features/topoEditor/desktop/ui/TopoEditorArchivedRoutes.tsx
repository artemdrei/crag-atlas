import type { Route } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  ClimberContentNote,
  isErasable,
  useApiGetClimberContent
} from '@web/features/catalogEdit';
import { RestoreButton } from '@web/shared/ui';

export interface Props {
  routes: Route[];
  isBusy: boolean;
  onRestore: (idRoute: string) => void;
  onErase: (route: Route) => void;
}

// An archived route carries no line and is not part of what the editor
// saves, so it never shares the list with the routes being drawn.
export const TopoEditorArchivedRoutes = ({
  routes,
  isBusy,
  onRestore,
  onErase
}: Props) => (
  <ListStyled>
    <HeaderStyled>
      <Typography variant="subtitle2">
        <Trans>Archived routes</Trans>
      </Typography>
    </HeaderStyled>
    {routes.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        <Trans>Nothing archived here — every route is in the catalog.</Trans>
      </Typography>
    ) : (
      routes.map((route) => (
        <ArchivedRouteRow
          key={route.id}
          route={route}
          isBusy={isBusy}
          onRestore={onRestore}
          onErase={onErase}
        />
      ))
    )}
  </ListStyled>
);

interface RowProps {
  route: Route;
  isBusy: boolean;
  onRestore: (idRoute: string) => void;
  onErase: (route: Route) => void;
}

// Each row asks for its own counts: the erase offer is only honest once the
// server has said whether climbers left anything on that route.
const ArchivedRouteRow = ({ route, isBusy, onRestore, onErase }: RowProps) => {
  const { content } = useApiGetClimberContent('routes', route.id);

  return (
    <RowStyled>
      <TitleRowStyled>
        <NameStyled variant="body2" noWrap>
          {route.name}
        </NameStyled>
        <Typography variant="body2" color="text.secondary">
          {route.grade}
        </Typography>
      </TitleRowStyled>
      <ClimberContentNote content={content} />
      <ActionsStyled>
        <RestoreButton isPending={isBusy} onClick={() => onRestore(route.id)} />
        <Button
          type="button"
          size="small"
          color="error"
          variant="outlined"
          disabled={isBusy || !isErasable(content)}
          onClick={() => onErase(route)}
        >
          <Trans>Erase for good</Trans>
        </Button>
      </ActionsStyled>
    </RowStyled>
  );
};

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-height: 0;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(0.5)};
`;

const HeaderStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
`;

const RowStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1.5)};
  border: 1px dashed ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const TitleRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const NameStyled = styled(Typography)`
  flex-grow: 1;
  min-width: 0;
`;

const ActionsStyled = styled('div')`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(1)};

  & > * {
    flex: 1 1 50%;
  }
`;
