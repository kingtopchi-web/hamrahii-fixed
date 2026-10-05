export function calculateAge(inputDate) {
  let dob;

  // If already a Date
  if (inputDate instanceof Date) {
    dob = inputDate;
  }

  // If timestamp (number)
  else if (typeof inputDate === "number") {
    dob = new Date(inputDate);
  }

  // If string
  else if (typeof inputDate === "string") {
    // Try native parsing first (ISO, "Jan 2 2000", etc.)
    const parsed = new Date(inputDate);
    if (!isNaN(parsed)) {
      dob = parsed;
    } else {
      // Fallback for dd/mm/yyyy or dd-mm-yyyy
      const parts = inputDate.split(/[\/\-\.]/).map(Number);
      if (parts.length === 3) {
        let [d, m, y] = parts;

        // If year is first (yyyy-mm-dd)
        if (y < 1000) [y, m, d] = parts;

        dob = new Date(y, m - 1, d);
      }
    }
  }

  if (!dob || isNaN(dob)) {
    throw new Error("Invalid date format");
  }

  // ---- Age calculation ----
  const today = new Date();

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonthDays = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}
