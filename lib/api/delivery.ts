import { api } from "./base";

export interface DeliverySettings {
  id: number;
  baku_fee: string;
  baku_free_threshold: string;
  region_fee: string;
  nakhchivan_fee: string;
  karabakh_fee: string;
  updated_at: string;
}

export interface DeliverySettingsPayload {
  baku_fee: number;
  baku_free_threshold: number;
  region_fee: number;
  nakhchivan_fee: number;
  karabakh_fee: number;
}

export const deliveryApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDeliverySettings: build.query<{ data: DeliverySettings }, void>({
      query: () => "admin/delivery-settings",
      providesTags: ["DeliverySettings"]
    }),
    updateDeliverySettings: build.mutation<{ data: DeliverySettings }, DeliverySettingsPayload>({
      query: (body) => ({ url: "admin/delivery-settings", method: "PUT", body }),
      invalidatesTags: ["DeliverySettings"]
    })
  })
});

export const { useGetDeliverySettingsQuery, useUpdateDeliverySettingsMutation } = deliveryApi;
