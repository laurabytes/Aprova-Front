import api from './api'; 

const MateriaService = {
    // GET /api/materias/listar
    // CORREÇÃO: Agora recebe 'usuarioId' como parâmetro para filtrar
    listar: async (usuarioId) => {
        // Envia o ID na URL: /materias/listar?usuarioId=21
        const response = await api.get(`/materias/listar?usuarioId=${usuarioId}`);
        return response.data; // Retorna List<MateriaDTOResponse>
    },

    // POST /api/materias/criar
    criar: async (materiaDTORequest) => { 
        try {
            // Envia o objeto completo (Ex: { nome: "Matemática", cor: "#FFF", usuarioId: 21 })
            const response = await api.post('/materias/criar', materiaDTORequest);
            return response.data; // Retorna MateriaDTOResponse
        } catch(error) {
            console.error("MateriaService: erro ao criar matéria", error);
            throw error;
        }
    },

    // PUT /api/materias/atualizar/{id}
    atualizar: async (id, materiaDTORequest) => { 
        const response = await api.put(`/materias/atualizar/${id}`, materiaDTORequest);
        return response.data; // Retorna MateriaDTOResponse
    },

    // DELETE /api/materias/apagar/{id}
    apagar: async (id) => {
        await api.delete(`/materias/apagar/${id}`);
    }
};

export default MateriaService;