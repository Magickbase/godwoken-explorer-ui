import { GetServerSideProps } from 'next'
import TxList from 'components/TxList'
import { useTranslation } from 'utils/i18n'

interface Tx {
  hash: string
  type: string
  from: string
  to: string
  amount: string
  fee: string
  createdAt: string
}

interface State {
  id: string
  nonce: string
  txList: Array<Tx>
}
const Account = ({ id, nonce, txList }: State) => {
  const [t] = useTranslation('account')
  const infoList = [
    {
      label: 'id',
      value: id,
    },
    {
      label: 'nonce',
      value: nonce,
    },
  ]
  return (
    <main>
      <div className="basic-info-list">
        {infoList.map(info => (
          <div key={info.label}>
            <span>{t(info.label)}</span>
            <div>{info.value}</div>
          </div>
        ))}
      </div>
      <TxList list={txList} />
    </main>
  )
}

export const getServerSideProps: GetServerSideProps<State, { id: string }> = async ({ res, params }) => {
  const { id } = params
  const accountRes = await fetch(`${process.env.SERVER_URL}account/${id}`)
  if (accountRes.status === 404) {
    res.setHeader('location', '/404')
    res.statusCode = 302
    res.end()
    return
  }

  const account = await accountRes.json()
  return {
    props: {
      ...account,
      txList: account.txList.map(tx => ({
        ...tx,
        createdAt: Date.now().toString(),
      })),
    },
  }
}
export default Account
