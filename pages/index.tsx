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

export const getServerSideProps: GetServerSideProps<State> = async () => {
  return {
    props: {
      blockList: Array.from({ length: 10 }).map((_, idx) => ({
        number: `number-${idx}`,
        hash: `hash-${idx}`,
        txCount: `txCount-${idx}`,
        createdAt: Date.now().toString(),
      })),
      namespacesRequired: [],
    },
  }
}

export default Home
