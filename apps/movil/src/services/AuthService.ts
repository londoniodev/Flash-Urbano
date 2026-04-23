import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

export class AuthService {
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }

    // Guardar token y datos del usuario localmente
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));

    return data;
  }

  static async logout() {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
  }

  static async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  }

  static async getUserData(): Promise<any | null> {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }
}
