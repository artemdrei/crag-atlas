import { ValidationException } from '../exceptions/app.exception';

interface Filterable {
  or(filters: string): this;
}

const CURSOR_VALUE = /^[\w:.+-]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const applyCursor = <Q extends Filterable>(
  query: Q,
  column: string,
  cursor: string | undefined
): Q => {
  if (!cursor) return query;

  const [value, id] = cursor.split('|');

  if (!value || !id || !CURSOR_VALUE.test(value) || !UUID.test(id)) {
    throw new ValidationException('The cursor is malformed');
  }

  return query.or(
    `${column}.lt.${value},and(${column}.eq.${value},id.lt.${id})`
  );
};

export const toPage = <Row extends { id: string }>(
  rows: Row[],
  pageSize: number,
  column: keyof Row
): { items: Row[]; nextCursor: string | null } => {
  const items = rows.slice(0, pageSize);
  const last = items[items.length - 1];

  return {
    items,
    nextCursor:
      rows.length > pageSize && last
        ? `${String(last[column])}|${last.id}`
        : null
  };
};
