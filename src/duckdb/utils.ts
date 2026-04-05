export function joinLiterals(values: string[]): string {
  return values.map(value => `'${value}'`).join(',')
}
