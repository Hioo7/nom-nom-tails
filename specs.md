# Dog Food Ordering System — Specs

## Roles

| Role | Responsibilities |
|---|---|
| `SUPER_ADMIN` | Login, edit own profile, create / edit / delete any account in the system. Only one exists. |
| `ADMIN` | Manage customers (incl. loyalty status), view & manage orders, manage settlements, create/edit dishes, manage ingredients, create/edit time slots, create/edit meal plans, view subscriptions. |
| `CUSTOMER` | View dishes (must be logged in), place orders, browse and purchase meal plan subscriptions, pick delivery time slots. Can be promoted to loyalty status by admin. |
| `DELIVERY_PARTNER` | Browse available (unclaimed) delivery tasks, self-capture tasks, mark each as done or not done, upload 1–10 proof photos per delivery. |

---

## Business Rules

- Money is always stored as `Int` in **paise** (₹1 = 100 paise). Render as rupees in the UI by dividing by 100.
- Ingredient quantities use `Float` since they are physical measurements (kg, g, liters, etc.).
- The admin "upcoming orders" view shows all orders with a `deliveryDate` within the next 2 days, along with the total ingredient quantities required to fulfil them. This includes orders generated from subscriptions.
- Time slots are created per weekday with a start/end time. Customers pick from active slots when placing an order or subscribing to a meal plan.
- **Subscription order generation** — when a customer subscribes to a meal plan, 4 `Order` records are created immediately, one per week for 4 consecutive weeks. Each order is dated on the next occurrence of the chosen `TimeSlot.day` starting from `Subscription.startDate` (inclusive of the current day if applicable). Each order's items contain every dish in the meal plan with `quantity = 7` (7-days worth of food per dish).
- **Admin fulfils an order** — admin sets `Order.status = READY_FOR_DELIVERY`, which creates a `DeliveryTask` with `status = AVAILABLE` and no delivery partner assigned yet.
- **Delivery partner captures an order** — a delivery partner self-assigns by claiming an `AVAILABLE` task: sets `deliveryPartnerId = self`, `capturedAt = now()`, `status = ASSIGNED`. The claim is atomic (first writer wins).
- **Auto-renewal** — when `Subscription.endDate` passes and `isAutoRenew = true`, a new `Subscription` and 4 new `Order` records are generated for the next 28-day window.

---

## Prisma Schema

