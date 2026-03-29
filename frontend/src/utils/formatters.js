export const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};