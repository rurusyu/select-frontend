export function thousandsSeperator(value: any): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
