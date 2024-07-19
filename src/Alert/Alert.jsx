import { useEffect } from 'react';
import styles from './Alert.module.css';

function Alert({ text, click, color }) {
  const alertClass = color === 'success' ? 'alert-success' : 'alert-danger';

  useEffect(() => {
    const timer = setTimeout(() => {
      click(); // Call the click handler to dismiss the alert
    }, 2000); // Delay in milliseconds (2 seconds)

    return () => clearTimeout(timer); // Cleanup the timer on unmount or update
  }, [click]);

  return (
    <div className={`alert ${alertClass} alert-dismissible fade show ${styles.alert}`} role="alert">
      <strong>{text}</strong>
      <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={click}></button>
    </div>
  );
}

export default Alert;
