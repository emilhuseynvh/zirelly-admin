import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const getToken = () =>
  typeof document === "undefined"
    ? undefined
    : document.cookie.match(/(?:^|; )token=([^;]*)/)?.[1];

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api",
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${decodeURIComponent(token)}`);
      headers.set("Accept", "application/json");
      return headers;
    }
  }),
  tagTypes: [
    "Language",
    "Blog",
    "Product",
    "Home",
    "About",
    "Contact",
    "ContactMessage",
    "ProductsPage",
    "Popup",
    "Promocode",
    "Order",
    "OrderStats"
  ],
  endpoints: () => ({})
});
