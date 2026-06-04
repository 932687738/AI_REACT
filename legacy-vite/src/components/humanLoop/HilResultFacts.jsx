export default function HilResultFacts({ title, items }) {
  if (!items?.length) {
    return null
  }

  return (
    <div className="hil-facts">
      {title ? <p className="hil-facts__title">{title}</p> : null}
      <dl className="hil-facts__list">
        {items.map((item) => (
          <div
            key={item.key ?? item.label}
            className={`hil-facts__row${item.variant ? ` hil-facts__row--${item.variant}` : ''}`}
          >
            <dt>{item.label}</dt>
            <dd>{item.value ?? '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
