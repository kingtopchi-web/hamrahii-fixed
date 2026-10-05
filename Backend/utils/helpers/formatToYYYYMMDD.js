export const formatToYYYYMMDD = (input) => {
  if (!input) return null;

  let date;

  // 1. If already Date object
  if (input instanceof Date) {
    date = input;
  }
  // 2. If timestamp number
  else if (typeof input === "number") {
    date = new Date(input);
  }
  // 3. If string
  else if (typeof input === "string") {
    date = new Date(input);
  }
  else {
    return null;
  }

  if (isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
