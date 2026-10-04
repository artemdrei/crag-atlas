import { describe, expect, it } from 'vitest';

import type { Tick } from '../entities';
import { toRouteSends } from './routeSends';

const tick = (id: string, ascentType: Tick['ascentType'], isRepeat = false) =>
  ({ id, ascentType, isRepeat }) as Tick;

describe('toRouteSends', () => {
  it('takes the first send past any attempts', () => {
    const { firstSend, sendCount, repeats } = toRouteSends([
      tick('tried', 'attempt'),
      tick('first', 'redpoint'),
      tick('again', 'toprope', true)
    ]);

    expect(firstSend?.id).toBe('first');
    expect(sendCount).toBe(2);
    expect(repeats.map(({ id }) => id)).toEqual(['again']);
  });

  it('knows nothing was sent yet', () => {
    expect(toRouteSends([tick('tried', 'attempt')])).toMatchObject({
      firstSend: null,
      sendCount: 0
    });
  });
});
