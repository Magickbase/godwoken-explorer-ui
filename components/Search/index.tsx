import { useEffect, useState } from 'react'
import Spinner from 'components/Spinner'
import styles from './search.module.scss'

const Search = () => {
  const [keyword, setKeyword] = useState('')
  const [result, setResult] = useState<any | null>(null)
  useEffect(() => {
    if (keyword === 'keyword') {
      setResult('Result of keyword')
    } else {
      setResult(null)
    }
  }, [keyword, setResult])
  const handleChange = (e: React.SyntheticEvent<HTMLInputElement>) => setKeyword(e.currentTarget.value)
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
  }
  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <input type="text" placeholder="Search block, transaction, account..." value={keyword} onChange={handleChange} />
      {keyword ? <div className={styles.result}>{result ? result : <Spinner />}</div> : null}
    </form>
  )
}

export default Search
