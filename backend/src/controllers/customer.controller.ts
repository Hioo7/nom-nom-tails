import { NextFunction, Request, Response } from 'express';
import CustomerService from '../services/customer.service';
import {
  parseCustomerParams,
  parseUpdateCustomerLoyaltyBody,
} from '../validators/customer.validator';

const customerService = CustomerService.getInstance();

export async function listCustomers(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const customers = await customerService.listCustomers();
    res.status(200).json({ data: customers });
  } catch (err) {
    next(err);
  }
}

export async function updateCustomerLoyalty(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const params = parseCustomerParams(req.params as object);
    const input = parseUpdateCustomerLoyaltyBody(req.body);
    const customer = await customerService.updateCustomerLoyalty(params.id, input);
    res.status(200).json({ data: customer });
  } catch (err) {
    next(err);
  }
}
