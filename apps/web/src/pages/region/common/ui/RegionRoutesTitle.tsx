import { Plural, Trans } from '@lingui/react/macro';

export interface Props {
  routesCount: number;
  sectorsCount: number;
  isFiltered: boolean;
}

export const RegionRoutesTitle = ({
  routesCount,
  sectorsCount,
  isFiltered
}: Props) => {
  const routes = <Plural value={routesCount} one="# route" other="# routes" />;

  if (!isFiltered) return routes;

  return (
    <Trans>
      {routes} in{' '}
      <Plural value={sectorsCount} one="# sector" other="# sectors" />
    </Trans>
  );
};
