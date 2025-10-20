import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export class MpcClient {
  private baseUrl: string;
  private jwtSecret: string;

  constructor() {
    this.baseUrl = process.env.MPC_SERVER_URL || "http://localhost:8080";
    this.jwtSecret = process.env.MPC_JWT_SECRET || "secret";
  }

  async generateWallet(threshold: number, totalShares: number): Promise<any> {
    const token = this.generateToken();
    const response = await axios.post(
      `${this.baseUrl}/api/mpc/keygen`,
      {
        threshold,
        total_shares: totalShares,
        request_id: uuidv4(),
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }

  async signTransaction(
    walletId: string,
    message: Buffer,
    shareIds: string[]
  ): Promise<string> {
    const token = this.generateToken();
    const response = await axios.post(
      `${this.baseUrl}/api/mpc/sign`,
      {
        wallet_id: walletId,
        message: message.toString("base64"),
        share_ids: shareIds,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.signature;
  }

  private generateToken(): string {
    // Generate JWT token for service-to-service auth
    const jwt = require("jsonwebtoken");
    return jwt.sign({ sub: "wallet-service" }, this.jwtSecret, {
      expiresIn: "1h",
    });
  }
}
