export const ConvertES5Loader = (source: string) => {
  console.log(source);
  throw new Error('loader');
  return source
};
