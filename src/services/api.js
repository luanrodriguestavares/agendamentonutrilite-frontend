import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@Nutrilite:token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
};

export const createAgendamento = async (data) => {
    const response = await api.post('/agendamentos', data);
    return response;
};

export const getAgendamentos = async () => {
    const response = await api.get('/agendamentos');
    return response;
};

export const getAgendamento = async (id) => {
    const response = await api.get(`/agendamentos/${id}`);
    return response;
};

export const updateAgendamento = async (id, data) => {
    const response = await api.put(`/agendamentos/${id}`, data, {
        timeout: 30000 // 30 segundos de timeout
    });
    return response;
};

export const cancelAgendamento = async (id, data) => {
    const response = await api.put(`/agendamentos/${id}/cancel`, data, {
        timeout: 30000 // 30 segundos de timeout
    });
    return response.data;
};

export const exportAgendamentosXLSX = async () => {
    const response = await api.get("/agendamentos/export/xlsx", {
        responseType: "blob",
    })

    if (!response.data || response.data.size === 0) {
        throw new Error("Arquivo vazio recebido do servidor")
    }

    return response.data
}

export default api;
