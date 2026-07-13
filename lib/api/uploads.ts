import { api } from "./base";
import type { Upload } from "./types";

export const uploadsApi = api.injectEndpoints({
  endpoints: (build) => ({
    uploadImage: build.mutation<{ data: Upload }, File>({
      query: (file) => {
        const body = new FormData();
        body.append("image", file);
        return { url: "uploads", method: "POST", body };
      }
    }),
    deleteUpload: build.mutation<void, number>({
      query: (id) => ({ url: `uploads/${id}`, method: "DELETE" })
    })
  })
});

export const { useUploadImageMutation, useDeleteUploadMutation } = uploadsApi;
