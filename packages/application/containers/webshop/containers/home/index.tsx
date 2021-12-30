import { StreamNode } from '@micro-frame/core/types';
import { IPrepassComponent } from "@micro-frame/plugin-preact/types";
interface HelloProps {
  data: string;
}

// @ts-ignore
const Hello: IPrepassComponent<HelloProps> = ({ data }) => <div>{data}</div>;

Hello.asyncData = () =>
  new Promise((resolve) => {
    // setTimeout(() => {
      resolve({ data: 'fubar' });
    // }, 3000);
  });

const Home: StreamNode = {
  type: 'preact',
  component: Hello,
};

export default Home;
