import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { TEXT_LIMITS } from './textLimits';

const WEB_COPY = join(
  __dirname,
  '../../../../../packages/utils/src/textLimits.ts'
);

const readWebLimits = (): Record<string, number> => {
  const source = readFileSync(WEB_COPY, 'utf8');
  const literal = /TEXT_LIMITS = (\{[^}]*\})/.exec(source)?.[1];

  if (!literal) throw new Error(`No TEXT_LIMITS literal in ${WEB_COPY}`);

  return new Function(`return ${literal}`)();
};

describe('TEXT_LIMITS', () => {
  it('matches the copy the web app reads', () => {
    expect({ ...TEXT_LIMITS }).toEqual(readWebLimits());
  });
});
