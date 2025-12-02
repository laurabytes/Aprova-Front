// servicos/PlanejadorService.js
import api from './api';

const PlanejadorService = {
    // GET /api/planejador/usuario/{usuarioId}
    listarPorUsuario: async (usuarioId) => {
        const response = await api.get(`/planejador/usuario/${usuarioId}`);
        return response.data;
    },

    // POST /api/planejador
    criar: async (dados) => {
        // dados deve conter: { dia, hora, min, duracao, materia, usuarioId }
        const response = await api.post('/planejador', dados);
        return response.data;
    },

    // PUT /api/planejador/{id}
    atualizar: async (id, dados) => {
        const response = await api.put(`/planejador/${id}`, dados);
        return response.data;
    },

    // DELETE /api/planejador/{id}
    apagar: async (id) => {
        await api.delete(`/planejador/${id}`);
    }
};

export default PlanejadorService;