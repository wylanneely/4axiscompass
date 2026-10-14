export interface PlotPoint { x: number; y: number }
export interface PlotArea { left: number; top: number; width: number; height: number }
export function plotPoint(x: number, y: number, area: PlotArea): PlotPoint {
  if (![x, y, area.left, area.top, area.width, area.height].every(Number.isFinite) || x < -100 || x > 100 || y < -100 || y > 100 || area.width <= 0 || area.height <= 0) {
    throw new Error('Invalid plot coordinate')
  }
  return {
    x: area.left + ((x + 100) / 200) * area.width,
    y: area.top + ((100 - y) / 200) * area.height,
  }
}
