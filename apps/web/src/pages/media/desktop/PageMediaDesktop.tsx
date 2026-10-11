import { Trans, useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { PageShell } from '@web/shared/ui';

import {
  useApiGetVideos,
  useVideoActions,
  useVideoFilters,
  VideoActionButton,
  VideoCount,
  VideoFilterPills,
  VideoList,
  VideoSearchField
} from '../common';

const MIN_COLUMN_WIDTH = 200;

export const PageMediaDesktop = () => {
  const { filters, idAdded, changeFilters } = useVideoFilters();
  const { total } = useApiGetVideos(filters);
  const { t } = useLingui();
  const { canDelete, addVideo, deleteVideo } = useVideoActions();

  return (
    <PageShell spacing={3}>
      <HeaderRowStyled>
        <TitleStyled>
          <Typography variant="h4">
            <Trans>Media</Trans>
          </Typography>
          <VideoCount total={total} />
        </TitleStyled>
        <Button variant="contained" startIcon={<AddIcon />} onClick={addVideo}>
          <Trans>Add video</Trans>
        </Button>
      </HeaderRowStyled>

      <FilterRowStyled>
        <VideoSearchField
          query={filters.query}
          onChange={(query) => changeFilters({ query })}
        />
        <VideoFilterPills filters={filters} onChange={changeFilters} />
      </FilterRowStyled>

      <VideoList
        filters={filters}
        idAdded={idAdded}
        minColumnWidth={MIN_COLUMN_WIDTH}
        actionOf={(video) =>
          canDelete(video) && (
            <VideoActionButton
              label={t`Delete video`}
              icon={<DeleteOutlineOutlinedIcon fontSize="small" />}
              onClick={() => deleteVideo(video)}
            />
          )
        }
      />
    </PageShell>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const TitleStyled = styled('div')`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const FilterRowStyled = styled('div')`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.appBar};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1.5, 0)};
  background-color: ${({ theme }) => theme.palette.background.default};
  /* Cards scrolled under it land on fractional pixels and bleed a hairline
     past the box edges; the spread paints over that seam. */
  box-shadow: 0 0 0 2px ${({ theme }) => theme.palette.background.default};
`;
