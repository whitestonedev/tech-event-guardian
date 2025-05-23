
import { Event } from '../types';

const API_BASE_URL = 'https://api.calendario.tech';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async getPendingEvents(): Promise<Event[]> {
    return this.request('/events/submit/review/');
  }

  async getApprovedEvents(): Promise<Event[]> {
    return this.request('/events/');
  }

  async approveEvent(eventId: number, action: 'approved' | 'declined'): Promise<void> {
    return this.request(`/events/submit/${eventId}`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async updateEvent(eventId: number, eventData: Partial<Event>): Promise<void> {
    return this.request(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(eventId: number): Promise<void> {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
