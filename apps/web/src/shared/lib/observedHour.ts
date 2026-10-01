// Floored the same way as `observedHour` in the API, or a saved reading never
// matches the hour on screen.
export const observedHour = (date: string, time: string): string =>
  `${date}T${time.slice(0, 2)}:00`;
