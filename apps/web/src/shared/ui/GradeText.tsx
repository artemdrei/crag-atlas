import type { GradeScale } from '@crag-atlas/api';
import { styled } from '@mui/material/styles';

import { useDisplayGrade } from '@web/shared/lib';

export interface Props {
  grade: string;
  scale: GradeScale;
}

export const GradeText = ({ grade, scale }: Props) => {
  const displayGrade = useDisplayGrade();

  if (!grade) return null;

  return <GradeStyled>{displayGrade(grade, scale)}</GradeStyled>;
};

const GradeStyled = styled('span')`
  font-weight: 600;
`;
