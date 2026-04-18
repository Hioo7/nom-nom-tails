import { Request, Response, NextFunction } from 'express';
import UserService from '../services/user.service';
import { parseCreateUserBody, parseUpdateUserBody } from '../validators/user.validator';

const userService = UserService.getInstance();

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await userService.listStaff();
    res.status(200).json({ data: users });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.getStaffMember(req.params['id'] as string);
    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = parseCreateUserBody(req.body);
    const user = await userService.createStaffMember(input);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = parseUpdateUserBody(req.body);
    const user = await userService.updateStaffMember(
      req.params['id'] as string,
      req.user!.id,
      input,
    );
    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.deleteStaffMember(req.params['id'] as string, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
