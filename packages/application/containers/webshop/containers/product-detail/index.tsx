import React, { FunctionComponent } from 'react';
import titleToSrc from "@xxxs-shop/utils/titleToSrc";

const ProductOverview = ({ title }) => {
  return (
    <section key="overview">
      <picture>
        <img src={`${titleToSrc(title)}.png`} />
      </picture>
      <article>
        <h1>{title}</h1>
        {/*<Price/>*/}
        {/*<AddToFavourites/>*/}
        {/*<AddToCart/>*/}
        {/*<Eyecatchers/>*/}
      </article>
    </section>
  )
};

const Product = ({ title }) => {
  return [
    ProductOverview,
    <CMSContent pageId={pageId} key="product-description" />,
    <CMSContent pageId={pageId} key="product-details" />,
    <RichRelevanceSlider />,
    <GoogleRecommendationSlider />
  ];
};

export default Product;
