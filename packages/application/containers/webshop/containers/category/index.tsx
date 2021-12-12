import React, { FunctionComponent } from 'react';

import titleToSrc from '@xxxs-shop/utils/titleToSrc';
import Listing from '@xxxs-shop/listing';

import { StreamNode } from '@micro-frame/core/types';
import {IPrepassComponent} from "@micro-frame/plugin-react/types";

const mapChildCategories = (title: string) => (
  <li>
    <a href={`/category/${title}`}>
      <img src={`/category/${titleToSrc(title)}.png`} />
      {title}
    </a>
  </li>
);

interface ICategoryProps {
  title: string;
  childCategories: string[];
}
interface IContentSlotProps {
  data: string;
}
const CMSContent: IPrepassComponent<IContentSlotProps> = ({ data }) => {
  return <span>{data}</span>;
};

CMSContent.asyncData = async ({ params: { pageId, key } }) => ({
  data: await fetch(`./content/${pageId}_${key}`),
});

const SubCategoryTiles: FunctionComponent<ICategoryProps> = ({ title, childCategories }) => (
  <article>
    <h1>{title}</h1>
    <ul>{childCategories.map(mapChildCategories)}</ul>
  </article>
);

const Category: StreamNode = ({ params: { pageId, title } }) => [
  {
    type: 'react',
    component: SubCategoryTiles,
    aboveFold: true,
    props: { title, childCategories: ['ab'] },
  },
  {
    type: 'react',
    component: Listing,
    props: { filter: [{ type: 'invisible', column: 'category', value: title }] },
  },
  {
    type: 'react',
    component: CMSContent,
    props: { pageId, key: 'bottom' },
  },
];

export default Category;
