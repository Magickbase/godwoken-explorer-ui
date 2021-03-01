import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useTranslation, fetchAccount, API, handleApiError } from 'utils'
import User from 'components/User'
import MetaContract from 'components/MetaContract'
import SmartContract from 'components/SmartContract'
import Polyjuice from 'components/Polyjuice'
import SUDT from 'components/SUDT'

type State = API.Account.Parsed
const Account = (initState: State) => {
  const [account, setAccount] = useState(initState)
  const [t] = useTranslation('account')
  return (
    <>
      <div className="flex flex-col card-container md:flex-row md:pb-3">
        <h2 className="card-header border-b pb-3 md:flex-1 md:border-b-0 md:border-r md:pb-0">{`${t('account')} ${
          account.id
        }`}</h2>
        <div className="divide-y divide-light-grey divide-dashed md:divide-y-0 md:flex-1 md:pl-3">
          <div className="flex justify-between py-3 md:py-0">
            <span>{t('ckb')}</span>
            <span>{account.ckb}</span>
          </div>
          <div className="flex justify-between pt-3 pb-2 md:pb-0">
            <span>{t('txCount')}</span>
            <Link href={`/txs?account=${account.id}`}>
              <a>{account.txCount}</a>
            </Link>
          </div>
        </div>
      </div>
      <MetaContract />
      <User />
      <SmartContract />
      <Polyjuice />
      <SUDT />
    </>
  )
}

export const getServerSideProps: GetServerSideProps<State, { id: string }> = async ({ res, params }) => {
  const { id } = params
  try {
    const account = await fetchAccount(id)
    return { props: account }
  } catch (err) {
    return handleApiError(err, res)
  }
}
export default Account
