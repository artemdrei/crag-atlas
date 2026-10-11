import { describe, expect, it } from 'vitest';

import { idYoutubeOf } from './youtube';

describe('idYoutubeOf', () => {
  it('reads the same id from every way a video is linked', () => {
    expect(idYoutubeOf('https://youtu.be/dQw4w9WgXcQ?t=3')).toBe('dQw4w9WgXcQ');
    expect(
      idYoutubeOf('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30')
    ).toBe('dQw4w9WgXcQ');
    expect(
      idYoutubeOf('https://m.youtube.com/watch?feature=share&v=dQw4w9WgXcQ')
    ).toBe('dQw4w9WgXcQ');
    expect(idYoutubeOf('https://youtube.com/shorts/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ'
    );
  });

  it('refuses any other host', () => {
    expect(idYoutubeOf('https://vimeo.com/90218')).toBeUndefined();
  });

  it('refuses a youtube link with no video', () => {
    expect(idYoutubeOf('https://www.youtube.com/')).toBeUndefined();
  });

  it('refuses what is not a link', () => {
    expect(idYoutubeOf('youtube')).toBeUndefined();
    expect(
      idYoutubeOf('javascript:alert(1)//youtu.be/dQw4w9WgXcQ')
    ).toBeUndefined();
  });
});
