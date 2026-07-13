import { api } from "./base";
import type { User } from "./types";

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<{ token: string; user: User }, { email: string; password: string }>({
      query: (body) => ({ url: "auth/login", method: "POST", body })
    }),
    logout: build.mutation<{ message: string }, void>({
      query: () => ({ url: "auth/logout", method: "POST" })
    }),
    me: build.query<{ data: User }, void>({
      query: () => "auth/me"
    })
  })
});

export const { useLoginMutation, useLogoutMutation, useMeQuery } = authApi;
