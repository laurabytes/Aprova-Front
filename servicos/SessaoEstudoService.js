// servicos/SessaoEstudoService.js
import api from './api';

class SessaoEstudoService {

  // CORREÇÃO: Aceita usuarioId
  async listar(usuarioId) {
    const response = await api.get(`/sessoes-estudo/listar?usuarioId=${usuarioId}`);
    return response.data;
  }

  async buscarPorId(id) {
    return (await api.get(`/sessoes-estudo/${id}`)).data;
  }

  async criar(dados) {
    return (await api.post('/sessoes-estudo/criar', dados)).data;
  }

  async atualizar(id, dados) {
    return (await api.put(`/sessoes-estudo/atualizar/${id}`, dados)).data;
  }

  async apagar(id) {
    return (await api.delete(`/sessoes-estudo/apagar/${id}`)).data;
  }

}

export default new SessaoEstudoService();