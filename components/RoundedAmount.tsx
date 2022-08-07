import BigNumber from 'bignumber.js'
import Tooltip from './Tooltip'

const RoundedAmount: React.FC<{ amount: string; udt: { decimal: number; symbol: string } }> = ({
  amount,
  udt: { decimal, symbol },
}) => {
  const a = new BigNumber(amount ?? 0).dividedBy(10 ** decimal)
  const roundedAmount = +a.toFixed(8)
  const [rInt, rFrac] = roundedAmount.toString().split('.')
  const isExact = new BigNumber(roundedAmount).isEqualTo(a)
  return (
    <Tooltip title={`${a.toFormat()} ${symbol?.split('.')[0] ?? ''}`} placement="top">
      <div>
        {`${isExact ? '' : '≈ '}`}
        <span>{new BigNumber(rInt).toFormat()}</span>
        {rFrac ? <span style={{ color: '#aaa' }}>{`.${rFrac}`}</span> : null}
      </div>
    </Tooltip>
  )
}

export default RoundedAmount
