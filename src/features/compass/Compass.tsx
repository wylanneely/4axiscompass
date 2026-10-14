import { useId } from 'react'
import { plotPoint } from '../../domain/plot'
import { formatScore } from '../../domain/scoring'

interface Props {
  kind: 'political' | 'worldview'
  x: number
  y: number
  color: string | null
}

const area = { left: 60, top: 49, width: 280, height: 268 }
const gap = 4

export default function Compass({ kind, x, y, color }: Props) {
  const id = useId()
  const point = plotPoint(x, y, area)
  const political = kind === 'political'
  const title = political ? 'Political compass' : 'Worldview compass'
  const xName = political ? 'Economic' : 'Moral Radius'
  const yName = political ? 'Authority' : 'Agency'
  const left = political ? 'Left' : 'Proximal'
  const right = political ? 'Right' : 'Universal'
  const top = political ? 'Authoritarian' : 'Individual'
  const bottom = political ? 'Libertarian' : 'Structure'
  const colors = political
    ? ['#f12629', '#1978ef', '#18a36a', '#8c2df0']
    : ['#00d9dd', '#fff200', '#ff792e', '#18e600']
  const halfWidth = (area.width - gap) / 2
  const halfHeight = (area.height - gap) / 2
  const rightX = area.left + halfWidth + gap
  const bottomY = area.top + halfHeight + gap
  return (
    <figure className="compass-card">
      <figcaption><h3>{title}</h3><p>{xName} × {yName}</p></figcaption>
      <svg className="compass-svg" viewBox="0 0 400 367" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>{`${xName} ${formatScore(x)} from -100 ${left} to +100 ${right}; ${yName} ${formatScore(y)} from -100 ${bottom} to +100 ${top}. Marker at those exact coordinates.`}</desc>
        <defs><clipPath id={`${id}-clip`}><rect x={area.left} y={area.top} width={area.width} height={area.height} rx="6" /></clipPath></defs>
        <text className="pole-label" x="200" y="25" textAnchor="middle">{top}</text>
        <text className="pole-label" x="200" y="347" textAnchor="middle">{bottom}</text>
        <text className="pole-label side-label" x="52" y="187" textAnchor="end">{left}</text>
        <text className="pole-label side-label" x="348" y="187" textAnchor="start">{right}</text>
        <rect x={area.left} y={area.top} width={area.width} height={area.height} rx="6" fill="#fff" />
        <g clipPath={`url(#${id}-clip)`}>
          <rect x={area.left} y={area.top} width={halfWidth} height={halfHeight} fill={colors[0]} />
          <rect x={rightX} y={area.top} width={halfWidth} height={halfHeight} fill={colors[1]} />
          <rect x={area.left} y={bottomY} width={halfWidth} height={halfHeight} fill={colors[2]} />
          <rect x={rightX} y={bottomY} width={halfWidth} height={halfHeight} fill={colors[3]} />
        </g>
        <rect x={area.left} y={area.top} width={area.width} height={area.height} rx="6" fill="none" stroke="#dce5e1" />
        <circle cx={point.x} cy={point.y} r="12" fill="#fff" stroke="#fff" strokeWidth="2" />
        <circle cx={point.x} cy={point.y} r="8.5" fill={color ?? '#fff'} stroke="#192434" strokeWidth="2.5" />
      </svg>
      <p className="compass-coordinate">{xName} {formatScore(x)} <span aria-hidden="true">·</span> {yName} {formatScore(y)}</p>
    </figure>
  )
}
