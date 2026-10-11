import { Trans, useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { PageShell } from '@web/shared/ui';

import {
  useApiGetVideos,
  useTrackVideoSearch,
  useVideoActions,
  useVideoFilters,
  VideoActionButton,
  VideoCount,
  VideoFilterPills,
  VideoList,
  VideoSearchField
} from '../common';

const MIN_COLUMN_WIDTH = 260;

export const PageMediaMobile = () => {
  const { filters, idAdded, changeFilters } = useVideoFilters();
  const { total, term } = useApiGetVideos(filters);
  useTrackVideoSearch(term, total);
  const { t } = useLingui();
  const { canDelete, addVideo, openVideoMenu } = useVideoActions();

  return (
    <PageShell spacing={2} isCompact>
      <HeaderRowStyled>
        <TitleStyled>
          <Typography variant="h5">
            <Trans>Media</Trans>
          </Typography>
          <VideoCount total={total} />
        </TitleStyled>
        <Button variant="contained" startIcon={<AddIcon />} onClick={addVideo}>
          <Trans>Add</Trans>
        </Button>
      </HeaderRowStyled>

      <FiltersBarStyled>
        <VideoSearchField
          query={filters.query}
          onChange={(query) => changeFilters({ query })}
        />

        <PillsRowStyled>
          <VideoFilterPills filters={filters} onChange={changeFilters} />
        </PillsRowStyled>
      </FiltersBarStyled>

      <VideoList
        filters={filters}
        idAdded={idAdded}
        minColumnWidth={MIN_COLUMN_WIDTH}
        actionOf={(video) =>
          canDelete(video) && (
            <VideoActionButton
              label={t`Video actions`}
              icon={<MoreVertIcon fontSize="small" />}
              onClick={() => openVideoMenu(video)}
            />
          )
        }
      />
    </PageShell>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const TitleStyled = styled('div')`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const FiltersBarStyled = styled('div')`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.appBar};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1, 0)};
  background-color: ${({ theme }) => theme.palette.background.default};
  /* Cards scrolled under it land on fractional pixels and bleed a hairline
     past the box edges; the spread paints over that seam. */
  box-shadow: 0 0 0 2px ${({ theme }) => theme.palette.background.default};
`;

const PillsRowStyled = styled('div')`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;
