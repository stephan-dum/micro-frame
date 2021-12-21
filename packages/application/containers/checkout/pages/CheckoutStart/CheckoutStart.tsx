import { IPrepassComponent } from "@micro-frame/plugin-react/types";
import style from './CheckoutStart.scss';

const CheckoutAddressForm: IPrepassComponent = () => {
  return (
    <main className={style.start}>
      <h1>AddressForm</h1>
      <form action="/checkout/success" method="POST">
        <p>...</p>
        <input type="submit"/>
      </form>
    </main>
  );
};

export default CheckoutAddressForm;
