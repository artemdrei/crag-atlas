import { useState } from 'react';

import { useLingui } from '@lingui/react/macro';

import { useUser } from '@web/app/providers';

import { useApiCreateRouteComment } from '../hooks';
import { RouteCommentForm } from './RouteCommentForm';

export interface Props {
  idRoute: string;
}

export const RouteCommentComposer = ({ idRoute }: Props) => {
  const { t } = useLingui();
  const { isAuthenticated } = useUser();
  // Remounting clears the field; the form owns its text.
  const [formKey, setFormKey] = useState(0);

  const { isPending, createComment } = useApiCreateRouteComment({
    idRoute,
    onCreated: () => setFormKey((key) => key + 1)
  });

  if (!isAuthenticated) return null;

  return (
    <RouteCommentForm
      key={formKey}
      submitLabel={t`Post`}
      isPending={isPending}
      onSubmit={(body) => createComment({ body })}
    />
  );
};
