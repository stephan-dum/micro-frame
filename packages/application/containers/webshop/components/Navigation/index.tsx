import { FunctionComponent } from 'react';
// import useIcon from "@xxxs-shop/react-hooks-icon";

const Navigation: FunctionComponent = () => (
  <header>
    <ul>
      <li>
        {/*<img src={useIcon('icon-name')} />*/}
        <a href="/checkout">checkout</a>
      </li>
    </ul>
  </header>
);

export default Navigation;
