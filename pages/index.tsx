import { GetServerSideProps } from 'next'
import { useReducer } from 'react'
import BlockList, { BlockListProps } from 'components/BlockList'

interface State {
  blockList: BlockListProps['list']
}

const reducer: React.Reducer<State, Record<'type' | 'payload', string>> = (state, { type, payload }) => {
  // switch action.type
  switch (type) {
    default: {
      return state
    }
  }
}
const Home = (initState: State) => {
  const [{ blockList }, dispatch] = useReducer(reducer, initState)
  return (
    <main>
      <div>
        <BlockList list={blockList} />
      </div>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ res }) => {
  const blockListRes = await fetch(`${process.env.SERVER_URL}blocks`)

  if (blockListRes.status === 404) {
    res.setHeader('location', '/404')
    res.statusCode = 302
    res.end()
    return
  }

  const blockList = await blockListRes.json()
  return {
    props: {
      blockList: blockList,
    },
  }
}

export default Home
