import { GetServerSideProps } from 'next'
const Account = ({ id }: { id: string }) => {
  return <main>Account Info of {id}</main>
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { id } = context.params
  return {
    props: { id },
  }
}
export default Account
