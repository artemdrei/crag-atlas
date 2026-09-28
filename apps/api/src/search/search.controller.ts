import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import { SearchService } from './search.service';
import { CatalogSearchDto } from './search.types';

@Controller('catalog')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('search')
  @ApiOkResponse({ type: CatalogSearchDto })
  @ApiQuery({ name: 'query', required: false })
  search(@Query('query') query?: string): Promise<CatalogSearchDto> {
    return this.searchService.search(query);
  }
}
