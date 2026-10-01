import { useState } from 'react';

import { track } from '@crag-atlas/analytics';
import { resolveFailureMessage } from '@crag-atlas/utils';

import { rememberLoginAttempt, toast } from '@web/shared/lib';
import { supabase, toAuthFailure } from '@web/shared/supabase';

export interface Params {
  redirectPath: string;
}

export const useGoogleLogin = ({ redirectPath }: Params) => {
  const [isPending, setIsPending] = useState(false);

  const signInWithGoogle = async () => {
    setIsPending(true);

    try {
      track({ name: 'Login Attempted', props: { method: 'google' } });
      rememberLoginAttempt('google');

      // A full-page redirect follows, so router state can't carry the
      // destination — `redirectTo` is the only thing that survives it.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${redirectPath}` }
      });

      if (error) throw error;
    } catch (err) {
      toast.error(resolveFailureMessage(toAuthFailure(err)));
      setIsPending(false);
    }
  };

  return { isPending, signInWithGoogle };
};
