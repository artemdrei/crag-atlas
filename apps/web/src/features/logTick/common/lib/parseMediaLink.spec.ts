import { describe, expect, it } from 'vitest';

import { parseMediaLink } from './parseMediaLink';

describe('parseMediaLink', () => {
  it('takes a youtube link', () => {
    expect(parseMediaLink('https://youtu.be/abc123')).toBe(
      'https://youtu.be/abc123'
    );
  });

  it('takes an instagram link', () => {
    expect(parseMediaLink(' https://www.instagram.com/p/abc/ ')).toBe(
      'https://www.instagram.com/p/abc/'
    );
  });

  it('rejects any other host', () => {
    expect(parseMediaLink('https://vimeo.com/123')).toBeUndefined();
  });

  it('rejects what is not a link at all', () => {
    expect(parseMediaLink('youtube')).toBeUndefined();
  });
});
