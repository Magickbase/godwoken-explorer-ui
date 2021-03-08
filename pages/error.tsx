import { useRouter } from 'next/router'
import { SEARCH_FIELDS } from 'utils'

const CustomError = () => {
  const { query } = useRouter()
  return <div className="errorPage">{query.message ?? 'Unknown error'}</div>
}

export default CustomError
