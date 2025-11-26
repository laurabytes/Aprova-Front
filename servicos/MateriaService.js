import api from './api'; 

const MateriaService = {
    // GET /api/materias/listar
    listar: async () => {
        const response = await api.get('/materias/listar');
        return response.data; // Retorna List<MateriaDTOResponse>
    },

    // POST /api/materias/criar
    // 💡 CORREÇÃO: Recebe o objeto completo (ex: { nome: "Math", usuarioId: 1 })
    criar: async (dadosMateria) => { 
        try {
            // Envia o objeto completo para que o backend receba 'nome' e 'usuarioId'
            const response = await api.post('/materias/criar', dadosMateria);
            return response.data; // Retorna MateriaDTOResponse
        } catch(error) {
            console.error("MateriaService: erro ao criar matéria", error);
            throw error;
        }
    },

    // PUT /api/materias/atualizar/{id}
    // 💡 CORREÇÃO: Também ajustado para enviar os dados completos se necessário
    atualizar: async (id, dadosMateria) => { 
        const response = await api.put(`/materias/atualizar/${id}`, dadosMateria);
        return response.data; // Retorna MateriaDTOResponse
    },

    // DELETE /api/materias/apagar/{id}
    apagar: async (id) => {
        await api.delete(`/materias/apagar/${id}`);
    }
};

export default MateriaService;