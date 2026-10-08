import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationException } from '../common/exceptions/app.exception';
import { FeedbackService } from './feedback.service';

const inserted: unknown[] = [];

vi.mock('../config/supabase.client', () => ({
  publicSupabase: () => ({
    from: () => ({
      insert: (row: unknown) => {
        inserted.push(row);

        return Promise.resolve({ error: null });
      }
    })
  })
}));

describe('FeedbackService.create', () => {
  const service = new FeedbackService();

  beforeEach(() => {
    inserted.length = 0;
  });

  it('rejects a rating outside one to five', async () => {
    await expect(service.create({ rating: 0 }, null)).rejects.toThrow(
      ValidationException
    );
    await expect(service.create({ rating: 4.5 }, null)).rejects.toThrow(
      ValidationException
    );
  });

  it('stores a blank guest email as null', async () => {
    await service.create({ rating: 4, email: '  ' }, null);

    expect(inserted[0]).toMatchObject({ id_user: null, email: null });
  });

  it('rejects an address that does not look like one', async () => {
    await expect(
      service.create({ rating: 4, email: 'not-an-email' }, null)
    ).rejects.toThrow('The email address does not look right');
  });

  it('rejects a message over the limit', async () => {
    await expect(
      service.create({ rating: 4, message: 'x'.repeat(801) }, null)
    ).rejects.toThrow(ValidationException);
  });
});
