import { describe, expect, it } from 'vitest';

import { mediaEmbedUrl, mediaThumbnailUrl, parseMediaLink } from './mediaLink';

describe('parseMediaLink', () => {
  it('takes a short youtube link', () => {
    expect(parseMediaLink('https://youtu.be/dQw4w9WgXcQ')).toMatchObject({
      provider: 'youtube',
      id: 'dQw4w9WgXcQ'
    });
  });

  it('takes a watch link', () => {
    expect(
      parseMediaLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30')
    ).toMatchObject({ provider: 'youtube', id: 'dQw4w9WgXcQ' });
  });

  it('takes a shorts link', () => {
    expect(
      parseMediaLink('https://www.youtube.com/shorts/dQw4w9WgXcQ')
    ).toMatchObject({ provider: 'youtube', id: 'dQw4w9WgXcQ' });
  });

  it('takes an instagram reel', () => {
    expect(
      parseMediaLink(' https://www.instagram.com/reel/Cxyz12345/ ')
    ).toMatchObject({ provider: 'instagram', id: 'Cxyz12345' });
  });

  it('rejects a youtube link with no video', () => {
    expect(parseMediaLink('https://www.youtube.com/')).toBeUndefined();
  });

  it('rejects an instagram profile', () => {
    expect(
      parseMediaLink('https://www.instagram.com/someclimber/')
    ).toBeUndefined();
  });

  it('rejects any other host', () => {
    expect(parseMediaLink('https://vimeo.com/123')).toBeUndefined();
  });

  it('rejects what is not a link at all', () => {
    expect(parseMediaLink('youtube')).toBeUndefined();
  });

  it('rejects a script link', () => {
    expect(
      parseMediaLink('javascript:alert(1)//youtu.be/dQw4w9WgXcQ')
    ).toBeUndefined();
  });
});

describe('mediaEmbedUrl', () => {
  it('embeds a youtube video', () => {
    expect(mediaEmbedUrl({ provider: 'youtube', id: 'abc12', url: '' })).toBe(
      'https://www.youtube-nocookie.com/embed/abc12?playsinline=1'
    );
  });

  it('embeds an instagram post', () => {
    expect(mediaEmbedUrl({ provider: 'instagram', id: 'abc12', url: '' })).toBe(
      'https://www.instagram.com/p/abc12/embed'
    );
  });
});

describe('mediaThumbnailUrl', () => {
  it('has none for instagram', () => {
    expect(
      mediaThumbnailUrl({ provider: 'instagram', id: 'abc12', url: '' })
    ).toBeUndefined();
  });
});
