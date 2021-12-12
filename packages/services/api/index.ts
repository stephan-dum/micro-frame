import { APIServiceFactory } from "./types";

const APIService: APIServiceFactory = (options, { config }) => {
  return {
    fetch: (url) => {
      return Promise.resolve(new Response());
    }
  }
};

export default APIService;
