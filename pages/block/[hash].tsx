import { GetServerSideProps } from 'next'

const Block = ({ hash }: { hash: string }) => {
  return <main>Block Info of {hash}</main>
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { hash } = context.params
  return { props: { hash } }
}

export default Block
