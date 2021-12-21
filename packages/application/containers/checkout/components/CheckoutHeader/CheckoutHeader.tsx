import { useEffect } from 'react';
import {IPrepassComponent} from "@micro-frame/plugin-react/types";
import styles from './CheckoutHeader.scss'

const CheckoutHeader: IPrepassComponent = () => {
  useEffect(() => {
    console.log('client only');
  }, []);
  return (
    <header className={styles.header}>
      <ul>
        <li><a href="/">home</a></li>
      </ul>
    </header>
  );
};

export default {
  type: 'react',
  component: CheckoutHeader,
};
