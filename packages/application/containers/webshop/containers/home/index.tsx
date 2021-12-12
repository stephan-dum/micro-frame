import { StreamNode } from '@micro-frame/core/types';
import { IPrepassComponent } from "@micro-frame/plugin-react/types";
interface HelloProps {
  data: string;
}

const Hello: IPrepassComponent<HelloProps> = ({ data }) => {
  return <div>{data}</div>;
};

Hello.asyncData = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: 'fubar' });
    }, 3000);
  });

const Home: StreamNode = [
  {
    type: 'react',
    component: Hello,
  },
];

export default Home;
