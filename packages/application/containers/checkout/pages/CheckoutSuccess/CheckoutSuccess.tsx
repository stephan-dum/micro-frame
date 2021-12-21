import { IPrepassComponent } from "@micro-frame/plugin-react/types";
import style from './CheckoutSuccess.scss';

const CheckoutSuccess: IPrepassComponent = () => {
  return (
    <main className={style["my-success"]}>
      <h1>Success</h1>
    </main>
  );
};

export default {
  type: 'react',
  component: CheckoutSuccess,
};
