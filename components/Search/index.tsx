import { useEffect, useState } from 'react'

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
    <form className="flex w-full relative" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search block, transaction, account..."
        value={keyword}
        onChange={handleChange}
        autoFocus
        className="flex-1 text-sm px-2 focus:ring-2 rounded-md"
      />
    </form>
  )
}

export default Search
