import React, { FunctionComponent } from 'react';
import styles from './Search.scss';
// import CheckoutStart from "../Checkout/pages/CheckoutStart/CheckoutStart";

// const CheckoutHeader: FunctionComponent = () => {
//   return null;
// }
// const Chunk: FunctionComponent = () => {
//   return null;
// }
// const Container: FunctionComponent = () => {
//   return null;
// }
// const Fragment: FunctionComponent = () => {
//   return null;
// }
// const Router: FunctionComponent = () => {
//   return null;
// };
// const Route: FunctionComponent = () => {
//   return null;
// };
//
// const Checkout = () => {
//   const meta = [{ tagName: 'title', children: ['checkout'] }];
//   const routes = [
//     {
//       path: '/success',
//       chunkName: 'checkout_success',
//       chunk: () => import(
//         /* webpackChunkName: "checkout_success" */
//         './pages/CheckoutSuccess'
//         ),
//     },
//     {
//       node: {
//         type: 'react',
//         component: CheckoutStart,
//       },
//     }
//   ];
//
//   return (
//     <Fragment meta={meta}>
//       <Container container="@xxxs-shop/Search" />
//       <React component={CheckoutHeader} />
//       <Router routes={routes} />
//     </Fragment>
//   )
// }
//
// const Application = () => (
//   <Router routes>
//     <Route path="/checkout" container="@xxxs-shop/checkout" />
//     <Route container="@xxxs-shop/webshop" />
//   </Router>
// );

const Search: FunctionComponent = () => {
  return (
    <section className={styles["my-class"]}>
      <h1>Search</h1>
    </section>
  );
};

export default {
  type: 'react',
  component: Search,
};
