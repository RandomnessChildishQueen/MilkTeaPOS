export const skipLetterBy = (str: string, skipCount: number) => {
  return (
    str
      .split("")
      .filter((_, i) => i % skipCount !== 0)
      .join("") || str
  );
};
