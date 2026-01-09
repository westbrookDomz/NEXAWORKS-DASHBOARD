import { google } from "googleapis";
import { type InsertPayment } from "@shared/schema";

export class GoogleSheetsService {
  private auth;
  private sheets;

  constructor() {
    // We'll initialize auth lazily or check env vars
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (credentials) {
      try {
        const parsedCredentials = JSON.parse(credentials);
        this.auth = new google.auth.GoogleAuth({
          credentials: parsedCredentials,
          scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });
        this.sheets = google.sheets({ version: "v4", auth: this.auth });
      } catch (error) {
        console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", error);
      }
    }
  }

  async getPaymentData(spreadsheetId: string): Promise<InsertPayment[]> {
    if (!this.sheets) {
      throw new Error("Google Sheets service not initialized. Check credentials.");
    }

    try {
      // First, get the sheet name
      const meta = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });

      const sheetName = meta.data.sheets?.[0]?.properties?.title;
      if (!sheetName) {
        throw new Error("No sheets found in spreadsheet");
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A2:N`,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      // Map rows to Payment objects
      return rows
        .filter(row => row[1] && row[1].trim() !== '') // Filter out rows without a client name
        .map((row) => ({
        date: row[0] || "",
        clientName: row[1] || "",
        projectTitle: row[2] || "",
        invoiceNo: row[3] || "",
        amountCharged: (row[4] || "0").replace(/[^0-9.-]+/g, ""),
        discount: (row[5] || "0").replace(/[^0-9.-]+/g, ""),
        agreedAmount: (row[6] || "0").replace(/[^0-9.-]+/g, ""),
        amountPaid: (row[7] || "0").replace(/[^0-9.-]+/g, ""),
        balance: (row[8] || "0").replace(/[^0-9.-]+/g, ""),
        totalAmount: (row[9] || "0").replace(/[^0-9.-]+/g, ""),
        paymentDate: row[10] || null,
        status: row[11] || "Pending",
        paymentMethod: row[12] || null,
        notes: row[13] || null,
      }));
    } catch (error) {
      console.error("Error fetching from Google Sheets:", error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
