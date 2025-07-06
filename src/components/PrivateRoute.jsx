import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function PrivateRoute({ children }) {
	const { signed, loading } = useAuth();

	if (loading) {
		return <div>Carregando...</div>;
	}

	if (!signed) {
		return <Navigate to="/login" />;
	}

	return children;
}
