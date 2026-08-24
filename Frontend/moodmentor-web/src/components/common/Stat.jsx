export default function Stat({ value, label, detail }) {
  return (
    <article className="stat">
      <strong>{value}</strong>
      <div>
        <b>{label}</b>
        <small>{detail}</small>
      </div>
    </article>
  )
}
