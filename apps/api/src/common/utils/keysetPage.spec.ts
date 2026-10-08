import { describe, expect, it } from 'vitest';

import { ValidationException } from '../exceptions/app.exception';
import { applyCursor, toPage } from './keysetPage';

const ID = '0f8fad5b-d9cb-469f-a165-70867728950e';

const query = () => {
  const calls: string[] = [];
  const q = {
    calls,
    or(filters: string) {
      calls.push(filters);
      return this;
    }
  };

  return q;
};

describe('applyCursor', () => {
  it('leaves the first page unfiltered', () => {
    const q = query();
    applyCursor(q, 'created_at', undefined);

    expect(q.calls).toEqual([]);
  });

  it('filters strictly past the cursor row', () => {
    const q = query();
    applyCursor(q, 'created_at', `2026-01-01T00:00:00Z|${ID}`);

    expect(q.calls).toEqual([
      `created_at.lt.2026-01-01T00:00:00Z,and(created_at.eq.2026-01-01T00:00:00Z,id.lt.${ID})`
    ]);
  });

  it('rejects a cursor that could rewrite the filter', () => {
    expect(() =>
      applyCursor(query(), 'created_at', `2026-01-01),id.gt.0|${ID}`)
    ).toThrow(ValidationException);
    expect(() =>
      applyCursor(query(), 'created_at', '2026-01-01T00:00:00Z|abc')
    ).toThrow(ValidationException);
  });

  it('rejects a cursor without both parts', () => {
    expect(() => applyCursor(query(), 'created_at', 'abc')).toThrow(
      ValidationException
    );
  });
});

describe('toPage', () => {
  const rows = [
    { id: 'c', created_at: '3' },
    { id: 'b', created_at: '2' },
    { id: 'a', created_at: '1' }
  ];

  it('points at the last shown row when more follow', () => {
    expect(toPage(rows, 2, 'created_at')).toEqual({
      items: rows.slice(0, 2),
      nextCursor: '2|b'
    });
  });

  it('ends the list when the page is not full', () => {
    expect(toPage(rows, 3, 'created_at').nextCursor).toBeNull();
  });
});
