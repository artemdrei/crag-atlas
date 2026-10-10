import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { BottomSheet } from '@web/shared/ui';

import {
  ConditionsPanel,
  type ConditionsPlace,
  useApiGetPlaceForecast
} from '../common';

export interface Props {
  open: boolean;
  place: ConditionsPlace;
}

const ConditionsSheetMobile = ({ open, place }: Props) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const { conditions, isLoading, isOffline, failure } =
    useApiGetPlaceForecast(place);

  return (
    <BottomSheet
      title={t`Weather`}
      isOpen={open}
      onClose={() => closeModal('CONDITIONS')}
    >
      <ConditionsPanel
        isOpenByDefault
        list={place.list}
        conditions={conditions}
        failure={failure}
        isLoading={isLoading}
        isOffline={isOffline}
      />
    </BottomSheet>
  );
};

export default ConditionsSheetMobile;
