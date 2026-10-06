import { useLingui } from '@lingui/react/macro';

export type LoginBenefitKind = 'logbook' | 'offline' | 'filters' | 'community';

export interface LoginBenefit {
  kind: LoginBenefitKind;
  title: string;
  description: string;
}

export const useLoginBenefits = (): LoginBenefit[] => {
  const { t } = useLingui();

  return [
    {
      kind: 'logbook',
      title: t`Keep a logbook`,
      description: t`Log your ascents and watch your level grow.`
    },
    {
      kind: 'offline',
      title: t`Offline mode`,
      description: t`Save regions and open them offline.`
    },
    {
      kind: 'filters',
      title: t`Find new routes`,
      description: t`Show only the ones you haven't climbed yet.`
    },
    {
      kind: 'community',
      title: t`Share your experience`,
      description: t`Add photos and comments, and see what others have climbed.`
    }
  ];
};
