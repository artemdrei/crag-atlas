import type { ReactNode } from 'react';
import { Fragment } from 'react';

import type { ClimberContent } from '@crag-atlas/api';
import { Plural, Trans } from '@lingui/react/macro';
import Typography from '@mui/material/Typography';

import { isErasable } from '../lib';

export interface Props {
  content: ClimberContent | null;
  catalogLoss?: ReactNode;
}

export const ClimberContentNote = ({ content, catalogLoss }: Props) => {
  if (!content) return null;

  if (isErasable(content)) {
    return (
      <Typography variant="body2" color="text.secondary">
        <Trans>
          Climbers left nothing here — no ascents, no comments, no photos.
        </Trans>
        {catalogLoss ? <> {catalogLoss}</> : null}
      </Typography>
    );
  }

  // A "0 photos" mid-sentence reads as a defect, not as information.
  const left = [
    {
      id: 'ascents',
      count: content.ascents,
      node: (
        <Plural
          value={content.ascents}
          one="# ascent"
          few="# ascents"
          many="# ascents"
          other="# ascents"
        />
      )
    },
    {
      id: 'comments',
      count: content.comments,
      node: (
        <Plural
          value={content.comments}
          one="# comment"
          few="# comments"
          many="# comments"
          other="# comments"
        />
      )
    },
    {
      id: 'media',
      count: content.media,
      node: (
        <Plural
          value={content.media}
          one="# photo or link"
          few="# photos or links"
          many="# photos or links"
          other="# photos or links"
        />
      )
    }
  ].filter(({ count }) => count > 0);

  return (
    <Typography variant="body2" color="text.secondary">
      <Trans>This one stays — climbers left</Trans>{' '}
      {left.map(({ id, node }, index) => (
        <Fragment key={id}>
          {index > 0 && ', '}
          {node}
        </Fragment>
      ))}
      {'. '}
      <Trans>
        It is out of the catalog, and a direct link still opens everything on
        it.
      </Trans>
    </Typography>
  );
};
