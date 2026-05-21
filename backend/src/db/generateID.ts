export const generate16DigitID = () => {
  let id = "";

  const timeID = new Date();
  const prefix = timeID.getFullYear();

  id += prefix;

  for (let i = 0; i < 12; i++) {
    id += Math.floor(Math.random() * 10);
  }
  return id;
};
