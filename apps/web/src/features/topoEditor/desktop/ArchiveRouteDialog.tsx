import type { GradeScale } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { useDisplayGrade } from '@web/shared/lib';
import { ConfirmDialog, SubjectStyled } from '@web/shared/ui';

export interface Props {
  routeName: string;
  grade: string;
  gradeScale: GradeScale;
  isNew: boolean;
  open: boolean;
  onConfirm: () => void;
}

const ArchiveRouteDialog = ({
  routeName,
  grade,
  gradeScale,
  isNew,
  open,
  onConfirm
}: Props) => {
  const { closeModal } = useModal();
  const displayGrade = useDisplayGrade();

  const route = (
    <SubjectStyled>
      {routeName}
      {grade && ` · ${displayGrade(grade, gradeScale)}`}
    </SubjectStyled>
  );

  return (
    <ConfirmDialog
      open={open}
      title={<Trans>Move the route to the archive?</Trans>}
      confirmLabel={<Trans>Archive route</Trans>}
      onConfirm={onConfirm}
      onClose={() => closeModal('ARCHIVE_ROUTE')}
    >
      {isNew ? (
        <Trans>
          {route} was never saved, so it just disappears from this panel.
        </Trans>
      ) : (
        <Trans>
          {route} leaves the catalog for everyone, together with its lines on
          every photo. Nothing is erased: the ascents, photos, links and
          comments on it stay, and you can bring the route back from the
          archive.
        </Trans>
      )}
    </ConfirmDialog>
  );
};

export default ArchiveRouteDialog;
