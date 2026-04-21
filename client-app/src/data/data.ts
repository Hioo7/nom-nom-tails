import type { Dish, MealPlan, Order, SafeUser } from '../types';

// TODO: remove when real auth is connected
export const DUMMY_USER: SafeUser = {
  id: 'dummy-user-1',
  name: 'Roan Atkinson',
  email: 'roan@example.com',
  role: 'CUSTOMER',
  isActive: true,
  isLoyalty: true,
  createdAt: '2025-12-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

export const DUMMY_DISHES: Dish[] = [
  {
    id: 'd1',
    name: 'Chicken & Rice Bowl',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80',
    description: 'Tender boiled chicken with steamed rice, perfect for sensitive tummies.',
    price: 199,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd2',
    name: 'Lamb & Veggie Stew',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80',
    description: 'Slow-cooked lamb with carrots, peas, and sweet potato.',
    price: 249,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd3',
    name: 'Salmon & Quinoa',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80',
    description: 'Omega-rich salmon fillet served over fluffy quinoa and steamed broccoli.',
    price: 299,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd4',
    name: 'Turkey Meatballs',
    imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=80',
    description: 'Juicy turkey meatballs with a light gravy and mashed pumpkin on the side.',
    price: 229,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd5',
    name: 'Beef & Barley',
    imageUrl: 'https://images.unsplash.com/photo-1608835291093-394b0c943a75?w=400&q=80',
    description: 'Hearty ground beef with pearl barley, spinach, and a drizzle of flaxseed oil.',
    price: 269,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd6',
    name: 'Egg & Oat Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80',
    description: 'Scrambled eggs mixed with rolled oats, banana, and a pinch of turmeric.',
    price: 149,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DUMMY_ORDERS: Order[] = [
  {
    id: 'ord1a2b3c4d',
    customerId: 'user1',
    deliveryDate: '2026-04-15T00:00:00.000Z',
    status: 'DELIVERED',
    items: [
      { id: 'oi1', dishId: 'd1', quantity: 2, dish: DUMMY_DISHES[0] },
      { id: 'oi2', dishId: 'd3', quantity: 1, dish: DUMMY_DISHES[2] },
    ],
    settlement: { totalAmount: 697, status: 'SETTLED' },
    createdAt: '2026-04-15T10:30:00.000Z',
  },
  {
    id: 'ord2e3f4g5h',
    customerId: 'user1',
    deliveryDate: '2026-04-17T00:00:00.000Z',
    status: 'IN_DELIVERY',
    items: [
      { id: 'oi3', dishId: 'd2', quantity: 1, dish: DUMMY_DISHES[1] },
      { id: 'oi4', dishId: 'd5', quantity: 2, dish: DUMMY_DISHES[4] },
    ],
    settlement: { totalAmount: 787, status: 'UNSETTLED' },
    createdAt: '2026-04-17T09:00:00.000Z',
  },
  {
    id: 'ord3i4j5k6l',
    customerId: 'user1',
    deliveryDate: '2026-04-18T00:00:00.000Z',
    status: 'PENDING',
    items: [
      { id: 'oi5', dishId: 'd4', quantity: 3, dish: DUMMY_DISHES[3] },
    ],
    settlement: { totalAmount: 687, status: 'UNSETTLED' },
    createdAt: '2026-04-18T14:00:00.000Z',
  },
  {
    id: 'ord4m5n6o7p',
    customerId: 'user1',
    deliveryDate: '2026-04-10T00:00:00.000Z',
    status: 'CANCELLED',
    items: [
      { id: 'oi6', dishId: 'd6', quantity: 2, dish: DUMMY_DISHES[5] },
    ],
    settlement: { totalAmount: 298, status: 'UNSETTLED' },
    createdAt: '2026-04-10T11:00:00.000Z',
  },
  {
    id: 'ord5q6r7s8t',
    customerId: 'user1',
    deliveryDate: '2026-04-19T00:00:00.000Z',
    status: 'DELIVERED',
    items: [
      { id: 'oi7', dishId: 'd3', quantity: 1, dish: DUMMY_DISHES[2] },
      { id: 'oi8', dishId: 'd1', quantity: 1, dish: DUMMY_DISHES[0] },
    ],
    settlement: { totalAmount: 498, status: 'SETTLED' },
    createdAt: '2026-04-19T08:30:00.000Z',
  },
];

export const DUMMY_MEAL_PLANS: MealPlan[] = [
  {
    id: 'mp1',
    name: 'Starter Paws',
    description: 'A balanced 7-day plan for small breeds. Fresh meals every day with portion sizes tailored for your little one.',
    imageUrl: 'https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=400&q=80',
    price: 999,
    isActive: true,
    dishes: [
      { id: 'mpd1', mealPlanId: 'mp1', dishId: 'd1', dish: DUMMY_DISHES[0] },
      { id: 'mpd2', mealPlanId: 'mp1', dishId: 'd6', dish: DUMMY_DISHES[5] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mp2',
    name: 'Active Hound',
    description: 'High-protein plan for medium to large active breeds. Keeps your dog energetic and well-nourished all month.',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
    price: 1799,
    isActive: true,
    dishes: [
      { id: 'mpd3', mealPlanId: 'mp2', dishId: 'd2', dish: DUMMY_DISHES[1] },
      { id: 'mpd4', mealPlanId: 'mp2', dishId: 'd4', dish: DUMMY_DISHES[3] },
      { id: 'mpd5', mealPlanId: 'mp2', dishId: 'd5', dish: DUMMY_DISHES[4] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mp3',
    name: 'Senior Care',
    description: 'Gentle, easily digestible meals for older dogs. Low-fat recipes with joint-supporting ingredients.',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80',
    price: 1499,
    isActive: true,
    dishes: [
      { id: 'mpd6', mealPlanId: 'mp3', dishId: 'd3', dish: DUMMY_DISHES[2] },
      { id: 'mpd7', mealPlanId: 'mp3', dishId: 'd1', dish: DUMMY_DISHES[0] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
