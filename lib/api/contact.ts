import { api } from "./base";
import type { ContactMessage, ContactPage, Paginated, Translations } from "./types";

export interface ContactPayload {
  email?: string | null;
  phone?: string | null;
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
    getContactMessages: build.query<Paginated<ContactMessage>, { page?: number; unread?: boolean }>({
      query: ({ page = 1, unread = false }) =>
        `contact/messages?page=${page}${unread ? "&unread=1" : ""}`,
      providesTags: ["ContactMessage"]
    }),
    markMessageRead: build.mutation<{ data: ContactMessage }, number>({
      query: (id) => ({ url: `contact/messages/${id}/read`, method: "PUT" }),
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
