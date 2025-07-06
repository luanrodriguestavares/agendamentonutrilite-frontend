import { createContext, useContext, useState, useEffect } from 'react';
import { login, getAgendamentos } from '@/services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('@Nutrilite:user');
        const storedToken = localStorage.getItem('@Nutrilite:token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);

    const signIn = async (email, password) => {
        try {
            const response = await login(email, password);
            const { user, token } = response.data;

            localStorage.setItem('@Nutrilite:user', JSON.stringify(user));
            localStorage.setItem('@Nutrilite:token', token);

            setUser(user);
            return true;
        } catch (error) {
            throw new Error('Credenciais inválidas');
        }
    };

    const signOut = () => {
        localStorage.removeItem('@Nutrilite:user');
        localStorage.removeItem('@Nutrilite:token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    return context;
}
