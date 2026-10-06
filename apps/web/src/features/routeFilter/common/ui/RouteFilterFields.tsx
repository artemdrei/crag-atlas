import type { GradeHistogramGroup } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { FilterTextField, GradeHistogram } from '@web/shared/ui';

import {
  LENGTH_FILTERS,
  RATING_FILTERS,
  ROUTE_SORTS,
  type RouteSort,
  TICKED_FILTERS
} from '../entities';
import type { RouteFilterState } from '../hooks';
import { useRouteFilterLabels, useRouteSortLabel } from '../hooks';
import { FilterOptionRow } from './FilterOptionRow';
import { RouteSortIcon } from './RouteSortIcon';
import { RoutesSortDirectionButton } from './RoutesSortDirectionButton';

export interface Props {
  state: RouteFilterState;
  gradeHistogram: GradeHistogramGroup[];
}

export const RouteFilterFields = ({ state, gradeHistogram }: Props) => {
  const { t } = useLingui();
  const labels = useRouteFilterLabels();
  const sortLabel = useRouteSortLabel();

  return (
    <FieldsStyled>
      <Typography variant="caption" color="text.secondary">
        {t`Grade`}
      </Typography>
      {gradeHistogram.map((group) => (
        <GradeHistogramStyled
          key={group.type}
          group={group}
          selectedGrades={state.filter.grades}
          onToggleGrade={state.toggleGrade}
          isCompact
          hasScrollHint
        />
      ))}
      <FilterOptionRow
        label={t`Rating`}
        value={state.filter.rating}
        options={RATING_FILTERS}
        labelOf={(option) => labels.rating[option]}
        onChange={state.changeRating}
      />
      <FilterOptionRow
        label={t`Length`}
        value={state.filter.length}
        options={LENGTH_FILTERS}
        labelOf={(option) => labels.length[option]}
        onChange={state.changeLength}
      />
      <FilterOptionRow
        label={t`Ascents`}
        value={state.filter.ticked}
        options={TICKED_FILTERS}
        labelOf={(option) => labels.ticked[option]}
        onChange={state.changeTicked}
      />
      <Divider />
      <SortRowStyled>
        <SortFieldStyled
          select
          size="small"
          label={t`Sort`}
          isActive={state.sort !== 'default'}
          value={state.sort}
          onChange={(event) =>
            state.changeSort(event.target.value as RouteSort)
          }
        >
          {ROUTE_SORTS.map((sort) => (
            <MenuItem key={sort} value={sort}>
              <SortOptionStyled>
                <ListItemIcon>
                  <RouteSortIcon sort={sort} />
                </ListItemIcon>
                <ListItemText>{sortLabel(sort)}</ListItemText>
              </SortOptionStyled>
            </MenuItem>
          ))}
        </SortFieldStyled>
        <RoutesSortDirectionButton
          direction={state.direction}
          isDisabled={state.sort === 'default'}
          onToggleDirection={state.toggleDirection}
        />
      </SortRowStyled>
    </FieldsStyled>
  );
};

const GradeHistogramStyled = styled(GradeHistogram)`
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
`;

const FieldsStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.25)};
`;

const SortRowStyled = styled('div')`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1.5, 0, 0.5)};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const SortFieldStyled = styled(FilterTextField)`
  flex: 1 1 auto;
  min-width: 0;

  & .MuiSelect-select {
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
    display: flex;
    align-items: center;
    min-height: 0;
    padding-top: ${({ theme }) => theme.spacing(0.75)};
    padding-bottom: ${({ theme }) => theme.spacing(0.75)};
  }

  & .MuiListItemText-root {
    margin: 0;
  }
`;

const SortOptionStyled = styled('span')`
  display: flex;
  align-items: center;

  & .MuiListItemIcon-root {
    min-width: ${({ theme }) => theme.spacing(4)};
  }
`;
