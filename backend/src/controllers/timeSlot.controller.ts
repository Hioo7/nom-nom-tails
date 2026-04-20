import { Request, Response, NextFunction } from 'express';
import TimeSlotService from '../services/timeSlot.service';
import {
  parseCreateTimeSlotBody,
  parseUpdateTimeSlotBody,
  parseListTimeSlotsByDayQuery,
} from '../validators/timeSlot.validator';

const timeSlotService = TimeSlotService.getInstance();

export async function listTimeSlotsByDay(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { day } = parseListTimeSlotsByDayQuery(req.query);
    const slots = await timeSlotService.listByDay(day);
    res.status(200).json({ data: slots });
  } catch (err) {
    next(err);
  }
}

export async function getTimeSlot(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const slot = await timeSlotService.getTimeSlot(req.params['id'] as string);
    res.status(200).json({ data: slot });
  } catch (err) {
    next(err);
  }
}

export async function createTimeSlot(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseCreateTimeSlotBody(req.body);
    const slot = await timeSlotService.createTimeSlot(input);
    res.status(201).json({ data: slot });
  } catch (err) {
    next(err);
  }
}

export async function updateTimeSlot(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseUpdateTimeSlotBody(req.body);
    const slot = await timeSlotService.updateTimeSlot(req.params['id'] as string, input);
    res.status(200).json({ data: slot });
  } catch (err) {
    next(err);
  }
}

export async function deleteTimeSlot(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await timeSlotService.deleteTimeSlot(req.params['id'] as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
