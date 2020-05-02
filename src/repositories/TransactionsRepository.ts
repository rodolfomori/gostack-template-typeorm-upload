import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  transactions: Transaction[];
  balance: { income: number; outcome: number; total: number };
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find({
      select: ['id', 'title', 'value', 'type', 'updated_at', 'created_at'],
      relations: ['category'],
    });

    const income: number = transactions.reduce(
      (accumulator, current) =>
        current.type === 'income'
          ? Number(accumulator) + Number(current.value)
          : accumulator,
      0,
    );

    const outcome: number = transactions.reduce(
      (accumulator, current) =>
        current.type === 'outcome'
          ? Number(accumulator) + Number(current.value)
          : accumulator,
      0,
    );

    const allTransactions = {
      transactions,
      balance: {
        income,
        outcome,
        total: income - outcome,
      },
    };

    return allTransactions;
  }
}

export default TransactionsRepository;
