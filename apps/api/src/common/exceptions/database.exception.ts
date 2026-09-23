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

/** Reads failed: nothing the reader did is wrong, so it is ours to own. */
export const readFailed = (
  message: string,
  code: string,
  cause?: DatabaseError
): DatabaseException => new DatabaseException(message, 500, code, cause);

/** Writes failed: usually a constraint or a policy, so the caller can act. */
export const writeFailed = (
  message: string,
  code: string,
  cause?: DatabaseError
): DatabaseException => new DatabaseException(message, 400, code, cause);

// A row somebody else still points at. 23503 is the only SQLSTATE we branch
// on: purging a catalog row is refused while anybody's ascent references it,
// and the restrict is the last line of defence for that.
export const FOREIGN_KEY_VIOLATION = '23503';

export const isReferenced = (error?: DatabaseError): boolean =>
  error?.code === FOREIGN_KEY_VIOLATION;
