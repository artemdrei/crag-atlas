import { ValidationException } from '../exceptions/app.exception';

export interface BolterInput {
  idBolter?: string | null;
  bolterName?: string | null;
  boltedYear?: number | null;
}

export interface BolterColumns {
  id_bolter: string | null;
  bolter_name: string | null;
  bolted_year: number | null;
}

const EARLIEST_YEAR = 1900;
const LATEST_YEAR = 2100;

// The same bounds the column's own check carries. Validating here as well is
// what turns a constraint violation nobody can read into a message naming the
// field the editor has open.
export const toBolter = ({
  idBolter,
  bolterName,
  boltedYear
}: BolterInput): BolterColumns => {
  const name = bolterName?.trim() || null;
  const id = idBolter || null;

  // A climber with an account is the better answer, so picking one drops the
  // typed name rather than refusing the save.
  return {
    id_bolter: id,
    bolter_name: id ? null : name,
    bolted_year: year(boltedYear)
  };
};

const year = (value?: number | null): number | null => {
  if (value === null || value === undefined) return null;

  if (
    !Number.isInteger(value) ||
    value < EARLIEST_YEAR ||
    value > LATEST_YEAR
  ) {
    throw new ValidationException(
      `A bolting year is a whole number between ${EARLIEST_YEAR} and ${LATEST_YEAR}`,
      'ROUTE_BOLTED_YEAR_INVALID'
    );
  }

  return value;
};
