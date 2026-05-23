export const removeVowel = (str: string) => {
  return (
    str[0] + //keep vowel if first letter
      str.slice(1).replace(/[aeiouAEIOU]/g, "") || str
  );
};
