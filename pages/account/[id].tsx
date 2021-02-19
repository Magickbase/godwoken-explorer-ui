import { useState } from 'react'
import { GetServerSideProps } from 'next'
import { useTranslation, fetchAccount, API, handleApiError } from 'utils'

type State = API.Account.Parsed
const Account = (initState: State) => {
  const [account, setAccount] = useState(initState)
  const [t] = useTranslation('account')
  const infoList = [
    { label: 'id', value: account.id },
    { label: 'type', value: account.type },
    { label: 'ckb', value: account.ckb },
    { label: 'txCount', value: account.txCount },
  ]
  return (
    <div className="basic-info-list">
      {infoList.map(info => (
        <div key={info.label}>
          <span>{t(info.label)}</span>
          <div>{info.value}</div>
        </div>
      ))}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<State, { id: string }> = async ({ res, params }) => {
  const { id } = params
  try {
    const account = await fetchAccount(id)
    return { props: account }
  } catch (err) {
    handleApiError(err, res)
  }
}
export default Account
