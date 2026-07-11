/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import BaseServices from '../baseServices';
import { IPurchase } from './purchase.interface';
import Purchase from './purchase.model';
import sortAndPaginatePipeline from '../../lib/sortAndPaginate.pipeline';

class PurchaseServices extends BaseServices<any> {
  constructor(model: any, modelName: string) {
    super(model, modelName);
  }

  /**
   * Create new sale and decrease product stock
   */
  async create(payload: IPurchase, userId: string) {
    const { unitPrice, quantity } = payload;
    payload.user = new Types.ObjectId(userId);
    payload.totalPrice = unitPrice * quantity;

    return this.model.create(payload);
  }

  /**
   * Read all category of user
   */
  async getAll(userId: string, query: Record<string, unknown>) {
    const search = query.search ? query.search : '';

    const data = await this.model.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          $or: [{ sellerName: { $regex: search, $options: 'i' } }, { productName: { $regex: search, $options: 'i' } }]
        }
      },
      ...sortAndPaginatePipeline(query)
    ]);

    const totalCount = await this.model.find({ user: userId }).countDocuments();

    return { data, totalCount };
  }

  /**
   * Update purchase and adjust total price
   */
  async update(id: string, payload: any) {
    await this._isExists(id);
    const purchase = await this.model.findById(id);
    
    const updatedQty = payload.quantity !== undefined ? payload.quantity : purchase.quantity;
    const updatedPrice = payload.unitPrice !== undefined ? payload.unitPrice : purchase.unitPrice;
    
    payload.totalPrice = updatedQty * updatedPrice;

    return this.model.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  }
}

const purchaseServices = new PurchaseServices(Purchase, 'Purchase');
export default purchaseServices;
