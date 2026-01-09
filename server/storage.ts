import { type User, type InsertUser, type Payment, type InsertPayment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayments(): Promise<Payment[]>;
  clearPayments(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private payments: Map<string, Payment>;

  constructor() {
    this.users = new Map();
    this.payments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = { 
      ...insertPayment, 
      id,
      paymentDate: insertPayment.paymentDate ?? null,
      paymentMethod: insertPayment.paymentMethod ?? null,
      notes: insertPayment.notes ?? null
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async clearPayments(): Promise<void> {
    this.payments.clear();
  }
}

export const storage = new MemStorage();
