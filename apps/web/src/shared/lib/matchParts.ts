export interface MatchPart {
  text: string;
  isMatch: boolean;
}

export const matchParts = (text: string, query: string): MatchPart[] => {
  const needle = query.trim().toLowerCase();

  if (!needle) return [{ text, isMatch: false }];

  const haystack = text.toLowerCase();
  const parts: MatchPart[] = [];
  let from = 0;

  for (
    let at = haystack.indexOf(needle);
    at !== -1;
    at = haystack.indexOf(needle, from)
  ) {
    if (at > from) parts.push({ text: text.slice(from, at), isMatch: false });

    parts.push({ text: text.slice(at, at + needle.length), isMatch: true });
    from = at + needle.length;
  }

  if (from < text.length) {
    parts.push({ text: text.slice(from), isMatch: false });
  }

  return parts;
};
