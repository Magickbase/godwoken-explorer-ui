import BigNumber from 'bignumber.js'
import Tooltip from 'components/Tooltip'

const RoundedAmount: React.FC<{ amount: string; udt: { decimal: number; symbol: string } }> = ({
  amount,
  udt: { decimal, symbol },
}) => {
  const a = new BigNumber(amount ?? 0).dividedBy(10 ** decimal)
  const roundedAmount = a.toFixed(8)
  const [rInt, rFrac] = roundedAmount.toString().split('.')
  const isExact = new BigNumber(roundedAmount).isEqualTo(a)
  return (
    <Tooltip title={`${a.toFormat()} ${symbol?.split('.')[0] ?? ''}`} placement="top">
      <b style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
        {`${isExact ? '' : '≈ '}`}
        <span>{new BigNumber(rInt).toFormat()}</span>
        {rFrac ? <span style={{ color: 'var(--amount-frac-color)' }}>{`.${rFrac}`}</span> : null}
      </b>
    </Tooltip>
  )
}

export default RoundedAmount
