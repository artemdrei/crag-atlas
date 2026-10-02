import type { GradeScale } from '@crag-atlas/api';
import { styled } from '@mui/material/styles';

import { useDisplayGrade } from '@web/shared/lib';
import type { GradeTone } from '@web/shared/theme/palette';
import { resolveGradeTone } from '@web/shared/theme/palette';

export interface Props {
  number: number;
  grade: string;
  gradeScale: GradeScale;
  name?: string;
  x: number;
  y: number;
  isDimmed?: boolean;
  onSelect?: () => void;
  onHover?: (isOver: boolean) => void;
}

export const TopoRouteBadge = ({
  number,
  grade,
  gradeScale,
  name,
  x,
  y,
  isDimmed,
  onSelect,
  onHover
}: Props) => {
  const displayGrade = useDisplayGrade();

  const tone = resolveGradeTone(grade, gradeScale);
  const shownGrade = displayGrade(grade, gradeScale);

  const alignment = toAlignment(x);

  return (
    <BadgeStyled
      // The photo under it is itself a button, and buttons cannot nest.
      as={onSelect ? 'button' : 'span'}
      type={onSelect ? 'button' : undefined}
      x={x}
      y={y}
      alignment={alignment}
      isDimmed={!!isDimmed}
      isStatic={!onSelect}
      onClick={onSelect}
      onPointerEnter={() => onHover?.(true)}
      onPointerLeave={() => onHover?.(false)}
    >
      <GradeStyled tone={tone}>
        {name ? `${name} · ${shownGrade}` : shownGrade}
      </GradeStyled>
      <NumberStyled>{number}</NumberStyled>
    </BadgeStyled>
  );
};

type Alignment = 'start' | 'center' | 'end';

const EDGE_ZONE = 0.25;

const toAlignment = (x: number): Alignment => {
  if (x < EDGE_ZONE) return 'start';

  return x > 1 - EDGE_ZONE ? 'end' : 'center';
};

const CHIP_HALF = '11px';

const ITEMS_ALIGNMENT: Record<Alignment, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end'
};

const TRANSFORMS: Record<Alignment, string> = {
  start: `translate(-${CHIP_HALF}, -50%)`,
  center: 'translate(-50%, -50%)',
  end: `translate(calc(-100% + ${CHIP_HALF}), -50%)`
};

const BadgeStyled = styled('button', {
  shouldForwardProp: (prop) =>
    prop !== 'x' &&
    prop !== 'y' &&
    prop !== 'alignment' &&
    prop !== 'isDimmed' &&
    prop !== 'isStatic'
})<{
  x: number;
  y: number;
  alignment: Alignment;
  isDimmed: boolean;
  isStatic: boolean;
}>`
  position: absolute;
  left: ${({ x }) => x * 100}%;
  top: ${({ y }) => y * 100}%;
  transform: ${({ alignment }) => TRANSFORMS[alignment]};
  display: flex;
  flex-direction: column;
  align-items: ${({ alignment }) => ITEMS_ALIGNMENT[alignment]};
  gap: ${({ theme }) => theme.spacing(0.25)};
  padding: 0;
  border: none;
  background: none;
  opacity: ${({ isDimmed }) => (isDimmed ? 0.35 : 1)};
  transition: opacity 0.15s ease-out;

  /* A label, not a control: it must not eat a click meant for the photo. */
  cursor: ${({ isStatic }) => (isStatic ? 'inherit' : 'pointer')};
  pointer-events: ${({ isStatic }) => (isStatic ? 'none' : 'auto')};
`;

const GradeStyled = styled('span', {
  shouldForwardProp: (prop) => prop !== 'tone'
})<{ tone: GradeTone }>`
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 2px ${({ theme }) => theme.spacing(0.75)};
  border-radius: 999px;
  background: ${({ theme, tone }) => theme.palette.grade[tone].background};
  color: ${({ theme, tone }) => theme.palette.grade[tone].text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;
  filter: drop-shadow(0 0 2px rgb(0 0 0 / 60%));
`;

const NumberStyled = styled('span')`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 ${({ theme }) => theme.spacing(0.5)};
  border-radius: 11px;
  background: rgb(0 0 0 / 55%);
  color: rgb(255 255 255 / 80%);
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: 600;
  line-height: 1;
`;
