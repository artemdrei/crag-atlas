import { useLingui } from '@lingui/react/macro';

import { BottomSheet } from '@web/shared/ui';

import { RouteCommentForm, useEditRouteComment } from '../common';

export interface Props {
  open: boolean;
  idRoute: string;
  idComment: string;
  body: string;
}

const EditRouteCommentSheet = ({ open, idRoute, idComment, body }: Props) => {
  const { t } = useLingui();
  const { isPending, close, saveComment } = useEditRouteComment({
    idRoute,
    idComment
  });

  return (
    <BottomSheet title={t`Edit comment`} isOpen={open} onClose={close}>
      <RouteCommentForm
        submitLabel={t`Save`}
        initialBody={body}
        isPending={isPending}
        onSubmit={saveComment}
        onCancel={close}
      />
    </BottomSheet>
  );
};

export default EditRouteCommentSheet;
