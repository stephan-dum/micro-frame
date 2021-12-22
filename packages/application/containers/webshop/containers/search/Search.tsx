import React, { FunctionComponent } from 'react';
import styles from './Search.scss';

const Search: FunctionComponent = () => {
  return (
    <section className={styles["my-class"]}>
      <h1>Search</h1>
      <p>results...</p>
    </section>
  );
};

export default {
  type: 'react',
  component: Search,
};
