import { Controller, Get, Param, Query,
         NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse,
         ApiQuery, ApiParam } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { UnidadeRepository } from '../../infrastructure/repositories/unidade.repository';

@ApiTags('unidades')
@Controller('unidades')
export class UnidadeController {
  constructor(private readonly unidadeRepo: UnidadeRepository) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar unidades ativas da rede' })
  @ApiResponse({ status: 200, description: 'Lista de unidades.' })
  async listar() {
    const unidades = await this.unidadeRepo.listar();
    return {
      data:  unidades,
      total: unidades.length,
    };
  }

  @Public()
  @Get(':id/cardapio')
  @ApiOperation({ summary: 'Consultar cardápio de uma unidade' })
  @ApiParam({ name: 'id', description: 'UUID da unidade' })
  @ApiQuery({
    name: 'categoria', required: false,
    description: 'Filtrar por categoria',
    enum: ['LANCHES', 'PRATOS', 'BEBIDAS', 'SOBREMESAS'],
  })
  @ApiQuery({
    name: 'disponivel', required: false,
    description: 'Filtrar apenas disponíveis',
    type: Boolean,
  })
  @ApiResponse({ status: 200, description: 'Cardápio da unidade.' })
  @ApiResponse({ status: 404, description: 'Unidade não encontrada.' })
  async cardapio(
    @Param('id') id: string,
    @Query('categoria')  categoria?: string,
    @Query('disponivel') disponivel?: string,
  ) {

    const unidade = await this.unidadeRepo.buscarPorId(id);
    if (!unidade) {
      throw new NotFoundException({
        error:   'UNIDADE_NAO_ENCONTRADA',
        message: `Unidade ${id} não encontrada ou inativa.`,
        details: [],
      });
    }

    let produtos = await this.unidadeRepo.buscarCardapio(id, categoria);

    if (disponivel === 'true') {
      produtos = produtos.filter((p) => p.disponivel);
    }

    return {
      unidade: {
        id:       unidade.id,
        nome:     unidade.nome,
        endereco: unidade.endereco,
      },
      totalProdutos: produtos.length,
      produtos,
    };
  }
}