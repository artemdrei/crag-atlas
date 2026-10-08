// Floored the same way as `observedHour` in the API, or a saved reading never
// matches the hour on screen. The assumed hour for a missing time is the API's
// too, or an old ascent's saved reading is refetched on every edit.
export const observedHour = (date: string, time: string): string =>
  `${date}T${(time || '14:00').slice(0, 2)}:00`;
