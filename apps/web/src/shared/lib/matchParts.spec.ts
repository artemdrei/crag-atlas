import { describe, expect, it } from 'vitest';

import { matchParts } from './matchParts';

describe('matchParts', () => {
  it('marks every match, whatever its case', () => {
    expect(matchParts('Pyrih i pyrizhok', 'PYR')).toEqual([
      { text: 'Pyr', isMatch: true },
      { text: 'ih i ', isMatch: false },
      { text: 'pyr', isMatch: true },
      { text: 'izhok', isMatch: false }
    ]);
  });

  it('leaves the text whole without a query', () => {
    expect(matchParts('Bastard', '  ')).toEqual([
      { text: 'Bastard', isMatch: false }
    ]);
  });

  it('finds a match in a local spelling', () => {
    expect(matchParts('Бастард', 'аст')).toEqual([
      { text: 'Б', isMatch: false },
      { text: 'аст', isMatch: true },
      { text: 'ард', isMatch: false }
    ]);
  });
});
