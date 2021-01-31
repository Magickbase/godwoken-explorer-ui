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
      <div>
        <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img src="/favicon.ico" alt="logo" className="h12 w12" />
          </div>
          <div>
            <div className="text-xl font-medium text-black">Chat</div>
            <p className="text-grey-500">You have a message</p>
          </div>
        </div>
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
