import { Response, NextFunction } from 'express';
import { clientFavoriteService } from '../services/clientFavorite.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedClientRequest } from '../middleware/auth';

export class ClientFavoriteController {
  async getFavorites(req: AuthenticatedClientRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await clientFavoriteService.getFavorites(req.clientUser!.id);
      sendSuccess(res, 'Favorite workspaces fetched.', result);
    } catch (error) {
      next(error);
    }
  }

  async toggleFavorite(req: AuthenticatedClientRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await clientFavoriteService.toggleFavorite(req.clientUser!.id, req.params.workspaceId);
      sendSuccess(res, result.isFavorited ? 'Added to favorites.' : 'Removed from favorites.', result);
    } catch (error) {
      next(error);
    }
  }
}

export const clientFavoriteController = new ClientFavoriteController();
