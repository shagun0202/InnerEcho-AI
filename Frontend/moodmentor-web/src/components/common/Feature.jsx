export default function Feature({ icon: featureIcon, title, text }) {
  return (
    <article>
      <span>{featureIcon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}
