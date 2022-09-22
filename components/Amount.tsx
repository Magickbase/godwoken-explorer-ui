import BigNumber from 'bignumber.js'
import Tooltip from './Tooltip'

const Amount: React.FC<{ amount: string; udt: { decimal: number; symbol: string }; showSymbol?: boolean }> = ({
  amount,
  udt: { decimal, symbol },
  showSymbol = false,
}) => {
  const a = new BigNumber(amount ?? 0).dividedBy(10 ** decimal).toFormat()
  const [rInt, rFrac] = a.split('.')
  const unit = symbol?.split('.')[0] ?? ''
  return (
    <div className="tooltip" data-tooltip={`${a} ${unit}`}>
      <b
        style={{
          width: '180px',
          display: 'inline-block',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          fontWeight: 500,
        }}
      >
        <span>{rInt}</span>
        {rFrac ? <span style={{ color: 'var(--amount-frac-color)' }}>{`.${rFrac}`}</span> : null}
        {showSymbol ? ` ${unit}` : null}
      </b>
    </div>
  )
}

Amount.displayName = 'Amount'

export default Amount
