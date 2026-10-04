import { AppException } from './app.exception';

// What Postgres or PostgREST handed back; the shape varies.
export interface DatabaseError {
  message?: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}

// A database error never travels to the client as itself: its text names
// columns, constraints and RLS policies. The raw error stays on the exception
// for the log, and `code` stays ours, never Postgres' SQLSTATE.
export class DatabaseException extends AppException {
  constructor(
    message: string,
    statusCode: number,
    code: string,
    public readonly dbError?: DatabaseError
  ) {
    super(message, statusCode, code);
    this.name = 'DatabaseException';
    Object.setPrototypeOf(this, DatabaseException.prototype);
  }
}

// Both are 500s: every condition the caller could fix is raised before the
// query runs, or right after it by its own exception. What reaches these is a
// failure we have not named, which is ours, not theirs.
const queryFailed = (
  message: string,
  code: string,
  cause?: DatabaseError
): DatabaseException => new DatabaseException(message, 500, code, cause);

export const readFailed = queryFailed;

export const writeFailed = queryFailed;

// Purging a catalog row is refused while anybody's ascent still references it.
export const FOREIGN_KEY_VIOLATION = '23503';

export const isReferenced = (error?: DatabaseError): boolean =>
  error?.code === FOREIGN_KEY_VIOLATION;

// Raised by the `ticks_first_ascent_style_*` triggers in 017_repeat_ascents.sql.
export const REPEAT_FIRST_ASCENT_STYLE = 'CA001';

export const isRepeatInFirstAscentStyle = (error?: DatabaseError): boolean =>
  error?.code === REPEAT_FIRST_ASCENT_STYLE;
