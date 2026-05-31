export function formatMoney(value: number): string {
  return `RM ${value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatHours(value: number): string {
  return `${value.toFixed(1)}h`;
}
