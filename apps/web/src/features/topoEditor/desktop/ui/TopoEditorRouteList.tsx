import { Trans } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { GradeTone } from '@web/shared/theme/palette';
import { resolveGradeTone } from '@web/shared/theme/palette';

import type { RouteDraft } from '../../common';
import type { RouteGroupDraft } from '../TopoEditorDesktop';

export interface Props {
  groups: RouteGroupDraft[];
  numberOf: Record<string, number>;
  idSelectedRoute?: string;
  idHoveredRoute?: string;
  isBusy: boolean;
  onSelect: (idRoute: string) => void;
  onHover: (idRoute?: string) => void;
  onAdd: () => void;
}

export const TopoEditorRouteList = ({
  groups,
  numberOf,
  idSelectedRoute,
  idHoveredRoute,
  isBusy,
  onSelect,
  onHover,
  onAdd
}: Props) => {
  const renderRow = (route: RouteDraft) => (
    <RowStyled
      key={route.id}
      isSelected={route.id === idSelectedRoute}
      isHovered={route.id === idHoveredRoute}
      onClick={() => onSelect(route.id)}
      onMouseEnter={() => onHover(route.id)}
      onMouseLeave={() => onHover(undefined)}
    >
      <NumberStyled tone={resolveGradeTone(route.grade, route.gradeScale)}>
        {numberOf[route.id] ?? '—'}
      </NumberStyled>
      <NameStyled variant="body2" noWrap>
        {route.name}
      </NameStyled>
      {route.isDirty && (
        <Typography variant="caption" color="warning.main">
          <Trans>Unsaved</Trans>
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary">
        {route.grade}
      </Typography>
    </RowStyled>
  );

  return (
    <ListStyled>
      <HeaderStyled>
        <Typography variant="subtitle2">
          <Trans>Routes</Trans>
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon fontSize="small" />}
          disabled={isBusy}
          onClick={onAdd}
        >
          <Trans>Add</Trans>
        </Button>
      </HeaderStyled>
      {groups.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          <Trans>No routes yet — add the first one.</Trans>
        </Typography>
      )}
      {groups.map((group) => (
        <GroupStyled key={group.id}>
          <GroupLabelStyled variant="caption" color="text.secondary">
            {group.label}
          </GroupLabelStyled>
          {group.routes.map(renderRow)}
        </GroupStyled>
      ))}
    </ListStyled>
  );
};

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  min-height: 0;
  overflow-y: auto;
`;

const HeaderStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
`;

const GroupStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const GroupLabelStyled = styled(Typography)`
  padding: ${({ theme }) => theme.spacing(1, 0, 0.5)};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const RowStyled = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isHovered'
})<{ isSelected: boolean; isHovered: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1, 1.5)};
  border: 1px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.palette.primary.main : theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: ${({ theme, isSelected, isHovered }) =>
    isSelected || isHovered ? theme.palette.action.hover : 'transparent'};
`;

const NumberStyled = styled('span', {
  shouldForwardProp: (prop) => prop !== 'tone'
})<{ tone: GradeTone }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: ${({ theme, tone }) => theme.palette.grade[tone].background};
  color: ${({ theme, tone }) => theme.palette.grade[tone].text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: 700;
`;

const NameStyled = styled(Typography)`
  flex-grow: 1;
  min-width: 0;
  text-align: left;
`;
