/** "Crag Atlas" → "CA", "cragatlas@gmail.com" → "CR". Empty input → "". */
export const getInitials = (name: string): string => {
  const source = name.includes('@') ? name.split('@')[0] : name;
  const words = source.split(/[\s._-]+/).filter(Boolean);

  if (words.length === 0) return '';

  const letters =
    words.length > 1 ? `${words[0][0]}${words[1][0]}` : words[0].slice(0, 2);

  return letters.toUpperCase();
};
