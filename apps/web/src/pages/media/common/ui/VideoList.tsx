import type { ReactNode } from 'react';

import type { Video } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';

import { ApiFeedback, EmptyState, LoadMoreOnScroll } from '@web/shared/ui';

import type { VideoFilters } from '../entities';
import { useApiGetVideos, useVideoActions } from '../hooks';
import { VideoCard } from './VideoCard';
import { VideoGrid, VideoGridSkeleton } from './VideoGrid';

export interface Props {
  filters: VideoFilters;
  idAdded: string | null;
  minColumnWidth: number;
  actionOf: (video: Video) => ReactNode;
}

export const VideoList = ({
  filters,
  idAdded,
  minColumnWidth,
  actionOf
}: Props) => {
  const { videos, isLoading, isLoadingMore, hasMore, failure, loadMore } =
    useApiGetVideos(filters);
  const { isOwn, playVideo } = useVideoActions();

  const isFiltered =
    !!filters.query.trim() || !!filters.gradeFrom || !!filters.gradeTo;

  if (isLoading) {
    return <VideoGridSkeleton count={8} minColumnWidth={minColumnWidth} />;
  }

  if (failure) return <ApiFeedback failure={failure} />;

  if (videos.length === 0) {
    return (
      <EmptyState
        icon={<VideoLibraryOutlinedIcon />}
        message={
          isFiltered ? (
            <Trans>No videos match these filters</Trans>
          ) : (
            <Trans>No videos yet</Trans>
          )
        }
      />
    );
  }

  return (
    <>
      <VideoGrid
        minColumnWidth={minColumnWidth}
        itemCount={videos.length}
        hasMore={hasMore}
      >
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            query={filters.query}
            action={actionOf(video)}
            isOwn={isOwn(video)}
            isHighlighted={video.id === idAdded}
            onPlay={() => playVideo(video)}
          />
        ))}
      </VideoGrid>
      <LoadMoreOnScroll
        hasMore={hasMore}
        isLoading={isLoadingMore}
        onReach={loadMore}
        rootMargin="0px 0px 400px 0px"
      />
    </>
  );
};
