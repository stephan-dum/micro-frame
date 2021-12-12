import { IRouteProps } from "./types";

const getRouteMatch = (routes: IRouteProps[], pathname: string) => {
  for(let i = 0; i < routes.length; i++) {
    const route = routes[i];

    switch (Object.prototype.toString.call(route.path)) {
      case "[object Regexp]":
        const match = pathname.match(route.path);
        if (match && match.index === 0) {
          return {
            route,
            remaining: pathname.replace(match[0], ''),
            params: match.slice(1),
          }
        }
        break;
      case "[object String]":
        if (pathname.startsWith(route.path)) {
          return {
            route,
            remaining: pathname.replace(route.path, ''),
            params: [],
          };
        }
        break;
      default:
        return {
          route,
          remaining: pathname,
          params: [],
        };
    }
  }
}

export default getRouteMatch;
