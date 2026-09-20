export interface GradeVote {
  grade: string;
  votes: number;
}

/** Demo data until the API serves grade votes. */
export const DEMO_GRADE_VOTES: GradeVote[] = [
  { grade: '6c+', votes: 4 },
  { grade: '7a', votes: 21 },
  { grade: '7a+', votes: 52 },
  { grade: '7b', votes: 17 },
  { grade: '7b+', votes: 2 }
];
