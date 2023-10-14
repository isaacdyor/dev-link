export const getPrompt = (githubData: any, input: string) => {
  return `${input} : ${githubData}`;
};
