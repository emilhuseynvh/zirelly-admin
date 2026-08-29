import { api } from "./base";
import type { ContactMessage, ContactPage, Paginated, Translations } from "./types";

export interface ContactPayload {
  email?: string | null;
  phone?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  linkedin_url?: string | null;
  map_embed_url?: string | null;
  translations?: Translations;
}

export const contactApi = api.injectEndpoints({
  endpoints: (build) => ({
    getContact: build.query<{ data: ContactPage }, void>({
      query: () => "contact?with_translations=1",
      providesTags: ["Contact"]
    }),
    updateContact: build.mutation<{ data: ContactPage }, ContactPayload>({
      query: (body) => ({ url: "contact", method: "PUT", body }),
      invalidatesTags: ["Contact"]
    }),
    getContactMessages: build.query<
      Paginated<ContactMessage>,
      { page?: number; status?: "read" | "unread" | ""; subject?: string }
    >({
      query: ({ page = 1, status, subject }) =>
        `contact/messages?page=${page}${status ? `&status=${status}` : ""}${subject ? `&subject=${encodeURIComponent(subject)}` : ""}`,
      providesTags: ["ContactMessage"]
    }),
    markMessageRead: build.mutation<{ data: ContactMessage }, { id: number; is_read: boolean }>({
      query: ({ id, is_read }) => ({
        url: `contact/messages/${id}/read`,
        method: "PUT",
        body: { is_read }
      }),
      invalidatesTags: ["ContactMessage"]
    }),
    deleteMessage: build.mutation<void, number>({
      query: (id) => ({ url: `contact/messages/${id}`, method: "DELETE" }),
      invalidatesTags: ["ContactMessage"]
    })
  })
});

export const {
  useGetContactQuery,
  useUpdateContactMutation,
  useGetContactMessagesQuery,
  useMarkMessageReadMutation,
  useDeleteMessageMutation
} = contactApi;
