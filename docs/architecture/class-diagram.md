# Class Diagram

This diagram models the main domain classes for the personal finance tracker and AI advisor system. It is intentionally focused on the business model rather than framework details.

```mermaid
classDiagram
    direction LR

    class User {
        +UUID id
        +String fullName
        +String email
        +String passwordHash
        +String preferredCurrency
        +DateTime createdAt
        +DateTime updatedAt
        +register()
        +login()
    }

    class Wallet {
        +UUID id
        +UUID userId
        +String name
        +WalletType type
        +String currency
        +Decimal openingBalance
        +Decimal currentBalance
        +Boolean isActive
        +DateTime createdAt
        +DateTime updatedAt
        +credit(amount)
        +debit(amount)
        +deactivate()
    }

    class Category {
        +UUID id
        +UUID userId
        +String name
        +CategoryType type
        +String color
        +String icon
        +Boolean isDefault
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Transaction {
        +UUID id
        +UUID userId
        +UUID walletId
        +UUID categoryId
        +TransactionType type
        +Decimal amount
        +String description
        +Date transactionDate
        +UUID transferId
        +DateTime createdAt
        +DateTime updatedAt
        +DateTime deletedAt
        +isIncome()
        +isExpense()
        +affectsBalance()
    }

    class Transfer {
        +UUID id
        +UUID userId
        +UUID fromWalletId
        +UUID toWalletId
        +Decimal amount
        +String description
        +Date transferDate
        +DateTime createdAt
        +DateTime updatedAt
        +execute()
    }

    class SavingsGoal {
        +UUID id
        +UUID userId
        +String name
        +Decimal targetAmount
        +Decimal currentAmount
        +Date deadline
        +GoalStatus status
        +DateTime createdAt
        +DateTime updatedAt
        +contribute(amount)
        +progressPercentage()
        +markCompleted()
    }

    class GoalContribution {
        +UUID id
        +UUID userId
        +UUID goalId
        +UUID walletId
        +Decimal amount
        +Date contributionDate
        +String note
        +DateTime createdAt
    }

    class AdvisorConversation {
        +UUID id
        +UUID userId
        +String title
        +DateTime createdAt
        +DateTime updatedAt
        +addMessage(message)
        +recentMessages(limit)
    }

    class AdvisorMessage {
        +UUID id
        +UUID conversationId
        +MessageRole role
        +String content
        +JSON contextSnapshot
        +String model
        +DateTime createdAt
    }

    class AuthService {
        +register(input)
        +login(email, password)
        +hashPassword(password)
        +verifyPassword(password, passwordHash)
        +getCurrentUser(session)
    }

    class WalletService {
        +createWallet(userId, input)
        +listWallets(userId)
        +updateWallet(userId, walletId, input)
        +deactivateWallet(userId, walletId)
        +assertOwnership(userId, walletId)
    }

    class TransactionService {
        +recordIncome(userId, input)
        +recordExpense(userId, input)
        +deleteTransaction(userId, transactionId)
        +updateWalletBalance(walletId, type, amount)
    }

    class TransferService {
        +transferBetweenWallets(userId, input)
        +assertSufficientFunds(walletId, amount)
    }

    class GoalService {
        +createGoal(userId, input)
        +contributeToGoal(userId, goalId, input)
        +updateGoal(userId, goalId, input)
        +calculateProgress(goalId)
    }

    class DashboardService {
        +getSummary(userId)
        +getSpendingByCategory(userId, range)
        +getCashflow(userId, range)
        +getGoalProgress(userId)
    }

    class AdvisorService {
        +createConversation(userId, input)
        +askQuestion(userId, conversationId, question)
        +buildFinancialContext(userId)
        +buildPrompt(context, messages, question)
        +saveAssistantResponse(conversationId, response)
    }

    User "1" --> "0..*" Wallet : owns
    User "1" --> "0..*" Category : defines
    User "1" --> "0..*" Transaction : records
    User "1" --> "0..*" Transfer : performs
    User "1" --> "0..*" SavingsGoal : sets
    User "1" --> "0..*" AdvisorConversation : has

    Wallet "1" --> "0..*" Transaction : contains
    Category "1" --> "0..*" Transaction : classifies
    Transfer "1" --> "2" Transaction : creates
    SavingsGoal "1" --> "0..*" GoalContribution : receives
    Wallet "1" --> "0..*" GoalContribution : funds
    AdvisorConversation "1" --> "0..*" AdvisorMessage : contains

    AuthService ..> User : manages
    WalletService ..> Wallet : manages
    TransactionService ..> Transaction : records
    TransactionService ..> Wallet : updates balance
    TransferService ..> Transfer : creates
    TransferService ..> Wallet : moves funds
    TransferService ..> Transaction : creates entries
    GoalService ..> SavingsGoal : manages
    GoalService ..> GoalContribution : records
    GoalService ..> Wallet : deducts funds
    DashboardService ..> Wallet : summarizes
    DashboardService ..> Transaction : analyzes
    DashboardService ..> SavingsGoal : summarizes
    AdvisorService ..> AdvisorConversation : manages
    AdvisorService ..> AdvisorMessage : stores
    AdvisorService ..> Transaction : summarizes
    AdvisorService ..> Wallet : summarizes
    AdvisorService ..> SavingsGoal : summarizes
```

## Notes

- The diagram separates domain classes from service classes.
- Domain classes represent persistent business concepts.
- Service classes represent workflows and business rules.
- Controllers are intentionally omitted because they mainly translate HTTP requests into service calls.
- Repositories are also omitted from this first diagram to keep it readable; they will appear in implementation architecture if needed.

## Important Design Choices Reflected

- A `User` owns all private financial records.
- A `Wallet` stores `currentBalance` for version one.
- A `Transaction` affects exactly one wallet.
- A `Transfer` creates two linked transaction entries.
- A `SavingsGoal` receives many `GoalContribution` records.
- `AdvisorConversation` and `AdvisorMessage` preserve AI advisor history.
- `AdvisorService` builds context from trusted stored data rather than relying on client-side summaries.
