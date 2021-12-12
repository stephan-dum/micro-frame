import { IPrepassComponent } from "@micro-frame/plugin-react/types";
import './CheckoutSuccess.scss';

const CheckoutSuccess: IPrepassComponent = () => {
  return (
    <main className="my-success">
      <h1>Success</h1>
    </main>
  );
};

export default {
  type: 'react',
  component: CheckoutSuccess,
};
