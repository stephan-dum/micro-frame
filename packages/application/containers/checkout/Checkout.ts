import CheckoutStart from './pages/CheckoutStart';

const Checkout = {
  type: 'fragment',
  meta: [
    { tagName: 'title', children: ['checkout'] }
  ],
  children: [
    {
      type: "chunk",
      aboveFold: true,
      chunkName: 'checkout_header',
      chunk: () => import(/* webpackChunkName: "checkout_header" */ './components/CheckoutHeader'),
    },
    {
      type: 'router',
      routes: [
        {
          path: '/success',
          // async can push dependencies to parent chunk
          // if all other routes.component require the same dependency
          // or if the dependency is already in the parent chunk (ie react)
          chunkName: 'checkout_success',
          chunk: () => import(/* webpackChunkName: "checkout_success" */ './pages/CheckoutSuccess'),
        },
        {
          // sync all deps get merged into current chunk
          node: {
            type: 'react',
            component: CheckoutStart,
          },
        }
      ]
    }
  ]
};

export default Checkout;
