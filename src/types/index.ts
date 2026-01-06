export type Profile = {
  id: string
  email: string | null
  full_name: string | null
  household_id: string | null
  role: 'admin' | 'member'
  created_at: string
}

export type Wallet = {
  id: string
  household_id: string
  name: string
  type: 'personal' | 'shared'
  owner_id: string | null
  balance: number
}

export type Category = {
  id: string
  household_id: string | null
  name: string
  icon: string | null
  type: 'expense' | 'income'
}

export type Subcategory = {
  id: string
  category_id: string
  name: string
}

export type Expense = {
  id: string
  household_id: string
  amount: number
  date: string
  description: string | null
  category_id: string | null
  subcategory_id: string | null
  paid_by_wallet_id: string | null
  payment_mode: string | null
  attachment_url: string | null
  created_by_user_id: string | null
  created_at: string
  is_deleted: boolean
  
  // Joins
  category?: Category
  subcategory?: Subcategory
  wallet?: Wallet
  beneficiaries?: ExpenseBeneficiary[]
}

export type ExpenseBeneficiary = {
  id: string
  expense_id: string
  user_id: string
  percentage: number | null
  amount: number | null
  
  // Join
  user?: Profile
}

export type InventoryItem = {
  id: string
  household_id: string
  name: string
  category_id: string | null
  quantity: number
  unit: string | null
  cost_per_unit: number | null
  expiry_date: string | null
  status: 'in_stock' | 'low' | 'expired'
  created_at: string
}
