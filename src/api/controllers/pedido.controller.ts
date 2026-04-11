import {
  Controller, Post, Get, Patch, Body, Param,
  Query, Headers, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiQuery, ApiHeader,
} from '@nestjs/swagger';
import { Roles }         from '../decorators/roles.decorator';
import { UsuarioAtual }  from '../decorators/usuarioAtual.decorator';
import { Perfil }        from '../../domain/enums/perfil.enum';
import { CanalPedido }   from '../../domain/enums/canalPedido.enum';
import { StatusPedido }  from '../../domain/enums/statusPedido.enum';
import { CriarPedidoDto }           from '../../application/dtos/criarPedido.dto';
import { AtualizarStatusDto }       from '../../application/dtos/atualizarStatus.dto';
import { CriarPedidoUseCase }           from '../../application/use-cases/pedidos/criarPedido.use-case';
import { AtualizarStatusPedidoUseCase } from '../../application/use-cases/pedidos/atualizarStatus.use-case';
import { PedidoRepository }             from '../../infrastructure/repositories/pedido.repository';

@ApiTags('pedidos')
@ApiBearerAuth()
@Controller('pedidos')
export class PedidoController {
  constructor(
    private readonly criarPedido:       CriarPedidoUseCase,
    private readonly atualizarStatus:   AtualizarStatusPedidoUseCase,
    private readonly pedidoRepo:        PedidoRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Perfil.CLIENTE, Perfil.ATENDENTE)
  @ApiOperation({ summary: 'Criar pedido — fluxo crítico' })
  @ApiHeader({ name: 'Idempotency-Key', required: false,
               description: 'UUID para evitar pedidos duplicados' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Produto ou unidade não encontrado.' })
  @ApiResponse({ status: 409, description: 'Estoque insuficiente.' })
  @ApiResponse({ status: 422, description: 'Dados inválidos (ex.: canalPedido ausente).' })
  async criar(
    @Body() dto: CriarPedidoDto,
    @UsuarioAtual() usuario: { id: string; perfil: string },
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    dto.idempotencyKey = idempotencyKey;
    return this.criarPedido.executar(dto, usuario.id);
  }

  @Get()
  @Roles(Perfil.ATENDENTE, Perfil.COZINHA, Perfil.GERENTE, Perfil.ADMIN)
  @ApiOperation({ summary: 'Listar pedidos com filtros' })
  @ApiQuery({ name: 'canalPedido', enum: CanalPedido, required: false })
  @ApiQuery({ name: 'status',      enum: StatusPedido, required: false })
  @ApiQuery({ name: 'unidadeId',   required: false })
  @ApiQuery({ name: 'page',        required: false, example: 1 })
  @ApiQuery({ name: 'limit',       required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Lista de pedidos.' })
  async listar(
    @Query('canalPedido') canalPedido?: CanalPedido,
    @Query('status')      status?: StatusPedido,
    @Query('unidadeId')   unidadeId?: string,
    @Query('page')        page = 1,
    @Query('limit')       limit = 20,
  ) {
    return this.pedidoRepo.listar({
      canalPedido,
      status,
      unidadeId,
      page:  Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  @Roles(Perfil.CLIENTE, Perfil.ATENDENTE, Perfil.COZINHA, Perfil.GERENTE, Perfil.ADMIN)
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado.' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado.' })
  async buscarPorId(@Param('id') id: string) {
    return this.pedidoRepo.buscarPorId(id);
  }

  @Patch(':id/status')
  @Roles(Perfil.COZINHA, Perfil.ATENDENTE, Perfil.GERENTE, Perfil.ADMIN)
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  @ApiResponse({ status: 200, description: 'Status atualizado.' })
  @ApiResponse({ status: 409, description: 'Transição de status inválida.' })
  async atualizarStatusPedido(
    @Param('id') id: string,
    @Body() dto: AtualizarStatusDto,
    @UsuarioAtual() usuario: { id: string; perfil: Perfil },
  ) {
    return this.atualizarStatus.executar(id, dto, usuario.id, usuario.perfil);
  }
}