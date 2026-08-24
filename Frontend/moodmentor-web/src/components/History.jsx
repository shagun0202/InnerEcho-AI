import Reflection from './common/Reflection'
import Empty from './common/Empty'

export default function History({ entries }) {
  return (
    <section className="history-list">
      {entries?.length ? (
        entries.map(entry => (
          <article className="panel" key={entry.id}>
            <Reflection entry={entry} full />
          </article>
        ))
      ) : (
        <article className="panel">
          <Empty text="No reflections yet. Your story can begin whenever you are ready." />
        </article>
      )}
    </section>
  )
}
