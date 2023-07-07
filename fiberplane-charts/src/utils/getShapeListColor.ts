export function getShapeListColor(colors: Array<string>, listIndex: number) {
  return colors[listIndex % colors.length];
}
