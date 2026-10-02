import { useLingui } from '@lingui/react/macro';
import Autocomplete, {
  type AutocompleteProps
} from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';

import { useOpenCatalogItem } from '@web/app/router/useOpenCatalogItem';

import { useCatalogSearch } from '../hooks';
import { MIN_SEARCH_LENGTH, type SearchOption } from '../lib';
import { CatalogSearchField } from './CatalogSearchField';
import { CatalogSearchGroup } from './CatalogSearchGroup';
import { CatalogSearchOption } from './CatalogSearchOption';

type Slots = AutocompleteProps<SearchOption, false, false, false>['slots'];

export interface Props {
  placeholder?: string;
  className?: string;
  isAutoFocused?: boolean;
  slots?: Slots;
  onBlur?: (query: string) => void;
  onPick?: () => void;
}

export const CatalogSearchBox = ({
  placeholder,
  className,
  isAutoFocused,
  slots,
  onBlur,
  onPick
}: Props) => {
  const { t } = useLingui();
  const openCatalogItem = useOpenCatalogItem();
  const {
    query,
    options,
    isLoading,
    isActive,
    isShown,
    open,
    close,
    clear,
    change
  } = useCatalogSearch();

  return (
    <Autocomplete
      disablePortal={false}
      clearOnBlur={false}
      forcePopupIcon={false}
      className={className}
      options={options}
      open={isShown}
      loading={isLoading}
      value={null}
      inputValue={query}
      slots={slots}
      filterOptions={(all) => all}
      groupBy={(option) => option.group}
      getOptionLabel={(option) => option.hit.name}
      loadingText={t`Searching…`}
      noOptionsText={
        isActive
          ? t`Nothing found`
          : t`Type at least ${MIN_SEARCH_LENGTH} letters`
      }
      renderInput={(params) => (
        <CatalogSearchField
          params={params}
          placeholder={placeholder ?? t`Search a region, sector or route`}
          isAutoFocused={isAutoFocused}
          onBlur={() => onBlur?.(query)}
        />
      )}
      renderGroup={({ key, group, children }) => (
        <CatalogSearchGroup key={key} group={group as SearchOption['group']}>
          {children}
        </CatalogSearchGroup>
      )}
      renderOption={({ key, ...props }, option) => (
        <OptionStyled key={key} {...props}>
          <CatalogSearchOption hit={option.hit} />
        </OptionStyled>
      )}
      onOpen={open}
      onClose={close}
      onInputChange={(_event, next, reason) => {
        if (reason !== 'reset') change(next);
      }}
      onChange={(_event, option) => {
        if (!option) return;

        clear();
        onPick?.();
        openCatalogItem('search', option.hit);
      }}
    />
  );
};

const OptionStyled = styled('li')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1, 2)};
  cursor: pointer;

  &[aria-selected='true'],
  &.Mui-focused,
  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;
