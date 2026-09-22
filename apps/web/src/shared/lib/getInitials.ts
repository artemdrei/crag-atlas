/** "Crag Atlas" → "CA", "cragatlas@gmail.com" → "CR". Empty input → "". */
export const getInitials = (name: string): string => {
  const [local = name] = name.includes('@') ? name.split('@') : [name];
  const [first, second] = local.split(/[\s._-]+/).filter(Boolean);

  if (!first) return '';

  const letters = second
    ? `${first.slice(0, 1)}${second.slice(0, 1)}`
    : first.slice(0, 2);

  return letters.toUpperCase();
};
