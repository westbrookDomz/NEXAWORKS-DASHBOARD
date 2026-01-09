import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  clientName: text("client_name").notNull(),
  projectTitle: text("project_title").notNull(),
  invoiceNo: text("invoice_no").notNull(),
  amountCharged: text("amount_charged").notNull(),
  discount: text("discount").notNull(),
  agreedAmount: text("agreed_amount").notNull(),
  amountPaid: text("amount_paid").notNull(),
  balance: text("balance").notNull(),
  totalAmount: text("total_amount").notNull(),
  paymentDate: text("payment_date"),
  status: text("status").notNull(),
  paymentMethod: text("payment_method"),
  notes: text("notes"),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
