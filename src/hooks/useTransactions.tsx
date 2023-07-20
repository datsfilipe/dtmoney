import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'

interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: string;
  category: string;
  createdAt: string;
}

interface TransactionsContextData {
  transactions: Transaction[];
  createTransaction: (transaction: TransactionInput) => Promise<void>;
}

type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>

interface TransactionsProviderProps {
  children: ReactNode;
}

const TransactionsContext = createContext<TransactionsContextData>({} as TransactionsContextData)

export function TransactionsProvider ({ children }: TransactionsProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      api.get('transactions')
        .then(response => setTransactions(response.data.transactions))
    } else {
      const transactionsValue = JSON.parse(localStorage.getItem('transactions') || '[]')
      if (transactionsValue) {
        setTransactions(transactionsValue)
      }
    }
  }, [])

  async function createTransaction(transactionInput: TransactionInput) {
    let newTransaction: Transaction
    if (process.env.NODE_ENV === 'development') {
      const response = await api.post('transactions', {
        ...transactionInput,
        createdAt: new Date(),
      })

      const { transaction } = response.data
      newTransaction = transaction
    } else {
      newTransaction = {
        id: Math.random(),
        createdAt: new Date().toString(),
        ...transactionInput
      }
    }

    setTransactions([...transactions, newTransaction])
    localStorage.setItem('transactions', JSON.stringify([...transactions, newTransaction]))
  }

  return (
    <TransactionsContext.Provider value={{transactions, createTransaction}}>
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions () {
  const context = useContext(TransactionsContext)

  return context
}
