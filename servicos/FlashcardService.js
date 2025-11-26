import api from './api'; 

const FlashcardService = {
    // GET /api/flashcards/listar/materia/{materiaId}
    listarPorMateria: async (materiaId) => {
        // CORREÇÃO: Adicionado o prefixo /api
        const response = await api.get(`/flashcards/listar/materia/${materiaId}`);
        return response.data; // Retorna List<FlashcardDTOResponse>
    },

    // POST /api/flashcards/criar
    criar: async (pergunta, resposta, materiaId) => {
        // Envia o DTO FlashcardDTORequest
        const payload = { pergunta, resposta, materiaId };
        // CORREÇÃO: Adicionado o prefixo /api
        const response = await api.post('/flashcards/criar', payload);
        return response.data; // Retorna FlashcardDTOResponse
    },

    // PUT /api/flashcards/atualizar/{id}
    atualizar: async (id, pergunta, resposta, materiaId) => {
        // Envia o DTO FlashcardDTORequest
        const payload = { pergunta, resposta, materiaId };
        // CORREÇÃO: Adicionado o prefixo /api
        const response = await api.put(`/flashcards/atualizar/${id}`, payload);
        return response.data; // Retorna FlashcardDTOResponse
    },

    // DELETE /api/flashcards/apagar/{id}
    apagar: async (id) => {
        // CORREÇÃO: Adicionado o prefixo /api
        await api.delete(`/flashcards/apagar/${id}`);
    }
};

export default FlashcardService;