```prisma
// ─── Enums ───────────────────────────────────────────────────────────────────

enum Role {
  SUPER_ADMIN
  ADMIN
  CUSTOMER
  DELIVERY_PARTNER
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

enum OrderStatus {
  PENDING
  CONFIRMED
  READY_FOR_DELIVERY  // food prepared; DeliveryTask created with AVAILABLE status
  IN_DELIVERY
  DELIVERED
  CANCELLED
}

enum SettlementStatus {
  UNSETTLED
  PARTIAL
  SETTLED
}

enum PaymentMethod {
  CASH
  ONLINE
  UPI
}

enum DeliveryStatus {
  AVAILABLE   // task created by admin, not yet claimed by any partner
  ASSIGNED    // claimed by a delivery partner
  PICKED_UP
  DELIVERED
  FAILED
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
}

// ─── User ─────────────────────────────────────────────────────────────────────
// Single model for all roles. isLoyalty is only meaningful for CUSTOMER role.

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  password      String
  name          String
  role          Role           @default(CUSTOMER)
  isActive      Boolean        @default(true)
  isLoyalty     Boolean        @default(false)
  orders        Order[]
  subscriptions Subscription[]
  deliveryTasks DeliveryTask[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

// ─── Ingredient ───────────────────────────────────────────────────────────────

model Ingredient {
  id           String           @id @default(cuid())
  name         String
  unit         String           // e.g. "kg", "g", "liters", "pieces"
  availableQty Float            @default(0)
  dishes       DishIngredient[]
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}

// ─── Dish ─────────────────────────────────────────────────────────────────────
// A dish can appear as a standalone item in the store AND as part of one or more
// meal plans simultaneously — no exclusive flag needed.

model Dish {
  id            String           @id @default(cuid())
  name          String
  imageUrl      String
  description   String
  price         Int              // paise — standalone store price per unit
  isActive      Boolean          @default(true)
  ingredients   DishIngredient[]
  orderItems    OrderItem[]
  mealPlanDishes MealPlanDish[]
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
}

// Junction: how much of each ingredient is needed per 1 unit of a dish.

model DishIngredient {
  id           String     @id @default(cuid())
  dish         Dish       @relation(fields: [dishId], references: [id])
  dishId       String
  ingredient   Ingredient @relation(fields: [ingredientId], references: [id])
  ingredientId String
  quantity     Float      // amount of ingredient per 1 unit of dish

  @@unique([dishId, ingredientId])
}

// ─── MealPlan ─────────────────────────────────────────────────────────────────
// Admin-defined bundle of dishes sold as a subscription.

model MealPlan {
  id            String         @id @default(cuid())
  name          String
  description   String
  imageUrl      String
  price         Int            // paise — subscription price for the full 28-day plan, independent of dish prices
  isActive      Boolean        @default(true)
  dishes        MealPlanDish[]
  subscriptions Subscription[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

// Junction: which dishes belong to a meal plan.

model MealPlanDish {
  id         String   @id @default(cuid())
  mealPlan   MealPlan @relation(fields: [mealPlanId], references: [id])
  mealPlanId String
  dish       Dish     @relation(fields: [dishId], references: [id])
  dishId     String

  @@unique([mealPlanId, dishId])
}

// ─── Subscription ─────────────────────────────────────────────────────────────
// 28-day window; 4 weekly Order records are created on subscription.
// startDate = next occurrence of timeSlot.day from sign-up date (inclusive).
// endDate   = startDate + 27 days.

model Subscription {
  id          String             @id @default(cuid())
  customer    User               @relation(fields: [customerId], references: [id])
  customerId  String
  mealPlan    MealPlan           @relation(fields: [mealPlanId], references: [id])
  mealPlanId  String
  timeSlot    TimeSlot           @relation(fields: [timeSlotId], references: [id])
  timeSlotId  String
  startDate   DateTime
  endDate     DateTime
  isAutoRenew Boolean            @default(false)
  status      SubscriptionStatus @default(ACTIVE)
  orders      Order[]
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
}

// ─── TimeSlot ─────────────────────────────────────────────────────────────────
// Admin creates time windows per weekday. startTime/endTime stored as "HH:MM".

model TimeSlot {
  id            String         @id @default(cuid())
  day           DayOfWeek
  startTime     String         // e.g. "10:00"
  endTime       String         // e.g. "12:00"
  isActive      Boolean        @default(true)
  orders        Order[]
  subscriptions Subscription[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

// ─── Order ────────────────────────────────────────────────────────────────────
// subscriptionId is null for standalone orders; set for subscription-generated orders.
// lat/lng captured at order placement — used to assign and route delivery partners.

model Order {
  id             String        @id @default(cuid())
  customer       User          @relation(fields: [customerId], references: [id])
  customerId     String
  timeSlot       TimeSlot      @relation(fields: [timeSlotId], references: [id])
  timeSlotId     String
  subscription   Subscription? @relation(fields: [subscriptionId], references: [id])
  subscriptionId String?
  deliveryDate   DateTime
  lat            Float
  lng            Float
  status         OrderStatus   @default(PENDING)
  items          OrderItem[]
  settlement     Settlement?
  deliveryTask   DeliveryTask?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

// One row per dish in an order. quantity is how many of that dish was ordered.
// For subscription orders quantity = 7 (one week's worth per dish).

model OrderItem {
  id       String @id @default(cuid())
  order    Order  @relation(fields: [orderId], references: [id])
  orderId  String
  dish     Dish   @relation(fields: [dishId], references: [id])
  dishId   String
  quantity Int
}

// ─── Settlement ───────────────────────────────────────────────────────────────

model Settlement {
  id          String           @id @default(cuid())
  order       Order            @relation(fields: [orderId], references: [id])
  orderId     String           @unique
  totalAmount Int              // paise
  paidAmount  Int              @default(0) // paise
  status      SettlementStatus @default(UNSETTLED)
  payments    Payment[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

model Payment {
  id           String        @id @default(cuid())
  settlement   Settlement    @relation(fields: [settlementId], references: [id])
  settlementId String
  amount       Int           // paise
  method       PaymentMethod
  paidAt       DateTime      @default(now())
  note         String?
}

// ─── DeliveryTask ─────────────────────────────────────────────────────────────
// Created by admin when order is marked READY_FOR_DELIVERY.
// deliveryPartnerId is null until a partner self-assigns (captures the task).

model DeliveryTask {
  id                String          @id @default(cuid())
  order             Order           @relation(fields: [orderId], references: [id])
  orderId           String          @unique
  deliveryPartner   User?           @relation(fields: [deliveryPartnerId], references: [id])
  deliveryPartnerId String?
  status            DeliveryStatus  @default(AVAILABLE)
  capturedAt        DateTime?       // set when a delivery partner self-assigns
  photos            DeliveryPhoto[]
  failureReason     String?         // required when status = FAILED
  completedAt       DateTime?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
}

model DeliveryPhoto {
  id             String       @id @default(cuid())
  deliveryTask   DeliveryTask @relation(fields: [deliveryTaskId], references: [id])
  deliveryTaskId String
  photoUrl       String
  uploadedAt     DateTime     @default(now())
}
```

---

## Ingredient Forecast (Upcoming Orders View)

The admin panel shows: for all orders with `deliveryDate` in the next 2 days, which ingredients are needed and how much in total. Subscription-generated orders are plain `Order` rows and are included automatically.

```
required_qty per ingredient =
  SUM( orderItem.quantity × dishIngredient.quantity )
  WHERE order.deliveryDate BETWEEN today AND today+2
  GROUP BY ingredient
```

No extra table needed — derived from `Order → OrderItem → DishIngredient → Ingredient`.

---

## Tech Stack

