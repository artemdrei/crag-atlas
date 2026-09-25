import { type FormEvent, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import TextField from '@mui/material/TextField';

import { toast } from '@web/shared/lib';

import { useApiCreateRegion } from '../hooks';
import { EditActions } from './EditActions';
import { EditFormStyled } from './EditFormStyled';

export interface Props {
  onClose?: () => void;
}

export const RegionCreateForm = ({ onClose }: Props) => {
  const { t } = useLingui();
  const [name, setName] = useState('');
  const [province, setProvince] = useState('');
  const [rockType, setRockType] = useState('');

  const { isPending, createRegion } = useApiCreateRegion({
    onCreated: (region) => {
      setName('');
      setProvince('');
      setRockType('');
      toast.success(t`Region ${region.name} created`);
    }
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    createRegion({
      name: name.trim(),
      province: province.trim(),
      rockType: rockType.trim()
    });
  };

  return (
    <EditFormStyled onSubmit={handleSubmit}>
      <TextField
        fullWidth
        size="small"
        label={t`Name`}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <TextField
        fullWidth
        size="small"
        label={t`Province`}
        value={province}
        onChange={(event) => setProvince(event.target.value)}
      />
      <TextField
        fullWidth
        size="small"
        label={t`Rock type`}
        value={rockType}
        onChange={(event) => setRockType(event.target.value)}
      />
      <EditActions
        submitLabel={<Trans>Add region</Trans>}
        isPending={isPending}
        isDisabled={!name.trim()}
        onCancel={onClose}
      />
    </EditFormStyled>
  );
};
