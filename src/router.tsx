import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { STATIC_CATEGORIES, STATIC_PRODUCTS } from "./lib/catalog-static";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
      catalog: {
        products: STATIC_PRODUCTS,
        categories: STATIC_CATEGORIES,
        source: "static" as const,
      },
    },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
