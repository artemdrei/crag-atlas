import { type MouseEvent, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import { styled } from '@mui/material/styles';

import { useDisplayGrade } from '@web/shared/lib';

import { VIDEO_SORTS, type VideoFilters, type VideoSort } from '../entities';
import { FilterPill } from './FilterPill';
import { GradePicker } from './GradePicker';

type Open = 'grade' | 'sort' | null;

export interface Props {
  filters: VideoFilters;
  onChange: (next: Partial<VideoFilters>) => void;
}

export const VideoFilterPills = ({ filters, onChange }: Props) => {
  const { t } = useLingui();
  const displayGrade = useDisplayGrade();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState<Open>(null);

  const handleOpen = (menu: Open) => (event: MouseEvent<HTMLButtonElement>) => {
    setAnchor(event.currentTarget);
    setOpen(menu);
  };

  const handleClose = () => setOpen(null);

  const choose = (next: Partial<VideoFilters>) => {
    onChange(next);
    handleClose();
  };

  const gradeLabel = (grade: string) => displayGrade(grade, 'french');
  const hasGrade = !!filters.gradeFrom || !!filters.gradeTo;

  const sortLabels: Record<VideoSort, string> = {
    newest: t`Newest first`,
    oldest: t`Oldest first`
  };

  return (
    <>
      <FilterPill
        label={
          hasGrade
            ? `${filters.gradeFrom ? gradeLabel(filters.gradeFrom) : '…'}–${
                filters.gradeTo ? gradeLabel(filters.gradeTo) : '…'
              }`
            : t`Grade`
        }
        isActive={hasGrade}
        onClick={handleOpen('grade')}
      />
      <FilterPill
        icon={<SwapVertIcon fontSize="small" />}
        label={sortLabels[filters.sort]}
        isActive={filters.sort !== 'newest'}
        onClick={handleOpen('sort')}
      />

      <Popover
        open={open === 'grade'}
        anchorEl={anchor}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        onClose={handleClose}
      >
        <GradeRangeStyled>
          <GradePicker
            label={t({ message: 'From', context: 'grade range' })}
            grade={filters.gradeFrom}
            max={filters.gradeTo}
            onChange={(gradeFrom) => onChange({ gradeFrom })}
          />
          <GradePicker
            label={t({ message: 'To', context: 'grade range' })}
            grade={filters.gradeTo}
            min={filters.gradeFrom}
            onChange={(gradeTo) => onChange({ gradeTo })}
          />
          <Button
            size="small"
            disabled={!hasGrade}
            onClick={() => choose({ gradeFrom: '', gradeTo: '' })}
          >
            <Trans>Reset</Trans>
          </Button>
        </GradeRangeStyled>
      </Popover>

      <Menu open={open === 'sort'} anchorEl={anchor} onClose={handleClose}>
        {VIDEO_SORTS.map((sort) => (
          <MenuItem
            key={sort}
            selected={filters.sort === sort}
            onClick={() => choose({ sort })}
          >
            {sortLabels[sort]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const GradeRangeStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(2)};
`;
