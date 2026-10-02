import type { SearchHit } from '@crag-atlas/api';
import { Plural } from '@lingui/react/macro';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PhishingIcon from '@mui/icons-material/Phishing';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { LocalName } from '@web/shared/ui';

import { searchHitTrail } from '../lib';

export interface Props {
  hit: SearchHit;
}

export const CatalogSearchOption = ({ hit }: Props) => {
  const trail = searchHitTrail(hit);

  return (
    <>
      <TextStyled>
        <NameRowStyled>
          <NameStyled variant="subtitle2" noWrap>
            {hit.name}
            <LocalName name={hit.name} nameLocal={hit.nameLocal} />
          </NameStyled>
          {!!hit.rating && (
            <RatingStyled variant="caption">
              <StarRoundedIcon fontSize="inherit" />
              {hit.rating.toFixed(1)}
            </RatingStyled>
          )}
        </NameRowStyled>
        <MetaRowStyled variant="caption" noWrap>
          {!!trail && <TrailStyled>{trail}</TrailStyled>}
          {!!hit.ascentsCount && (
            <CountStyled>
              <Plural
                value={hit.ascentsCount}
                one="# ascent"
                other="# ascents"
              />
            </CountStyled>
          )}
          {!!hit.boltsCount && (
            <BoltsStyled>
              <PhishingIcon fontSize="inherit" />
              {hit.boltsCount}
            </BoltsStyled>
          )}
        </MetaRowStyled>
      </TextStyled>
      <ChevronStyled fontSize="small" />
    </>
  );
};

const TextStyled = styled('div')`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
`;

const NameRowStyled = styled('div')`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(0.75)};
`;

const NameStyled = styled(Typography)`
  min-width: 0;
` as typeof Typography;

const MetaRowStyled = styled(Typography)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.75)};
  color: ${({ theme }) => theme.palette.text.secondary};

  & > * + *::before {
    content: '·';
    margin-right: ${({ theme }) => theme.spacing(0.75)};
  }
` as typeof Typography;

const TrailStyled = styled('span')`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CountStyled = styled('span')`
  flex-shrink: 0;
`;

const BoltsStyled = styled('span')`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.25)};
`;

const RatingStyled = styled(Typography)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.25)};
  flex-shrink: 0;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-variant-numeric: tabular-nums;
` as typeof Typography;

const ChevronStyled = styled(ChevronRightIcon)`
  flex-shrink: 0;
  color: ${({ theme }) => theme.palette.text.disabled};
`;
