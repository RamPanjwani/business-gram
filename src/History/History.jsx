import React from 'react';
import styles from './History.module.css';
function print(){
    console.log(user);
    console.log(number);
    console.log(message);
}
function History({ user, number, message }) {
    const className = `${styles.historyItem} ${number === user ? styles.right : styles.left}`;
  return (
    <li className={`list-group-item text-wrap ${className}`} onClick={print}>
      {message}
    </li>
  );
}

export default History;
