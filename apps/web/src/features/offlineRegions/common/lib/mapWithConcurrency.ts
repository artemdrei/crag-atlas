export const mapWithConcurrency = async <T>(
  items: T[],
  limit: number,
  run: (item: T) => Promise<void>
) => {
  const queue = [...items];

  const worker = async () => {
    for (let item = queue.shift(); item !== undefined; item = queue.shift()) {
      await run(item);
    }
  };

  await Promise.all(Array.from({ length: limit }, worker));
};
