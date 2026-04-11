import { Injectable, Logger } from '@nestjs/common';

export interface AuditLog {
  usuarioId: string;
  acao: string;
  entidade: string;
  entidadeId: string;
  payload?: Record<string, unknown>;
}

@Injectable()
export class AuditLogger {
  private readonly logger = new Logger('AUDITORIA');

  registrar(log: AuditLog): void {
    this.logger.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        ...log,
      }),
    );
  }
}