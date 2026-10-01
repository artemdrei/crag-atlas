import { Link } from 'react-router';

import { useLingui } from '@lingui/react/macro';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { catalogIdsOfPath, trackCatalogItemOpened } from '@web/shared/lib';

export interface Crumb {
  label: string;
  to?: string;
}

export interface Props {
  items: Crumb[];
  maxItems?: number;
}

const trackCrumb = (label: string, to?: string) => {
  const ids = to ? catalogIdsOfPath(to) : {};

  if (!ids.idRegion) return;

  trackCatalogItemOpened({
    name: label,
    source: 'breadcrumb',
    ...ids,
    idRegion: ids.idRegion
  });
};

export const PageBreadcrumbs = ({ items, maxItems }: Props) => {
  const { t } = useLingui();

  return (
    <Breadcrumbs
      // A landmark without a name is announced as just "navigation".
      aria-label={t`Breadcrumb`}
      maxItems={maxItems}
      itemsBeforeCollapse={0}
      itemsAfterCollapse={2}
    >
      {items.map((item) =>
        item.to ? (
          <LinkStyled
            key={item.label}
            to={item.to}
            onClick={() => trackCrumb(item.label, item.to)}
          >
            {item.label}
          </LinkStyled>
        ) : (
          <Typography key={item.label} color="text.primary">
            {item.label}
          </Typography>
        )
      )}
    </Breadcrumbs>
  );
};

const LinkStyled = styled(Link)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;
