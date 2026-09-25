const state = (name: string) =>
  new URL(`../.auth/${name}.json`, import.meta.url).pathname;

/** The admin: edit mode, the archive view, and anything below them. */
export const STORAGE_STATE = state('admin');

/**
 * An ordinary climber. Half of what ticks and comments promise is about who
 * owns what, and that cannot be told from one account.
 */
export const STORAGE_STATE_MEMBER = state('member');
