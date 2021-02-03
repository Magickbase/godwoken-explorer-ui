import Error from 'next/error'

const Custom404 = () => (
  <main className="overflow-hidden" style={{ height: 'calc(100vh - var(--header-height))' }}>
    <Error statusCode={404} />
  </main>
)

export default Custom404
