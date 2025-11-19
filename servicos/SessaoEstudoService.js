import api from './api'; 

const SessaoEstudoService = {
    // GET /api/sessoes-estudo/listar
    listar: async () => {
        const response = await api.get('/sessoes-estudo/listar');
        return response.data; // Retorna List<SessaoEstudoDTOResponse>
    },

    // POST /api/sessoes-estudo/criar
    criar: async (sessaoEstudoDTORequest) => {
        // Envia o DTO SessaoEstudoDTORequest (Ex: {dataInicio, duracao, tipo})
        const response = await api.post('/sessoes-estudo/criar', sessaoEstudoDTORequest);
        return response.data; // Retorna SessaoEstudoDTOResponse
    },

    // PUT /api/sessoes-estudo/atualizar/{id}
    atualizar: async (id, sessaoEstudoDTORequest) => {
        // Envia o DTO SessaoEstudoDTORequest
        const response = await api.put(`/sessoes-estudo/atualizar/${id}`, sessaoEstudoDTORequest);
        return response.data; // Retorna SessaoEstudoDTOResponse
    },

    // DELETE /api/sessoes-estudo/apagar/{id}
    apagar: async (id) => {
        await api.delete(`/sessoes-estudo/apagar/${id}`);
    }
};

export default SessaoEstudoService;