### Backend (`backend/`)
| Concern | Choice |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| ORM / DB client | Prisma |
| Database | PostgreSQL |

### Frontends (`client-app`, `vendor-app`)
Both frontend apps share the same stack:

| Concern | Choice |
|---|---|
| Build tool | Vite |
| Framework | React |
| Styling | Tailwind CSS |
| Delivery model | PWA (Progressive Web App) |

Being PWAs means both apps are installable on mobile home screens and work offline where applicable — especially important for the vendor app used by delivery partners in the field.

---

## Project Structure

Monorepo with 3 sub-projects:

```
/
├── backend/      # Express + Prisma REST API. Shared by both frontends.
├── client-app/   # React + Vite + Tailwind PWA — customer-facing
└── vendor-app/   # React + Vite + Tailwind PWA — admin, super admin, and delivery partner
```

---

## Application Features

---

### `client-app` — Customer App

The app customers use to browse dishes, place orders, and manage meal plan subscriptions. Requires login to access anything beyond the landing page. The app has four bottom-navigation sections.

#### Auth
Sign up with name, email, password. Login. Forgot password.

#### Store
Browse all active dishes. Each dish shows name, image, description, and price. Customers add dishes to a local cart.

#### Cart
View and edit items added from the Store. Shows each item's quantity and the running total. Proceeds to checkout: select a delivery date → pick an available time slot for that day → app captures device GPS coordinates → confirm order.

#### Subscriptions
Two sub-tabs:

| Sub-tab | Purpose |
|---|---|
| **Browse Plans** | List all active meal plans. Each plan shows name, description, image, and the dishes it contains. Tapping a plan → customer selects a time slot (day + window) → confirms → subscription is created and 4 orders are auto-generated for the 28-day window. |
| **My Subscriptions** | List of all the customer's subscriptions (active and past). Each row shows meal plan name, delivery weekday, next delivery date, subscription status, and auto-renewal toggle. Customer can toggle auto-renewal on/off. |

#### Profile
View and edit own name, email, password.

**My Orders** card: list of all standalone orders (past and upcoming). Each order shows status, delivery date, time slot, items ordered, and total amount. Tapping an order opens the order detail: full item breakdown, settlement status, and payment history (amount paid, date, method).

---

### `vendor-app` — Admin, Super Admin & Delivery Partner Panel

#### Super Admin only

| Section | Purpose |
|---|---|
| **Account Management** | List all users in the system (any role). Create a new account (any role). Edit any account's details. Deactivate or delete an account. |

#### Admin

| Section | Purpose |
|---|---|
| **Dashboard** | Quick overview: number of orders for next 2 days, ingredient shortage alerts (required qty > available qty), total active customers. |
| **Upcoming Orders** | All orders with a delivery date in the next 2 days. Shows customer name, coordinates (map pin), dishes ordered, time slot, status. Ingredient forecast: each ingredient, total quantity required vs available. |
| **All Orders** | Full order list with filters by status, date, customer. Ability to confirm or cancel a pending order. Mark a confirmed order as `READY_FOR_DELIVERY` (triggers `DeliveryTask` creation with `AVAILABLE` status). |
| **Customers** | List all customer accounts. View individual customer details. Toggle a customer's loyalty status. |
| **Dishes** | List all dishes (active and inactive). Create a new dish (name, image, description, ingredients with per-unit quantities). Edit an existing dish. Toggle active/inactive. |
| **Meal Plans** | List all meal plans. Create a new plan (name, description, image, select dishes). Edit a plan. Toggle active/inactive. |
| **Subscriptions** | List all customer subscriptions. Filter by status (ACTIVE / EXPIRED / CANCELLED). See whether auto-renewal is on per subscription. Compose and send a message/notification to a specific customer (e.g. "your plan expires soon"). |
| **Ingredients** | List all ingredients with current available quantity and unit. Create a new ingredient. Edit ingredient details. Update available quantity (restock). |
| **Time Slots** | List all time slots grouped by day of week. Create a new time slot (start time, end time). Toggle active/inactive. |
| **Settlements** | List all orders with settlement status. Filter by status. Open settlement detail: total amount, amount paid, payment history. Record a new payment. |

---

#### Delivery Partner (within `vendor-app`)

Mobile-first views used by delivery partners while out on deliveries.

| Section | Purpose |
|---|---|
| **Auth** | Login with email and password. No self sign-up — account is created by Super Admin. |
| **Incoming Orders** | All `DeliveryTask` records with `status = AVAILABLE` (admin has fulfilled the order, no partner assigned yet). Each card shows delivery address (coordinates with link to open in maps), items to pick up, delivery date and time slot. Partner taps **Capture** to self-assign the task (atomic — first to tap wins). |
| **My Orders** | All `DeliveryTask` records assigned to the logged-in partner. Grouped by date. Each task shows order items to pick up, delivery location, and current status (ASSIGNED → PICKED_UP → DELIVERED / FAILED). Partner can advance status step by step. Marking as **Delivered** requires uploading 1–10 proof photos. Marking as **Failed** requires providing a reason (free text). |
| **Profile** | View own name and email. Change password. |
