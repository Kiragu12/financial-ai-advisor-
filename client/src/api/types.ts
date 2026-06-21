// Request and response types mirrored from Paul's backend.
// Each type matches a DTO the API actually returns (see server/src/modules/*).
// Money fields arrive as numbers (the backend converts numeric columns at its
// mapper boundary); dates are ISO strings, calendar dates are 'YYYY-MM-DD'.
// See ./client.ts for the typed fetch wrapper that returns these shapes.

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type HealthResponse = {
  status: 'ok';
  service: 'akiba-api';
  environment: string;
  timestamp: string;
};

// --- Auth ---
export type PublicUser = {
  id: string;
  fullName: string;
  email: string;
  preferredCurrency: string;
  createdAt: string;
};
export type AuthResponse = { user: PublicUser };
export type MeResponse = { user: PublicUser };

// --- Wallets ---
export type WalletType = 'cash' | 'mobile_money' | 'bank' | 'savings' | 'custom';
export type Wallet = {
  id: string;
  name: string;
  type: WalletType;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
export type WalletsResponse = { wallets: Wallet[] };
export type WalletResponse = { wallet: Wallet };

// --- Categories ---
export type CategoryType = 'income' | 'expense';
export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  color: string | null;
  icon: string | null;
  isDefault: boolean;
  isCustom: boolean;
};
export type CategoriesResponse = { categories: Category[] };

// --- Transactions ---
export type TransactionType = 'income' | 'expense' | 'transfer_in' | 'transfer_out';
export type Transaction = {
  id: string;
  walletId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  transactionDate: string;
  transferId: string | null;
  createdAt: string;
  updatedAt: string;
};
export type TransactionsResponse = { transactions: Transaction[] };
export type TransactionResponse = { transaction: Transaction };

// --- Transfers ---
export type Transfer = {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description: string | null;
  transferDate: string;
  createdAt: string;
  updatedAt: string;
};
export type TransfersResponse = { transfers: Transfer[] };
export type TransferResponse = { transfer: Transfer };

// --- Goals ---
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  status: GoalStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
};
export type Contribution = {
  id: string;
  goalId: string;
  walletId: string | null;
  amount: number;
  contributionDate: string;
  note: string | null;
  createdAt: string;
};
export type GoalsResponse = { goals: Goal[] };
export type GoalResponse = { goal: Goal };
export type ContributionResponse = { goal: Goal; contribution: Contribution };

// --- Dashboard ---
export type DashboardSummary = {
  totalBalance: number;
  currency: string;
  walletCount: number;
  income: { month: number; allTime: number };
  expense: { month: number; allTime: number };
  netThisMonth: number;
  goals: { active: number; completed: number; totalSaved: number; totalTarget: number };
};
export type SummaryResponse = { summary: DashboardSummary };
export type CategorySpending = {
  categoryId: string | null;
  name: string;
  amount: number;
  percentage: number;
};
export type SpendingByCategory = {
  from: string;
  to: string;
  total: number;
  categories: CategorySpending[];
};
export type CashflowMonth = { month: string; income: number; expense: number; net: number };
export type Cashflow = { months: CashflowMonth[] };

// --- Advisor ---
export type AdvisorRole = 'user' | 'assistant' | 'system';
export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};
export type AdvisorMessage = {
  id: string;
  role: AdvisorRole;
  content: string;
  createdAt: string;
};
export type ConversationDetail = Conversation & { messages: AdvisorMessage[] };
export type ConversationsResponse = { conversations: Conversation[] };
export type ConversationResponse = { conversation: ConversationDetail };
export type CreateConversationResponse = { conversation: Conversation };
export type SendMessageResponse = {
  userMessage: AdvisorMessage;
  assistantMessage: AdvisorMessage;
};
