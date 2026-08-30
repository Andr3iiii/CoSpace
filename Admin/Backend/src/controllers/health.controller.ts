import { Request, Response } from 'express';

export function getHealth(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    service: 'admin-backend',
    status: 'healthy',
  });
}
