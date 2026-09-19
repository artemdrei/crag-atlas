import { useState } from 'react';

import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';

import { apiPost } from '@web/shared/api';
import { toast } from '@web/shared/lib';

import type { CreateTick, Tick } from '../entities';

export interface Params {
  onCreated: (tick: Tick) => void;
}

export const useApiCreateTick = ({ onCreated }: Params) => {
  const [isPending, setIsPending] = useState(false);

  const createTick = async (payload: CreateTick) => {
    setIsPending(true);

    try {
      onCreated(await apiPost<Tick>('/ticks', payload));
    } catch (err) {
      toast.error(resolveFailureMessage(toFailure(err)));
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, createTick };
};
