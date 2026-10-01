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
  isHighlighted?: boolean;
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
  isHighlighted,
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
      <NumberStyled tone={tone} isHighlighted={!!isHighlighted}>
        {number}
      </NumberStyled>
      <GradeStyled>{name ? `${name} · ${shownGrade}` : shownGrade}</GradeStyled>
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
  flex-direction: ${({ alignment }) =>
    alignment === 'end' ? 'row-reverse' : 'row'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: 0;
  border: none;
  background: none;
  opacity: ${({ isDimmed }) => (isDimmed ? 0.35 : 1)};
  transition: opacity 0.15s ease-out;

  /* A label, not a control: it must not eat a click meant for the photo. */
  cursor: ${({ isStatic }) => (isStatic ? 'inherit' : 'pointer')};
  pointer-events: ${({ isStatic }) => (isStatic ? 'none' : 'auto')};
`;

const NumberStyled = styled('span', {
  shouldForwardProp: (prop) => prop !== 'tone' && prop !== 'isHighlighted'
})<{ tone: GradeTone; isHighlighted: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 ${({ theme }) => theme.spacing(0.5)};
  border-radius: 11px;
  border: 2px solid
    ${({ theme, isHighlighted }) =>
      isHighlighted ? theme.palette.background.paper : 'transparent'};
  background: ${({ theme, tone }) => theme.palette.grade[tone].background};
  color: ${({ theme, tone }) => theme.palette.grade[tone].text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: 700;
  line-height: 1;
  filter: drop-shadow(0 0 2px rgb(0 0 0 / 60%));
`;

const GradeStyled = styled('span')`
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 1px ${({ theme }) => theme.spacing(0.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: rgb(0 0 0 / 55%);
  color: ${({ theme }) => theme.palette.common.white};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
`;
