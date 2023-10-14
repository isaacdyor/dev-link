export const getPrompt = (githubData: any, input: string) => {
  return `${githubData} + ${input}`;
};
