import api from './api';

const UsuarioService = {
    
    async login(email, password) {
        try{
            const request = { email, password };
            const response =  await api.post('usuarios/login', request);
            return response.data; 
        }catch(error){
            console.error("Erro no login do usuário:", error);
            throw error;
        }
    },

    // POST /api/usuarios/criar
    register: async (nome, email, password) => {
        // Envia o DTO CreateUserDto
        const payload = { 
            nome, 
            email, 
            password,
            role: 'ROLE_USUARIO' 
        };
        const response = await api.post('usuarios/criar', payload);
        return response.data; 
    },

    apagar: async (id) => {
        await api.delete(`usuarios/apagar/${id}`);
    }
    
    // Outras funções de CRUD (listar, atualizar) podem ser adicionadas aqui se necessário.
};

export default UsuarioService;