import { type ReactNode, useMemo, useState } from 'react';

import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { Trans, useLingui } from '@lingui/react/macro';
import CropIcon from '@mui/icons-material/Crop';
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
import {
  formatBytes,
  savedPercent,
  signedPercent,
  toast,
  useImageCrop
} from '@web/shared/lib';
import { ImageCropper } from '@web/shared/ui';

import type { CompressedPick, PhotoComparison } from '../common';
import {
  useApiReplaceRegionPhoto,
  useApiReplaceTopoPhoto,
  useApiUploadTopo,
  usePhotoCompression
} from '../common';
import { PhotoCompare, PhotoSwap } from './ui';
import { STAGE_HEIGHT } from './ui/stage';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const ASPECT_TOLERANCE = 0.01;

export interface ReplacedTopo {
  idTopo: string;
  photoUrl: string;
  ratio: number;
  hasLines: boolean;
}

interface TopoTarget {
  kind: 'topo';
  idSector: string;
}

interface RegionTarget {
  kind: 'region';
  idRegion: string;
  photoUrl?: string | null;
}

interface TopoUpload {
  target: TopoTarget;
  files: File[];
  replacing?: ReplacedTopo;
  open: boolean;
}

interface RegionUpload {
  target: RegionTarget;
  file: File;
  open: boolean;
}

export type Props = TopoUpload | RegionUpload;

// TypeScript cannot narrow the union on `target.kind`: the discriminant is a
// level down.
const isRegionUpload = (props: Props): props is RegionUpload =>
  props.target.kind === 'region';

const UploadPhotoDialog = (props: Props) =>
  isRegionUpload(props) ? (
    <UploadRegionPhoto
      target={props.target}
      file={props.file}
      open={props.open}
    />
  ) : (
    <UploadTopoPhoto
      target={props.target}
      files={props.files}
      replacing={props.replacing}
      open={props.open}
    />
  );

export default UploadPhotoDialog;

const UploadRegionPhoto = ({ target, file, open }: RegionUpload) => {
  const { t } = useLingui();
  // The compression effect keys off the array, and a fresh `[file]` every
  // render restarts it forever.
  const files = useMemo(() => [file], [file]);

  const { isPending, replaceRegionPhoto } = useApiReplaceRegionPhoto({
    idRegion: target.idRegion
  });

  const currentUrl = target.photoUrl ?? undefined;

  const upload = async ([first]: SendablePick[]) => {
    if (!first) return;

    await replaceRegionPhoto(first.comparison.blob);
    toast.success(currentUrl ? t`Photo replaced` : t`Photo uploaded`);
  };

  return (
    <UploadDialogBody
      currentUrl={currentUrl}
      files={files}
      title={
        currentUrl ? (
          <Trans>Replace the cover photo</Trans>
        ) : (
          <Trans>Add a cover photo</Trans>
        )
      }
      isBatch={false}
      isBusy={isPending}
      open={open}
      onUpload={upload}
    />
  );
};

const UploadTopoPhoto = ({ target, files, replacing, open }: TopoUpload) => {
  const { t } = useLingui();
  const [uploaded, setUploaded] = useState(0);

  const { isPending: isUploading, uploadTopo } = useApiUploadTopo({
    idSector: target.idSector
  });
  const { isPending: isReplacing, replaceTopoPhoto } = useApiReplaceTopoPhoto({
    idSector: target.idSector
  });

  const upload = async (sendable: SendablePick[]) => {
    if (replacing) {
      const [first] = sendable;

      if (!first) return;

      const { blob, compressed } = first.comparison;

      await replaceTopoPhoto({
        idTopo: replacing.idTopo,
        blob,
        width: compressed.width,
        height: compressed.height
      });
      toast.success(t`Photo replaced`);

      return;
    }

    // A photo's place in the sector is the order it arrived in.
    for (const { comparison: photo } of sendable) {
      await uploadTopo({
        blob: photo.blob,
        width: photo.compressed.width,
        height: photo.compressed.height
      });
      setUploaded((count) => count + 1);
    }

    toast.success(sendable.length > 1 ? t`Photos uploaded` : t`Photo uploaded`);
  };

  return (
    <UploadDialogBody
      currentUrl={replacing?.photoUrl}
      files={files}
      replacing={replacing}
      title={
        replacing ? (
          <Trans>Replace photo</Trans>
        ) : files.length > 1 ? (
          <Trans>Add {files.length} photos</Trans>
        ) : (
          <Trans>Add photo</Trans>
        )
      }
      isBatch
      isBusy={isUploading || isReplacing}
      open={open}
      uploaded={uploaded}
      onUpload={upload}
    />
  );
};

