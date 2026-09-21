import { useMemo, useState } from 'react';

import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { Trans, useLingui } from '@lingui/react/macro';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useModal } from '@web/app/providers';
import { formatBytes, savedPercent, toast } from '@web/shared/lib';

import type { CompressedPick, PhotoComparison } from '../common';
import {
  useApiReplaceRegionPhoto,
  useApiReplaceTopoPhoto,
  useApiUploadTopo,
  usePhotoCompression
} from '../common';
import { PhotoCompare, PhotoSwap } from './ui';

/** The API rejects anything heavier, so the dialog says so before the trip. */
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const ASPECT_TOLERANCE = 0.01;

export interface ReplacedTopo {
  idTopo: string;
  photoUrl: string;
  ratio: number;
  hasLines: boolean;
}

export interface TopoTarget {
  kind: 'topo';
  idSector: string;
}

export interface RegionTarget {
  kind: 'region';
  idRegion: string;
  photoUrl?: string | null;
}

export type Props = { open: boolean } & (
  | { target: TopoTarget; files: File[]; replacing?: ReplacedTopo }
  | { target: RegionTarget; file: File }
);

const UploadPhotoDialog = (props: Props) => {
  const { t, i18n } = useLingui();
  const { closeModal } = useModal();
  const [idxShown, setIdxShown] = useState(0);
  const [uploaded, setUploaded] = useState(0);

  const isRegion = props.target.kind === 'region';

  // The compression effect keys off the array, so a fresh `[file]` every render
  // would restart it forever.
  const files = useMemo(
    () =>
      isRegion
        ? [(props as { file: File }).file]
        : (props as { files: File[] }).files,
    [isRegion, props]
  );

  const { isCompressing, picks } = usePhotoCompression(files);

  const replacing = isRegion
    ? undefined
    : (props as { replacing?: ReplacedTopo }).replacing;

  const { isPending: isUploading, uploadTopo } = useApiUploadTopo({
    idSector: isRegion ? '' : (props.target as TopoTarget).idSector
  });
  const { isPending: isReplacing, replaceTopoPhoto } = useApiReplaceTopoPhoto({
    idSector: isRegion ? '' : (props.target as TopoTarget).idSector
  });
  const { isPending: isReplacingCover, replaceRegionPhoto } =
    useApiReplaceRegionPhoto({
      idRegion: isRegion ? (props.target as RegionTarget).idRegion : ''
    });

  const close = () => closeModal('UPLOAD_PHOTO');

  const shown = picks[Math.min(idxShown, picks.length - 1)];
  const comparison = shown?.comparison;
  const failed = picks.filter(({ isFailed }) => isFailed).length;
  const sendable = picks.filter(isSendable);
  const oversized = picks.filter(
    (pick) => (pick.comparison?.compressed.bytes ?? 0) > MAX_PHOTO_BYTES
  ).length;
  const before = sendable.reduce(
    (sum, { comparison: photo }) => sum + photo.original.bytes,
    0
  );
  const after = sendable.reduce(
    (sum, { comparison: photo }) => sum + photo.compressed.bytes,
    0
  );
  const savedAll = savedPercent(before, after);
  const saved = comparison
    ? savedPercent(comparison.original.bytes, comparison.compressed.bytes)
    : 0;

  const currentUrl = isRegion
    ? ((props.target as RegionTarget).photoUrl ?? undefined)
    : replacing?.photoUrl;

  const drifts =
    !!replacing &&
    replacing.ratio > 0 &&
    !!comparison &&
    Math.abs(comparison.ratio - replacing.ratio) / replacing.ratio >
      ASPECT_TOLERANCE;
  const isBusy = isUploading || isReplacing || isReplacingCover;

  const upload = async () => {
    if (sendable.length === 0) return;

    try {
      if (isRegion) {
        await replaceRegionPhoto(sendable[0].comparison.blob);
        toast.success(currentUrl ? t`Photo replaced` : t`Photo uploaded`);
      } else if (replacing) {
        const { blob, compressed } = sendable[0].comparison;

        await replaceTopoPhoto({
          idTopo: replacing.idTopo,
          blob,
          width: compressed.width,
          height: compressed.height
        });
        toast.success(t`Photo replaced`);
      } else {
        // One request at a time: a photo's place in the sector is the order it
        // arrived in, and parallel uploads would shuffle it.
        for (const { file, comparison: photo } of sendable) {
          await uploadTopo({
            blob: photo.blob,
            label: file.name,
            width: photo.compressed.width,
            height: photo.compressed.height
          });
          setUploaded((count) => count + 1);
        }

        toast.success(
          sendable.length > 1 ? t`Photos uploaded` : t`Photo uploaded`
        );
      }

      close();
    } catch (error) {
      toast.error(resolveFailureMessage(toFailure(error)));
    }
  };

  return (
    <Dialog fullWidth maxWidth="lg" open={props.open} onClose={close}>
      <DialogTitle>
        {isRegion && currentUrl && <Trans>Replace the cover photo</Trans>}
        {isRegion && !currentUrl && <Trans>Add a cover photo</Trans>}
        {!isRegion && replacing && <Trans>Replace photo</Trans>}
        {!isRegion && !replacing && files.length > 1 && (
          <Trans>Add {files.length} photos</Trans>
        )}
        {!isRegion && !replacing && files.length === 1 && (
          <Trans>Add photo</Trans>
        )}
      </DialogTitle>
      <DialogContent>
        {!comparison && (
          <PendingStyled>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              <Trans>Compressing the photo…</Trans>
            </Typography>
          </PendingStyled>
        )}
        {comparison && (
          <>
            {!isRegion && files.length > 1 && (
              <PickStripStyled>
                {picks.map((pick, index) => (
                  <PickStyled
                    key={pick.file.name}
                    type="button"
                    isActive={pick === shown}
                    isFailed={pick.isFailed}
                    aria-label={pick.file.name}
                    onClick={() => setIdxShown(index)}
                  >
                    {pick.comparison && (
                      <img src={pick.comparison.compressed.url} alt="" />
                    )}
                  </PickStyled>
                ))}
                {isCompressing && <CircularProgress size={20} />}
              </PickStripStyled>
            )}
            {currentUrl ? (
              <PhotoSwap
                currentUrl={currentUrl}
                nextUrl={comparison.compressed.url}
              />
            ) : (
              <PhotoCompare
                original={comparison.original}
                compressed={comparison.compressed}
              />
            )}
            <SummaryStyled variant="body2">
              <BeforeStyled>
                {formatBytes(comparison.original.bytes, i18n.locale)}
              </BeforeStyled>
              {' → '}
              <AfterStyled isSmaller={saved >= 0}>
                {formatBytes(comparison.compressed.bytes, i18n.locale)}
              </AfterStyled>{' '}
              <SavedStyled isSmaller={saved >= 0}>
                {saved >= 0 ? `−${saved}%` : `+${-saved}%`}
              </SavedStyled>
              <BeforeStyled>{' · WebP'}</BeforeStyled>
            </SummaryStyled>
            {!isRegion && sendable.length > 1 && (
              <TotalStyled variant="caption" color="text.secondary">
                <Trans>
                  All {sendable.length}: {formatBytes(before, i18n.locale)} →{' '}
                  {formatBytes(after, i18n.locale)} (
                  {savedAll >= 0 ? `−${savedAll}%` : `+${-savedAll}%`})
                </Trans>
              </TotalStyled>
            )}
            {oversized > 0 && (
              <Alert severity="error">
                {isRegion ? (
                  <Trans>
                    This photo stays over{' '}
                    {formatBytes(MAX_PHOTO_BYTES, i18n.locale)} even compressed.
                  </Trans>
                ) : (
                  <Trans>
                    {oversized} photo(s) stay over{' '}
                    {formatBytes(MAX_PHOTO_BYTES, i18n.locale)} even compressed
                    and will be skipped.
                  </Trans>
                )}
              </Alert>
            )}
            {failed > 0 && (
              <Alert severity="warning">
                {isRegion ? (
                  <Trans>This file could not be read as a photo.</Trans>
                ) : (
                  <Trans>{failed} file(s) could not be read as photos.</Trans>
                )}
              </Alert>
            )}
            {replacing?.hasLines && (
              <Alert severity={drifts ? 'warning' : 'info'}>
                {drifts ? (
                  <Trans>
                    The new photo has different proportions. The lines are kept,
                    but they will sit off the rock until you drag their points
                    onto it.
                  </Trans>
                ) : (
                  <Trans>
                    The lines are kept. The proportions match, so they should
                    land where they are now — check them after replacing.
                  </Trans>
                )}
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={isBusy} onClick={close}>
          <Trans>Cancel</Trans>
        </Button>
        <Button
          variant="contained"
          disabled={sendable.length === 0 || isCompressing || isBusy}
          onClick={upload}
        >
          {isBusy && !isRegion && sendable.length > 1 && (
            <Trans>
              Uploading {uploaded} of {sendable.length}…
            </Trans>
          )}
          {!(isBusy && !isRegion && sendable.length > 1) &&
            (currentUrl ? (
              <Trans>Replace photo</Trans>
            ) : isRegion || sendable.length === 1 ? (
              <Trans>Upload</Trans>
            ) : (
              <Trans>Upload {sendable.length} photos</Trans>
            ))}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadPhotoDialog;

type SendablePick = CompressedPick & { comparison: PhotoComparison };

const isSendable = (pick: CompressedPick): pick is SendablePick =>
  !!pick.comparison && pick.comparison.compressed.bytes <= MAX_PHOTO_BYTES;

const PendingStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  height: min(52vh, 460px);
`;

const PickStripStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  overflow-x: auto;
`;

const PickStyled = styled('button', {
  shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'isFailed'
})<{ isActive: boolean; isFailed: boolean }>`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: ${({ theme }) => theme.palette.action.hover};
  border: 2px solid
    ${({ theme, isActive, isFailed }) =>
      isFailed
        ? theme.palette.error.main
        : isActive
          ? theme.palette.primary.main
          : theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SummaryStyled = styled(Typography)`
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  margin-top: ${({ theme }) => theme.spacing(1.5)};
  font-variant-numeric: tabular-nums;
`;

const TotalStyled = styled(Typography)`
  display: block;
  margin-top: ${({ theme }) => theme.spacing(0.5)};
  text-align: center;
  font-variant-numeric: tabular-nums;
`;

const BeforeStyled = styled('span')`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const AfterStyled = styled('span', {
  shouldForwardProp: (prop) => prop !== 'isSmaller'
})<{ isSmaller: boolean }>`
  font-size: ${({ theme }) => theme.typography.h6.fontSize};
  font-weight: 600;
  color: ${({ theme, isSmaller }) =>
    isSmaller ? theme.palette.success.main : theme.palette.warning.main};
`;

const SavedStyled = styled('span', {
  shouldForwardProp: (prop) => prop !== 'isSmaller'
})<{ isSmaller: boolean }>`
  padding: ${({ theme }) => theme.spacing(0.25, 0.75)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  font-weight: 600;
  color: ${({ theme, isSmaller }) =>
    isSmaller
      ? theme.palette.success.contrastText
      : theme.palette.warning.contrastText};
  background: ${({ theme, isSmaller }) =>
    isSmaller ? theme.palette.success.main : theme.palette.warning.main};
`;
