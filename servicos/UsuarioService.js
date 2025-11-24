import api from './api';

const UsuarioService = {
    // POST /api/usuarios/login
    // login: async (email, password) => {
    //     // Envia o DTO LoginUserDto
    //     const response = await api.post('/usuarios/login', { email, password });
    //     return response.data; // Retorna RecoveryJwtTokenDto (que tem o token)
    // },
    async login(email, password) {
        try{
            const request = { email, password };
            const response =  await api.post('/usuarios/login', request);
            return response.data; // Retorna RecoveryJwtTokenDto (que tem o token)
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
            role: 'ROLE_USUARIO' // Conforme definido na integração anterior
        };
        const response = await api.post('/usuarios/criar', payload);
        return response.data; // Retorna status 201 CREATED (corpo vazio ou dados do novo usuário se o backend retornar)
    },

    // DELETE /api/usuarios/apagar/{id} (Geralmente não usado no AuthContext, mas útil no Service)
    apagar: async (id) => {
        await api.delete(`/usuarios/apagar/${id}`);
    }
    
    // Outras funções de CRUD (listar, atualizar) podem ser adicionadas aqui se necessário.
};

export default UsuarioService;