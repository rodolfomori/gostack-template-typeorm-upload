// import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
export default class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);
    const {
      balance: { total },
    } = await transactionRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('You do not have enought money');
    }

    let transactionCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!transactionCategory) {
      transactionCategory = await categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategory);
    }

    const transaction = await transactionRepository.create({
      title,
      value,
      type,
      category_id: transactionCategory.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}
