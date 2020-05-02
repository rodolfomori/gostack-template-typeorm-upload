import csvParse from 'csv-parse';
import fs from 'fs';

import CreateTransactionServices from './CreateTransactionService';
import Transaction from '../models/Transaction';

interface NewTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: 'string';
}

const createTransactionServices = new CreateTransactionServices();

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const contactsReadStream = fs.createReadStream(filePath);
    const newTransactions: NewTransaction[] = [];
    const transactions: Transaction[] = [];

    const parsers = csvParse({
      from_line: 2,
    });

    const parseCSV = contactsReadStream.pipe(parsers);

    parseCSV.on('data', line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      newTransactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    // eslint-disable-next-line no-restricted-syntax
    for await (const transaction of newTransactions) {
      const { title, type, value, category } = transaction;
      const result = await createTransactionServices.execute({
        title,
        value,
        type,
        category,
      });
      transactions.push(result);
    }

    fs.unlinkSync(filePath);

    return transactions;
  }
}

export default ImportTransactionsService;
