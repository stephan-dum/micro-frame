const application = {
  type: 'router',
  routes: [
    {
      path: '/checkout',
      container: "@xxxs-shop/checkout",
    },
    {
      container: "@xxxs-shop/webshop",
    },
  ],
};

export default application;
