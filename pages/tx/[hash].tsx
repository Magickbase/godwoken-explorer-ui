import { GetServerSideProps } from 'next'
const Tx = ({ hash }: { hash: string }) => {
  return <main>Transaction Info of {hash}</main>
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { hash } = context.params
  return { props: { hash } }
}
export default Tx
