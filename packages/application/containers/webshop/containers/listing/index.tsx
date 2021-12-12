import React, { Fragment, FunctionComponent, ReactElement, useCallback, useState } from 'react';
import classNames from 'classnames';
import titleToSrc from '../../utils/titleToSrc';

const SortFilter = (props: IFacet) => {};
const RangeFilter = (props: IFacet) => {};
const MultiSelectFilter = (props: IFacet) => {};
const GroupFilter = (props: IFacet) => {};
const filterTypes = {
  sort: SortFilter,
  range: RangeFilter,
  multi: MultiSelectFilter,
  group: GroupFilter,
};
interface IFacet {
  id: string;
  type: 'multi' | 'range' | 'group' | 'sort';
}
const Facet = (props: IFacet) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((oldIsOpen) => !oldIsOpen), []);

  return (
    <div className={classNames(isOpen && '--open')}>
      <button onClick={toggle} />
      {isOpen && filterTypes[props.type](props)}
    </div>
  );
};
interface IProduct {
  title: string;
}
const mapListingProducts = ({ title }: IProduct) => (
  <article>
    <a href={`product/${title}`}>
      <img src={`product/${titleToSrc(title)}.png`} />
      {title}
    </a>
  </article>
);

interface IListingProps {
  facets: IFacet[];
  searchResults: IProduct[];
}

const Listing: FunctionComponent<IListingProps> = ({ facets, searchResults }) => {
  return (
    <Fragment>
      <form>
        <ul>
          {facets.map((facet) => (
            <li key={facet.id}>
              <Facet {...facet} />
            </li>
          ))}
        </ul>
        <ul>
          <li>reset filters</li>
        </ul>
      </form>
      <section>{searchResults.map(mapListingProducts)}</section>
    </Fragment>
  );
};
//
// Listing.prefetch = async (db) => {
//   db.query({})
// };

export default Listing;
