# micro-frame
A framework for modular universal federation build with ssr streaming and micro frontends.

:warning: this is a very early alpha version.

## Abstract

### Goals
- split up into multiple containers to improve performance
- federation build: share dependencies between all containers
- universal builds: use the same build for different environments 
- client runtime with routing for clicks and form submits
- ssr with streaming
- isolated execution: start only into a certain container
- shared services between nodes
- multiple framework / library possible

### webpack & federations
- hard to find documentation
- the current concept involves a lot of lazy loading
- chunk sizes can get to small if there are a lot of small components
  => atomic (ie button) should not be use as container but just as an external dependency!
- dependencies could often be resolved already at compile time to allow better chunking and improve execution time
- issues with ES module builds
  - it's experimental
  - hmr is not working
  - bundle analyzer display stats from files

[https://module-federation.github.io/](https://module-federation.github.io/)

[https://github.com/module-federation/module-federation-examples](https://github.com/module-federation/module-federation-examples)

### yarn plug and play (PnP)

set of best practice for modularization defined by yarn (facebook).
- [why shoul you update to yarn](https://yarnpkg.com/getting-started/qa)
- [PnP API](https://yarnpkg.com/features/pnp)
- [migration path](https://yarnpkg.com/getting-started/migration)

resolves dependencies while installation and creates a mapping saved to `.pnp.cjs` file.

It is injected at runtime, which means that you must always use yarn or dependencies will not be injected. (ie `yarn node ./index.js` vs `node ./index.js`)
to avoid this put them into package.json scripts as they will be auto prefixed there

also avoid relative paths: if you want to use a package it must be in package.json, even it's in the same mono repository

require.resolve should be used instead of path.*
`require.resolve(dependencyName, { paths: [PROJECT_DIR, parentPackageDir] });` 

**workspaces**
- used for mono repository indicate sub packages 
- offers utilities ie `workspaces-each [command]` 
- prefers local packages if the versions match
  => no need for link, lerna, yalc... anymore
**.pnp.cjs file**
- package manager should resolve all dependencies and provide a mapping
- comparable to ./dist/private/externals/index.js
- injected at runtime to avoid resolves from filesystem
- can be split with workspaces 
  

## micro nodes
must always contain a type property
can be a plain object or a function that receives the current render context

general config is in the root folder `micro-frame.[jt]s` files.
````typescript
export interface MicroFrameConfig {
  plugins: MicroFramePlugin[];
  port: number;
  root: string;
  publicPath: string;
  privatePath: string;
  staticPath: string;
}
````
Each container needs to define one a `micro-frame.[jt]s` file currently.
This is used by webpack/getContainerConfig.ts
````typescript
export interface MicroFrameContainerConfig {
  name: string;
  dist?:string | { public?: string, private?: string; };
  tsConfig?: string;
  provides?: RawProvide;
  injects?: RawInject[];
  entry?: string;
  externals?: RawExternalModule[];
  services?: string[];
  statsFile?: string;
}
````
### chunk
the inner async parts of a container
needs a chunkName to match assetsByChunkName from webpack stats file within the container
this will manage all the assets related an internal webpack chunk
ie how to load them: inline vs preload & below the fold
if aboveFold is true then assets will be inline while ssr
````typescript
export default {
  type: 'chunk',
  chunkName: 'my-chunk',
  chunk: () => import('./my-chunk'),
  aboveFold: true,
}
````

### container
inherits from chunk 
can be started and executed independent
container name references a dependency form package.json
````typescript
export default {
  type: 'container',
  name: 'my-container',
  aboveFold: true,
}
````
### fragment
similar to react fragment to wrap multiple nodes, an array will be translated to fragment and acts as a shorthand.
A Wrapper is a universal createElement similar to react, currently only the json notation is valid.
It is used to send children while the end tag is not send

to produce the following html a wrapper for main is needed
````html
<nav></nav>
<main class="my-class">
  <section></section>
  <aside></aside>
</main>
````

````typescript
import styles from './some.scss';

export default (context) => [
  {
    type: 'react',
    component: Navigation
  },
  {
    type: 'fragment',
    Wrapper: { tagName: 'main', props: { className: styles['my-class'] } },
    children: [
      {
        type: 'fetch',
        url: `/render/article/${context.params.id}`,
      },
      {
        type: 'preact',
        component: Comments,
      }
    ]
  }
]
````

### fetch
this will fetch html from the given url and inject it, it also accepts options for fetch
````typescript
export default {
  type: 'fetch',
  url: '/my-ssr-component',
  options: {
    headers: {
      'my-header': 'value',
    }
  }
}
````
### react
creates an independent react root which has one preassign context to handle hooks
provides a default wrapper that generate the dom node on which react will be mounted,
can be overwritten with the Wrapper option (see fragment).

````typescript
const MyComponent = () => {
  
}
MyComponent.asynData = async () => {};

export default {
  type: 'react',
  component: MyComponent,
}
````

### router
````typescript
import Error from './error';

export default {
  type: 'router',
  routes: [
    {
      path: /my-path/,
      container: 'my-container'
    },
    {
      // named capture groups also possible
      path: /other\/(?<propname>\w+)/,
      chunk: () => import('my-chunk')
    },
    {
      node: {
        type: 'react',
        component: Error,
      }
    }
  ]
}
````

## externals
Externals are dependencies from you packages.json that should ne be included in you build and will be injected later.
to is important to improve build performance as well as allow better long term caching for dependencies at rarely change.

## CLI

### dev
controls how build and start the application for developers

#### flags
all flags are optional

-c --container:
the root container to start from
:warning: currently only container that have a meta or call setHead explicitly can be used (ie search is not calling it)
(default root property from `PROJECT_ROOT/micro-frame.js`)

-a --analyze:
bundle analyzer modes:
server, disabled (default)

-m --mode:
production or development (default)

-w --watch:
passed to webpack verbatim (default: based mode)

#### example
````bash
yarn dev --container checkout --analyze server --mode production
```` 
