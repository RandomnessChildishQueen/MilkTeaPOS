export const generateId = (name: string, length: number) => {
  let nameCode = "";

  const nameWord = name.trim().split(/\s+/);

  if (nameWord.length >= 2) {
    const perWordLength = Math.ceil(length / nameWord.length);

    nameCode = nameWord
      .map((word) => word.substring(0, perWordLength))
      .join("")
      .toUpperCase()
      .slice(0, length);
  } else {
    nameCode = name.substring(0, length).toUpperCase();
  }
  return nameCode;
};
