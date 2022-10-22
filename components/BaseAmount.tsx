import BigNumber from 'bignumber.js'

const BaseAmount: React.FC<{ amount: string; udt: { decimal: number; symbol: string }; showSymbol?: boolean }> = ({
  amount,
  udt: { decimal, symbol },
  showSymbol = false,
}) => {
  const a = new BigNumber(amount ?? 0).dividedBy(10 ** decimal).toFormat()
  const [rInt, rFrac] = a.split('.')
  const unit = symbol?.split('.')[0] ?? ''
  return (
    <b style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
      <span>{rInt}</span>
      {rFrac ? <span style={{ color: 'var(--amount-frac-color)' }}>{`.${rFrac}`}</span> : null}
      {showSymbol ? ` ${unit}` : null}
    </b>
  )
}

BaseAmount.displayName = 'Amount'

export default BaseAmount
