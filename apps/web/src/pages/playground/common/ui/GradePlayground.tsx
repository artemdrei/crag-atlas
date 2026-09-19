import { GradeBadge } from '@web/shared/ui';

import { PlaygroundSection } from './PlaygroundSection';

const GRADES = [
  '5a',
  '5c+',
  '6a',
  '6c+',
  '7a',
  '7c+',
  '8a',
  '8c+',
  '9a',
  '9c',
  '5a-8b',
  'project'
];

export const GradePlayground = () => (
  <PlaygroundSection title="Grade badges">
    {GRADES.map((grade) => (
      <GradeBadge key={grade} grade={grade} />
    ))}
  </PlaygroundSection>
);
