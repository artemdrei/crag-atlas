import { type FormEvent, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { toast } from '@web/shared/lib';

import { useApiCreateRegion } from '../hooks';
import { EditFormStyled } from './EditFormStyled';

export const RegionCreateForm = () => {
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
      <Button
        type="submit"
        variant="contained"
        disabled={!name.trim() || isPending}
      >
        <Trans>Add region</Trans>
      </Button>
    </EditFormStyled>
  );
};
