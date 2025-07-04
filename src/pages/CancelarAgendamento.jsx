import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cancelAgendamento, getAgendamento } from '../services/api';

export default function CancelarAgendamento() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const cancelarAgendamento = async () => {
            try {
                const response = await getAgendamento(id);
                const agendamento = response.data;

                const data = await cancelAgendamento(id, {
                    tipo: agendamento.tipoAgendamento,
                    origem: "email"
                });

                setStatus('success');
                setMessage(data.message || 'Agendamento cancelado com sucesso!');
            } catch (error) {
                setStatus('error');
                if (error.response?.status === 404) {
                    setMessage('Agendamento não encontrado');
                } else if (error.response?.data?.error && error.response?.data?.details) {
                    setMessage(`${error.response.data.error}\n${error.response.data.details}`);
                } else if (error.response?.data?.error) {
                    setMessage(error.response.data.error);
                } else if (error.response?.data?.details) {
                    setMessage(error.response.data.details);
                } else {
                    setMessage('Erro ao cancelar agendamento');
                }
                console.error('Erro ao cancelar:', error);
            }
        };

        if (id) {
            cancelarAgendamento();
        } else {
            setStatus('error');
            setMessage('ID do agendamento não encontrado');
        }
    }, [id]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-700 to-emerald-900">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                {status === 'loading' && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Processando cancelamento...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <div className="text-emerald-500 text-5xl mb-4">✓</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sucesso!</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-emerald-500 text-white px-6 py-2 rounded hover:bg-emerald-600"
                        >
                            Voltar para o Início
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <div className="text-red-500 text-5xl mb-4">✕</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Não foi possível cancelar</h2>
                        <div className="text-gray-600 mb-6">
                            {message && message.includes('\n') ? (
                                <div className="space-y-2 text-left">
                                    {message.split('\n').filter(line => line.trim()).map((erro, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <span className="text-red-500 mt-1">•</span>
                                            <span>{erro.trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>{message}</p>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-emerald-500 text-white px-6 py-2 rounded hover:bg-emerald-600"
                        >
                            Voltar para o Início
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
