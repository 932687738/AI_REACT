import styles from './humanLoop.less';

export default function HilErrorAlert({ message }: { message: string }) {
  if (!message) {
    return null;
  }
  return (
    <p className={styles.error} role="alert">
      {message}
    </p>
  );
}
