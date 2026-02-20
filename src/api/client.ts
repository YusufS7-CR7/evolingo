import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/me', data),
};

export const courseApi = {
  getCourses: () => api.get('/courses'),
  completeLesson: (data: { lessonId: string; score: number }) => api.post('/lesson/complete', data),
  submitPlacement: (level: string) => api.post('/placement', { level }),
};

export const userApi = {
  getLeaderboard: () => api.get('/leaderboard'),
  upgradePro: () => api.post('/user/upgrade-pro'),
  getProgress: () => api.get('/user/progress'),
  joinGroup: () => api.get('/groups/join'),
  getGroupMessages: (groupId: number) => api.get(`/groups/${groupId}/messages`),
  createGroup: (data: { name: string; level: string; maxMembers: number; isPublic: boolean }) => api.post('/groups', data),
  searchGroups: (query: string) => api.get(`/groups/search?q=${query}`),
  joinGroupById: (groupId: number) => api.post(`/groups/${groupId}/join`),
  leaveGroupById: (groupId: number) => api.post(`/groups/${groupId}/leave`),
  getAvailableGroups: () => api.get('/groups/available'),
  getMyGroups: () => api.get('/groups/my'),
  buyItem: (itemId: string) => api.post('/shop/buy', { itemId }),
  loseHeart: () => api.post('/user/lose-heart'),
  promoteUser: () => api.post('/user/promote'),
  uploadAvatar: (formData: FormData) => api.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const aiApi = {
  sendMessage: (message: string) => api.post('/ai/chat', { message }),
  getAnalysis: () => api.post('/ai/analyze')
};

export const adminApi = {
  verify: (password: string) => api.post('/admin/verify', { password }),
  getUsers: (q?: string) => api.get('/admin/users', {
    params: { q },
    headers: { 'x-admin-password': localStorage.getItem('adminPassword') }
  }),
  updateUserStats: (id: number, xp: number, coins: number) => api.post(`/admin/users/${id}/update-stats`, { xp, coins }, {
    headers: { 'x-admin-password': localStorage.getItem('adminPassword') }
  }),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`, {
    headers: { 'x-admin-password': localStorage.getItem('adminPassword') }
  }),
  getGroups: (q?: string) => api.get('/admin/groups', {
    params: { q },
    headers: { 'x-admin-password': localStorage.getItem('adminPassword') }
  }),
  deleteGroup: (id: number) => api.delete(`/admin/groups/${id}`, {
    headers: { 'x-admin-password': localStorage.getItem('adminPassword') }
  }),
  getCourses: () => api.get('/admin/courses', {
    headers: { 'x-admin-password': localStorage.getItem('adminPassword') }
  }),
  updateLesson: (id: string, data: { title: string; content: any }) => api.put(`/admin/lessons/${id}`, data, {
    headers: { 'x-admin-password': localStorage.getItem('adminPassword') }
  }),
  createLesson: (data: { moduleId: string; title: string; type: string; content: any }) => api.post('/admin/lessons', data, {
    headers: { 'x-admin-password': localStorage.getItem('adminPassword') }
  }),
};

export default api;
