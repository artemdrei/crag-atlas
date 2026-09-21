export const FOCUSED_OPACITY = 1;
export const RECEDED_OPACITY = 0.55;

export const lineOpacity = (isFocused: boolean, hasFocus: boolean): number => {
  if (!hasFocus) return FOCUSED_OPACITY;

  return isFocused ? FOCUSED_OPACITY : RECEDED_OPACITY;
};
