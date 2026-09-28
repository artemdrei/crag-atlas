import { describe, expect, it } from 'vitest';

import { toBolter } from './bolter';

const ID = '11111111-1111-4111-8111-000000000001';

describe('toBolter', () => {
  it('leaves a route nobody claimed empty', () => {
    expect(toBolter({})).toEqual({
      id_bolter: null,
      bolter_name: null,
      bolted_year: null
    });
  });

  it('keeps a typed name when there is no account to point at', () => {
    expect(toBolter({ bolterName: '  Ivan Petrenko ' })).toMatchObject({
      id_bolter: null,
      bolter_name: 'Ivan Petrenko'
    });
  });

  it('treats a blank name as nobody', () => {
    expect(toBolter({ bolterName: '   ' }).bolter_name).toBeNull();
  });

  it('drops the typed name once a climber is picked', () => {
    expect(toBolter({ idBolter: ID, bolterName: 'Ivan' })).toMatchObject({
      id_bolter: ID,
      bolter_name: null
    });
  });

  it('refuses a year outside the range the column accepts', () => {
    expect(() => toBolter({ boltedYear: 1899 })).toThrow();
    expect(() => toBolter({ boltedYear: 2101 })).toThrow();
    expect(() => toBolter({ boltedYear: 2019.5 })).toThrow();
  });

  it('takes a year a guidebook would print', () => {
    expect(toBolter({ boltedYear: 2019 }).bolted_year).toBe(2019);
  });
});
