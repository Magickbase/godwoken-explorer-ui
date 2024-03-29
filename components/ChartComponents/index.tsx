import styles from './styles.module.scss'

export const CustomTooltip: React.FC<any> = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipContent} data-cy="chart-tooltip">
        <div>{`${label}`}</div>
        <ul>
          {payload.map(({ name, value }, idx) => (
            <li key={name} style={{ color: idx === 0 ? theme.palette.primary.main : '#28b959' }}>
              <span>{`${name}: ${value}`}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return null
}

export const CustomYLabel: React.FC<any> = ({ value, theme, isMobile, align = 'left' }) => {
  const y = align === 'left' ? (isMobile ? '6%' : '10%') : isMobile ? '90%' : '254%'
  return (
    <text
      x={isMobile ? '-150' : '-180'}
      y={y}
      fill={theme.palette.secondary.light}
      color={theme.palette.secondary.light}
      fontSize={isMobile ? 12 : 14}
      textAnchor="middle"
      style={{ transform: 'rotate(-90deg)' }}
      data-cy="chart-y-label"
    >
      {value}
    </text>
  )
}
