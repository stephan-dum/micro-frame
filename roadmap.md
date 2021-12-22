## road map
- styles for externals
- refactor and clean up
- HMR
- testing all pages should stay at 100% ;)
- logger service to the context of each level as (error)
- currently, a container can only have one set of dependencies
  this is not always true because a parent dependency could be different
- refactor to use allow jsx syntax for micro frame container and Wrappers
- this can also be transferred to a different syntax
````ts
export default [
  {
    type: 'container',
    container: '@xxxs-shop/Search'
  },
  {
    type: 'react',
    component: CheckoutHeader,
  },
  {
    type: 'router',
    routes,
  }
];
````
vs
````jsx
export default (
  <Fragment>
    <Container container="@xxxs-shop/Search" />
    <React component={CheckoutHeader} />
    <Router routes={routes} />
  </Fragment>
);
````
- tracking service: as service that track the page load performance values of each visitor
  - GDBR popup to (dis)allow tracking
  - there needs to be an example page to display the data afterwards
- service worker build
  - offline mode
- service for nosql database
- experiment service: an experiment with tree versions
  - ie colors for button of GDBR popup
- improve provide and inject
  - inject should use the real provide instead of mock fallback
  - option to call setHead by default to allow molecules to be started without title (default to container name)
- detect all changed files ie git diff and only build needed containers (needed for deployment)
- hash package.json for each container to avoid external build if all are the same
- above the fold image example
- re-hash overwritten assets in federation builds
- try other bundlers ie parcel
- try speedy web compiler instead of ts and babel loader
- add font preload
- svg service
- translation service
- styles based on rail / tenant 
