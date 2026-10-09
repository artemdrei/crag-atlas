import type { RockType } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';

export const useRockTypeLabels = (): Record<RockType, string> => {
  const { t } = useLingui();

  return {
    limestone: t`Limestone`,
    sandstone: t`Sandstone`,
    granite: t`Granite`,
    gneiss: t`Gneiss`,
    basalt: t`Basalt`,
    conglomerate: t`Conglomerate`,
    other: t`Other rock`
  };
};

export interface Props {
  rockType: RockType;
}

export const RockTypeLabel = ({ rockType }: Props) => {
  const labels = useRockTypeLabels();

  return <>{labels[rockType]}</>;
};
