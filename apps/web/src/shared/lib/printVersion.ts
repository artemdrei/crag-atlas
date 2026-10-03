export const printVersion = () => {
  // biome-ignore lint/suspicious/noConsole: the release a session runs is read from the console
  console.log(`crag-atlas v${__APP_VERSION__}`);
};
