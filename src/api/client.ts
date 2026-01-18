import axios, { AxiosInstance } from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch shifts for a month
   */
  async getShifts(month: number, year: number) {
    return this.client.get('/shifts', { params: { month, year } });
  }

  /**
   * Fetch volunteer's quota
   */
  async getQuota(volunteerId: string, month: number, year: number) {
    return this.client.get(`/volunteers/${volunteerId}/quota`, {
      params: { month, year },
    });
  }

  /**
   * Fetch volunteer's current signups
   */
  async getVolunteerSignups(volunteerId: string, month: number, year: number) {
    return this.client.get(`/volunteers/${volunteerId}/signups`, {
      params: { month, year },
    });
  }

  /**
   * Submit a new signup
   */
  async createSignup(
    volunteerId: string,
    shiftId: string,
    isEmergencyPickup: boolean = false
  ) {
    return this.client.post('/signups', {
      volunteerId,
      shiftId,
      isEmergencyPickup,
    });
  }
}

export const apiClient = new ApiClient();