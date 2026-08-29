import { api } from "./base";

export interface RedirectRule {
  id: number;
  from_path: string;
  to_path: string;
  code: 301 | 302;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RedirectPayload {
  from_path: string;
  to_path: string;
  code: 301 | 302;
  is_active?: boolean;
}

export const redirectsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRedirects: build.query<{ data: RedirectRule[] }, void>({
      query: () => "admin/redirects",
      providesTags: ["Redirect"]
    }),
    createRedirect: build.mutation<{ data: RedirectRule }, RedirectPayload>({
      query: (body) => ({ url: "admin/redirects", method: "POST", body }),
      invalidatesTags: ["Redirect"]
    }),
    updateRedirect: build.mutation<{ data: RedirectRule }, { id: number } & RedirectPayload>({
      query: ({ id, ...body }) => ({ url: `admin/redirects/${id}`, method: "PUT", body }),
      invalidatesTags: ["Redirect"]
    }),
    deleteRedirect: build.mutation<{ message: string }, number>({
      query: (id) => ({ url: `admin/redirects/${id}`, method: "DELETE" }),
      invalidatesTags: ["Redirect"]
    })
  })
});

export const {
  useGetRedirectsQuery,
  useCreateRedirectMutation,
  useUpdateRedirectMutation,
  useDeleteRedirectMutation
} = redirectsApi;
