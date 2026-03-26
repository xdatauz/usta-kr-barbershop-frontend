import { apiRequest } from "./client";

export interface ClientNotification {
  id: number;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export const getClientNotificationsApi = (): Promise<ClientNotification[]> =>
  apiRequest("/client/notifications", { method: "GET", auth: true });

export const markClientNotificationReadApi = (id: number): Promise<void> =>
  apiRequest(`/client/notifications/${id}/read`, { method: "PATCH", auth: true });

export const markAllClientNotificationsReadApi = (): Promise<void> =>
  apiRequest("/client/notifications/read-all", { method: "PATCH", auth: true });

export const deleteClientNotificationApi = (id: number): Promise<void> =>
  apiRequest(`/client/notifications/${id}`, { method: "DELETE", auth: true });

export const deleteAllClientNotificationsApi = (): Promise<void> =>
  apiRequest("/client/notifications", { method: "DELETE", auth: true });