interface UploadDialogBodyProps {
  currentUrl?: string;
  files: File[];
  replacing?: ReplacedTopo;
  title: ReactNode;
  isBatch: boolean;
  isBusy: boolean;
  open: boolean;
  uploaded?: number;
  onUpload: (sendable: SendablePick[]) => Promise<void>;
}

const UploadDialogBody = ({
  currentUrl,
  files,
  replacing,
  title,
  isBatch,
  isBusy,
  open,
  uploaded = 0,
  onUpload
}: UploadDialogBodyProps) => {
  const { i18n } = useLingui();
  const { closeModal } = useModal();
  const [idxShown, setIdxShown] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const cropper = useImageCrop();

  const { isCompressing, picks, applyCrop } = usePhotoCompression(files);

  const close = () => closeModal('UPLOAD_PHOTO');

  const shown = picks[Math.min(idxShown, picks.length - 1)];
  const comparison = shown?.comparison;
  const { failed, sendable, oversized, before, after } = useMemo(() => {
    const sent = picks.filter(isSendable);

    return {
      failed: picks.filter(({ isFailed }) => isFailed).length,
      sendable: sent,
      oversized: picks.filter(
        (pick) => (pick.comparison?.compressed.bytes ?? 0) > MAX_PHOTO_BYTES
      ).length,
      before: sent.reduce(
        (sum, { comparison: photo }) => sum + photo.original.bytes,
        0
      ),
      after: sent.reduce(
        (sum, { comparison: photo }) => sum + photo.compressed.bytes,
        0
      )
    };
  }, [picks]);
  const isUploadingBatch = isBusy && sendable.length > 1;
  const savedAll = savedPercent(before, after);
  const saved = comparison
    ? savedPercent(comparison.original.bytes, comparison.compressed.bytes)
    : 0;

  const drifts =
    !!replacing &&
    replacing.ratio > 0 &&
    !!comparison &&
    Math.abs(comparison.ratio - replacing.ratio) / replacing.ratio >
      ASPECT_TOLERANCE;

  const crop = async () => {
    if (cropper.crop) await applyCrop(idxShown, cropper.crop);

    setIsCropping(false);
  };

  const cropActions = (
    <>
      <Button size="small" color="inherit" onClick={() => setIsCropping(false)}>
        <Trans>Cancel</Trans>
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        disabled={!cropper.crop}
        onClick={crop}
      >
        <Trans>Apply</Trans>
      </Button>
    </>
  );

  const upload = async () => {
    if (sendable.length === 0) return;

    try {
      await onUpload(sendable);
      close();
    } catch (error) {
      toast.error(resolveFailureMessage(toFailure(error)));
    }
  };

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={close}>
      <DialogTitle>{title}</DialogTitle>
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
            {files.length > 1 && (
              <PickStripStyled>
                {picks.map((pick, index) => (
                  <PickStyled
                    key={pick.file.name}
                    type="button"
                    isActive={pick === shown}
                    isFailed={pick.isFailed}
                    aria-label={pick.file.name}
                    onClick={() => {
                      setIsCropping(false);
                      setIdxShown(index);
                    }}
                  >
                    {pick.comparison && (
                      <img src={pick.comparison.compressed.url} alt="" />
                    )}
                  </PickStyled>
                ))}
                {isCompressing && <CircularProgress size={20} />}
              </PickStripStyled>
            )}
            <ToolbarStyled>
              <Button
                variant="outlined"
                startIcon={<CropIcon />}
                disabled={isBusy || isCompressing}
                onClick={() => setIsCropping((current) => !current)}
              >
                {isCropping ? (
                  <Trans>Keep the whole photo</Trans>
                ) : (
                  <Trans>Crop</Trans>
                )}
              </Button>
            </ToolbarStyled>
            {isCropping ? (
              <StageStyled>
                <ImageCropper
                  src={comparison.original.url}
                  aspect={cropper.aspect}
                  position={cropper.position}
                  zoom={cropper.zoom}
                  action={cropActions}
                  onAspectChange={cropper.changeAspect}
                  onPositionChange={cropper.setPosition}
                  onZoomChange={cropper.setZoom}
                  onCropChange={cropper.setCrop}
                />
              </StageStyled>
            ) : currentUrl ? (
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
            {/* Hidden rather than unmounted while cropping: the figures
                describe the whole photo and say nothing about the part being
                kept, but dropping them would shrink the dialog under the
                cursor. */}
            <FiguresStyled isHidden={isCropping}>
              <SummaryStyled variant="body2">
                <BeforeStyled>
                  {formatBytes(comparison.original.bytes, i18n.locale)}
                </BeforeStyled>
                {' → '}
                <AfterStyled isSmaller={saved >= 0}>
                  {formatBytes(comparison.compressed.bytes, i18n.locale)}
                </AfterStyled>{' '}
                <SavedStyled isSmaller={saved >= 0}>
                  {signedPercent(saved)}
                </SavedStyled>
                <BeforeStyled>{' · WebP'}</BeforeStyled>
              </SummaryStyled>
              {sendable.length > 1 && (
                <TotalStyled variant="caption" color="text.secondary">
                  <Trans>
                    All {sendable.length}: {formatBytes(before, i18n.locale)} →{' '}
                    {formatBytes(after, i18n.locale)} ({signedPercent(savedAll)}
                    )
                  </Trans>
                </TotalStyled>
              )}
            </FiguresStyled>
            {oversized > 0 && (
              <Alert severity="error">
                {isBatch ? (
                  <Trans>
                    {oversized} photo(s) stay over{' '}
                    {formatBytes(MAX_PHOTO_BYTES, i18n.locale)} even compressed
                    and will be skipped.
                  </Trans>
                ) : (
                  <Trans>
                    This photo stays over{' '}
                    {formatBytes(MAX_PHOTO_BYTES, i18n.locale)} even compressed.
                  </Trans>
                )}
              </Alert>
            )}
            {failed > 0 && (
              <Alert severity="warning">
                {isBatch ? (
                  <Trans>{failed} file(s) could not be read as photos.</Trans>
                ) : (
                  <Trans>This file could not be read as a photo.</Trans>
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
          disabled={
            sendable.length === 0 || isCompressing || isBusy || isCropping
          }
          onClick={upload}
        >
          {isUploadingBatch ? (
            <Trans>
              Uploading {uploaded} of {sendable.length}…
            </Trans>
          ) : currentUrl ? (
            <Trans>Replace photo</Trans>
          ) : sendable.length > 1 ? (
            <Trans>Upload {sendable.length} photos</Trans>
          ) : (
            <Trans>Upload</Trans>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type SendablePick = CompressedPick & { comparison: PhotoComparison };

const isSendable = (pick: CompressedPick): pick is SendablePick =>
  !!pick.comparison && pick.comparison.compressed.bytes <= MAX_PHOTO_BYTES;

const StageStyled = styled('div')`
  position: relative;
  height: ${STAGE_HEIGHT};
`;

const ToolbarStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const PendingStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  height: ${STAGE_HEIGHT};
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

const FiguresStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isHidden'
})<{ isHidden: boolean }>`
  visibility: ${({ isHidden }) => (isHidden ? 'hidden' : 'visible')};
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
