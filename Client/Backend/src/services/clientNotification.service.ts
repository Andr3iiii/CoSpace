import { clientNotificationRepository } from '../repositories/clientNotification.repository';

export class ClientNotificationService {
  async getNotifications(clientId: string) {
    return clientNotificationRepository.getNotifications(clientId);
  }

  async markAsRead(id: string, clientId: string) {
    return clientNotificationRepository.markAsRead(id, clientId);
  }
}

export const clientNotificationService = new ClientNotificationService();
