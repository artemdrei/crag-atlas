import { Link } from 'react-router';

import Breadcrumbs from '@mui/material/Breadcrumbs';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Crumb {
  label: string;
  to?: string;
}

export interface Props {
  items: Crumb[];
  /** Above this many crumbs the head collapses into an expandable "…". */
  maxItems?: number;
}

/** Ids in the URL are uuids, so the trail is the only place a name appears. */
export const PageBreadcrumbs = ({ items, maxItems }: Props) => (
  <Breadcrumbs
    maxItems={maxItems}
    itemsBeforeCollapse={0}
    itemsAfterCollapse={2}
  >
    {items.map((item) =>
      item.to ? (
        <LinkStyled key={item.label} to={item.to}>
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

const LinkStyled = styled(Link)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;
