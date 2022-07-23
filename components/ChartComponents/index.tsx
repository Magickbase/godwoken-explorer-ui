import styles from './styles.module.scss'

export const CustomTooltip: React.FC<any> = props => {
  const { active, payload, label, isMobile, theme } = props
  if (active && payload && payload.length) {
    return (
      <div
        className={styles.content}
        style={{
          border: 'none',
          borderRadius: isMobile ? 4 : 8,
          boxShadow: isMobile ? '0px 3px 10px rgba(0, 0, 0, 0.1)' : '0px 6px 20px rgba(0, 0, 0, 0.1)',
          padding: isMobile ? '12px 8px 10px' : '16px 16px 14px',
          backgroundColor: '#fff',
        }}
      >
        <div style={{ color: '#666' }}>{`${label}`}</div>
        <ul>
          {payload.map(({ name, value }, idx) => (
            <li key={name} style={{ color: idx === 0 ? theme.palette.primary.main : '#28b959' }}>
              <span style={{ fontSize: isMobile ? 13 : 14 }}>{`${name}: ${value}`}</span>
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
      x={isMobile ? '-165' : '-205'}
      y={y}
      fill={theme.palette.secondary.light}
      color={theme.palette.secondary.light}
      fontSize={isMobile ? 12 : 14}
      textAnchor="middle"
      style={{ transform: 'rotate(-90deg)' }}
    >
      {value}
    </text>
  )
}
