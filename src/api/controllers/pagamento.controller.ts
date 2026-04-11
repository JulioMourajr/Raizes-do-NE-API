import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles }        from '../decorators/roles.decorator';
import { UsuarioAtual } from '../decorators/usuarioAtual.decorator';
import { Perfil }       from '../../domain/enums/perfil.enum';
import { ProcessarPagamentoDto }    from '../../application/dtos/processarPagamento.dto';
import { ProcessarPagamentoUseCase } from '../../application/use-cases/pedidos/processarPagamento.use-case';

@ApiTags('pagamentos')
@ApiBearerAuth()
@Controller('pagamentos')
export class PagamentoController {
  constructor(
    private readonly processarPagamento: ProcessarPagamentoUseCase,
  ) {}

  @Post('mock')
  @Roles(Perfil.CLIENTE, Perfil.ATENDENTE)
  @ApiOperation({ summary: 'Processar pagamento via mock' })
  @ApiResponse({ status: 200, description: 'Pagamento processado (aprovado ou recusado).' })
  @ApiResponse({ status: 400, description: 'Pedido não está aguardando pagamento.' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado.' })
  async processarMock(
    @Body() dto: ProcessarPagamentoDto,
    @UsuarioAtual() usuario: { id: string },
  ) {
    return this.processarPagamento.executar(dto, usuario.id);
  }
}