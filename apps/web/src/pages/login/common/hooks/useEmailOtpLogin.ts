import { useState } from 'react';

import { track } from '@crag-atlas/analytics';
import { resolveFailureMessage } from '@crag-atlas/utils';

import { rememberLoginAttempt, toast } from '@web/shared/lib';
import { supabase, toAuthFailure } from '@web/shared/supabase';

export type EmailOtpStep = 'email' | 'code';

export interface Params {
  onVerified: () => void;
}

export const useEmailOtpLogin = ({ onVerified }: Params) => {
  const [step, setStep] = useState<EmailOtpStep>('email');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const sendCode = async (email: string) => {
    setIsSending(true);

    try {
      track({ name: 'Login Attempted', props: { method: 'email' } });
      rememberLoginAttempt('email');

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true }
      });

      if (error) throw error;

      setStep('code');
    } catch (err) {
      toast.error(resolveFailureMessage(toAuthFailure(err)));
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async (email: string, token: string) => {
    setIsVerifying(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) throw error;

      onVerified();
    } catch (err) {
      toast.error(resolveFailureMessage(toAuthFailure(err)));
    } finally {
      setIsVerifying(false);
    }
  };

  const resetToEmailStep = () => setStep('email');

  return {
    step,
    isSending,
    isVerifying,
    sendCode,
    verifyCode,
    resetToEmailStep
  };
};
