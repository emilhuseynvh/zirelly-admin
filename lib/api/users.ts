import { api } from "./base";
import type { Paginated, User } from "./types";

export interface UsersFilter {
  page?: number;
  per_page?: number;
  search?: string;
  role?: "user" | "admin" | "";
  verified?: "yes" | "no" | "";
  from?: string;
  to?: string;
  sort?: "id" | "name" | "created_at" | "orders_count" | "orders_total";
  dir?: "asc" | "desc";
}

export function buildUsersParams(filter: UsersFilter): URLSearchParams {
  const params = new URLSearchParams();
  if (filter.page) params.set("page", String(filter.page));
  if (filter.per_page) params.set("per_page", String(filter.per_page));
  if (filter.search) params.set("search", filter.search);
  if (filter.role) params.set("role", filter.role);
  if (filter.verified) params.set("verified", filter.verified);
  if (filter.from) params.set("from", filter.from);
  if (filter.to) params.set("to", filter.to);
  if (filter.sort) params.set("sort", filter.sort);
  if (filter.dir) params.set("dir", filter.dir);
  return params;
}

export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<Paginated<User>, UsersFilter>({
      query: (filter) => `admin/users?${buildUsersParams(filter).toString()}`,
      providesTags: ["Users"]
    })
  })
});

export const { useGetUsersQuery } = usersApi;
