import { Usuario } from "../entities/usuario.entity";

export interface IUsuarioRepository {
  salvar(usuario: Usuario): Promise<Usuario>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
}