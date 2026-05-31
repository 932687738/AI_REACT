export default function HilErrorAlert({ message }) {
  if (!message) {
    return null
  }

  return (
    <p className="hil-error" role="alert">
      {message}
    </p>
  )
}
