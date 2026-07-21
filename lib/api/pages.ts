import { api } from "./base";
import type { AboutPage, HomePage, Popup, ProductsPage, Translations } from "./types";

export interface AboutPayload {
  hero_image_id?: number | null;
  section_image_id?: number | null;
  translations?: Translations;
  items?: { translations: Translations }[];
}

export interface HomePayload {
  banner_image_id?: number | null;
  banner_link?: string | null;
  translations?: Translations;
  slides?: { image_id?: number | null; link?: string | null; translations: Translations }[];
  stats?: { value: string; translations: Translations }[];
  testimonials?: {
    name: string;
    rating: number;
    image_id?: number | null;
    translations: Translations;
  }[];
  faqs?: { translations: Translations }[];
}

export interface PopupPayload {
  image_id?: number | null;
  button_link?: string | null;
  delay_seconds?: number;
  is_active?: boolean;
  show_once?: boolean;
  translations?: Translations;
}

export interface ProductsPagePayload {
  side_image_id?: number | null;
  slides?: { image_id?: number | null; link?: string | null; translations: Translations }[];
  translations?: Translations;
}

export const pagesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAbout: build.query<{ data: AboutPage }, void>({
      query: () => "about?with_translations=1",
      providesTags: ["About"]
    }),
    updateAbout: build.mutation<{ data: AboutPage }, AboutPayload>({
      query: (body) => ({ url: "about", method: "PUT", body }),
      invalidatesTags: ["About"]
    }),
    getHome: build.query<{ data: HomePage }, void>({
      query: () => "home?with_translations=1",
      providesTags: ["Home"]
    }),
    updateHome: build.mutation<{ data: HomePage }, HomePayload>({
      query: (body) => ({ url: "home", method: "PUT", body }),
      invalidatesTags: ["Home"]
    }),
    getProductsPage: build.query<{ data: ProductsPage }, void>({
      query: () => "products-page?with_translations=1",
      providesTags: ["ProductsPage"]
    }),
    updateProductsPage: build.mutation<{ data: ProductsPage }, ProductsPagePayload>({
      query: (body) => ({ url: "products-page", method: "PUT", body }),
      invalidatesTags: ["ProductsPage"]
    }),
    getPopup: build.query<{ data: Popup }, void>({
      query: () => "popup?with_translations=1",
      providesTags: ["Popup"]
    }),
    updatePopup: build.mutation<{ data: Popup }, PopupPayload>({
      query: (body) => ({ url: "popup", method: "PUT", body }),
      invalidatesTags: ["Popup"]
    })
  })
});

export const {
  useGetAboutQuery,
  useUpdateAboutMutation,
  useGetHomeQuery,
  useUpdateHomeMutation,
  useGetProductsPageQuery,
  useGetPopupQuery,
  useUpdatePopupMutation,
  useUpdateProductsPageMutation
} = pagesApi;
