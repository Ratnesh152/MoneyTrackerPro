export function formatCurrentMonth(): string {
  return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
}
