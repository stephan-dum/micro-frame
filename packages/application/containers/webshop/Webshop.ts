import Navigation from './components/Navigation';
import Error from './components/Error';
import Footer from './components/Footer';
import styles from './Webshop.scss';

const Webshop = {
  type: 'fragment',
  meta: [
    { tagName: 'title', children: ['webshop'] }
  ],
  Wrapper: {
    tagName: 'main', props: { className: styles.webshop },
  },
  children: [
    {
      type: 'react',
      component: Navigation,
      aboveFold: true,
    },
    {
      type: 'router',
      routes: [
        {
          path: /^\//,
          container: '@xxxs-shop/home',
        },
        {
          path: /search/i,
          container: '@xxxs-shop/search',
          aboveFold: true,
        },
        {
          node: {
            type: 'react',
            component: Error,
          },
        },
      ],
    },
    {
      type: 'react',
      component: Footer,
    },
  ],
};

export default Webshop;
