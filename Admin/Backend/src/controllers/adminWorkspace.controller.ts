import { Response, NextFunction } from 'express';
import { adminWorkspaceService } from '../services/adminWorkspace.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedAdminRequest } from '../middleware/auth';

export class AdminWorkspaceController {
  async getWorkspaces(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminWorkspaceService.getWorkspaces(req.query as any);
      sendSuccess(res, 'Workspaces fetched successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceById(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminWorkspaceService.getWorkspaceById(req.params.id);
      sendSuccess(res, 'Workspace details fetched.', result);
    } catch (error) {
      next(error);
    }
  }

  async createWorkspace(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminWorkspaceService.createWorkspace(req.body);
      sendSuccess(res, 'Workspace created successfully.', result, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateWorkspace(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminWorkspaceService.updateWorkspace(req.params.id, req.body);
      sendSuccess(res, 'Workspace updated successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      const result = await adminWorkspaceService.updateWorkspaceStatus(req.params.id, status);
      sendSuccess(res, `Workspace status updated to ${status}.`, result);
    } catch (error) {
      next(error);
    }
  }

  async getMetadata(_req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const [types, amenities] = await Promise.all([
        adminWorkspaceService.getWorkspaceTypes(),
        adminWorkspaceService.getAmenities(),
      ]);
      sendSuccess(res, 'Metadata fetched successfully.', { types, amenities });
    } catch (error) {
      next(error);
    }
  }
}

export const adminWorkspaceController = new AdminWorkspaceController();
