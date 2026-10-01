export const STAGE_HEIGHT = 'min(68vh, 640px)';

// The cap is on the width: a height-derived square whose width is then capped
// once came out 566x606.
export const squareStage = (chrome: string) => `
  width: min(100%, calc(${STAGE_HEIGHT} - ${chrome}));
  aspect-ratio: 1 / 1;
  margin: 0 auto;
`;
