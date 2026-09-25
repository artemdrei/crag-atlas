import { AppException } from './app.exception';

/** What Postgres or PostgREST handed back; shape varies, so nothing is required. */
export interface DatabaseError {
  message?: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}

/**
 * A database error never travels to the client as itself: its text names
 * columns, constraints and RLS policies, which describes our schema to anyone
 * who can trigger a failed query, and tells the reader nothing they can act on.
 *
 * The raw error is kept on the exception so the log still has it, and `code`
 * stays ours — a stable string the client can branch on, never Postgres'
 * SQLSTATE.
 */
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

/**
 * Both are 500s, and the pair of names only says which half of a service the
 * query sat in. Neither is a 4xx: every condition the caller could actually
 * fix — a bad payload, a missing row, a row somebody still points at — is
 * raised before the query runs, or right after it by its own exception. What
 * reaches these two is a query that failed for a reason we have not named,
 * which is ours, not theirs. The filter turns the text into a generic message
 * on the way out and keeps `code` for the client to branch on.
 */
const queryFailed = (
  message: string,
  code: string,
  cause?: DatabaseError
): DatabaseException => new DatabaseException(message, 500, code, cause);

export const readFailed = queryFailed;

export const writeFailed = queryFailed;

// A row somebody else still points at. 23503 is the only SQLSTATE we branch
// on: purging a catalog row is refused while anybody's ascent references it,
// and the restrict is the last line of defence for that.
export const FOREIGN_KEY_VIOLATION = '23503';

export const isReferenced = (error?: DatabaseError): boolean =>
  error?.code === FOREIGN_KEY_VIOLATION;
