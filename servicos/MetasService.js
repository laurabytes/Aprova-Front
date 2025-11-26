import api from './api'; 

const MetasService = {
    // GET /metas/listar
    listar: async () => {
        const response = await api.get('/metas/listar');
        return response.data; // Retorna List<MetasDTOResponse>
    },

    // POST /api/metas/criar
    criar: async (metasDTORequest) => {
        // Envia o DTO MetasDTORequest (Ex: {descricao, status, progresso})
        const response = await api.post('/metas/criar', metasDTORequest);
        return response.data; // Retorna MetasDTOResponse
    },

    // PUT /api/metas/atualizar/{id}
    atualizar: async (id, metasDTORequest) => {
        // Envia o DTO MetasDTORequest (Ex: objeto completo da meta atualizada)
        const response = await api.put(`/metas/atualizar/${id}`, metasDTORequest);
        return response.data; // Retorna MetasDTOResponse
    },

    // DELETE /api/metas/apagar/{id}
    apagar: async (id) => {
        await api.delete(`/metas/apagar/${id}`);
    }
};

export default MetasService;