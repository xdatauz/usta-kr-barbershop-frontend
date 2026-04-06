import api from "./client";

export interface ClientNotification {
  id: number;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export const getClientNotificationsApi = async (): Promise<ClientNotification[]> => {
  const { data } = await api.get<ClientNotification[]>("/client/notifications");
  return data;
};

export const markClientNotificationReadApi = async (id: number): Promise<void> => {
  await api.patch(`/client/notifications/${id}/read`);
};

export const markAllClientNotificationsReadApi = async (): Promise<void> => {
  await api.patch("/client/notifications/read-all");
};

export const deleteClientNotificationApi = async (id: number): Promise<void> => {
  await api.delete(`/client/notifications/${id}`);
};

export const deleteAllClientNotificationsApi = async (): Promise<void> => {
  await api.delete("/client/notifications");
};
