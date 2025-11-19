import api from './api'; 

const MateriaService = {
    // GET /api/materias/listar
    listar: async () => {
        const response = await api.get('/materias/listar');
        return response.data; // Retorna List<MateriaDTOResponse>
    },

    // POST /api/materias/criar
    criar: async (nome) => {
        // Envia o DTO MateriaDTORequest
        const response = await api.post('/materias/criar', { nome });
        return response.data; // Retorna MateriaDTOResponse
    },

    // PUT /api/materias/atualizar/{id}
    atualizar: async (id, nome) => {
        // Envia o DTO MateriaDTORequest
        const response = await api.put(`/materias/atualizar/${id}`, { nome });
        return response.data; // Retorna MateriaDTOResponse
    },

    // DELETE /api/materias/apagar/{id}
    apagar: async (id) => {
        await api.delete(`/materias/apagar/${id}`);
    }
};

export default MateriaService;