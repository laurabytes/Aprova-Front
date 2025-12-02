import api from './api'; 

const MetasService = {
    // Agora recebe o usuarioId
    listar: async (usuarioId) => {
        const response = await api.get(`/metas/listar?usuarioId=${usuarioId}`);
        return response.data;
    },

    criar: async (metasDTORequest) => {
        const response = await api.post('/metas/criar', metasDTORequest);
        return response.data;
    },

    atualizar: async (id, metasDTORequest) => {
        const response = await api.put(`/metas/atualizar/${id}`, metasDTORequest);
        return response.data;
    },

    apagar: async (id) => {
        await api.delete(`/metas/apagar/${id}`);
    }
};

export default MetasService;