import { api } from "./base";
import type { Blog, Paginated } from "./types";

export const blogsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBlogs: build.query<Paginated<Blog>, { page?: number }>({
      query: ({ page = 1 }) => `blogs?page=${page}`,
      providesTags: ["Blog"]
    }),
    getBlog: build.query<{ data: Blog }, number>({
      query: (id) => `blogs/${id}?with_translations=1`,
      providesTags: (_r, _e, id) => [{ type: "Blog", id }]
    }),
    createBlog: build.mutation<{ data: Blog }, FormData>({
      query: (body) => ({ url: "blogs", method: "POST", body }),
      invalidatesTags: ["Blog"]
    }),
    updateBlog: build.mutation<{ data: Blog }, { id: number; body: FormData }>({
      query: ({ id, body }) => ({ url: `blogs/${id}`, method: "POST", body }),
      invalidatesTags: (_r, _e, { id }) => ["Blog", { type: "Blog", id }]
    }),
    deleteBlog: build.mutation<void, number>({
      query: (id) => ({ url: `blogs/${id}`, method: "DELETE" }),
      invalidatesTags: ["Blog"]
    })
  })
});

export const {
  useGetBlogsQuery,
  useGetBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation
} = blogsApi;
