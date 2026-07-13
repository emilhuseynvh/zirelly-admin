import { api } from "./base";
import type { Language } from "./types";

type LanguagePayload = Partial<
  Pick<Language, "code" | "name" | "native_name" | "is_default" | "is_active" | "position">
>;

export const languagesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getLanguages: build.query<{ data: Language[] }, void>({
      query: () => "languages",
      providesTags: ["Language"]
    }),
    createLanguage: build.mutation<{ data: Language }, LanguagePayload>({
      query: (body) => ({ url: "languages", method: "POST", body }),
      invalidatesTags: ["Language"]
    }),
    updateLanguage: build.mutation<{ data: Language }, { id: number; body: LanguagePayload }>({
      query: ({ id, body }) => ({ url: `languages/${id}`, method: "PUT", body }),
      invalidatesTags: ["Language"]
    }),
    deleteLanguage: build.mutation<void, number>({
      query: (id) => ({ url: `languages/${id}`, method: "DELETE" }),
      invalidatesTags: ["Language"]
    })
  })
});

export const {
  useGetLanguagesQuery,
  useCreateLanguageMutation,
  useUpdateLanguageMutation,
  useDeleteLanguageMutation
} = languagesApi;
