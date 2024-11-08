import { Type, applyDecorators } from '@nestjs/common'
import { ApiExtraModels, ApiOkResponse, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { ErrorDto } from '../../dto/error.dto'
import { PaginatedDto } from '../../dto/paginated.dto'

// This function now accepts a DTO and a record of additional DTOs without requiring a specific base
export function RequestPaginatedDecorator<DTO, SearchDto, ItemExtraDTO>(
    dto: Type<DTO>, // type of response array item
    searchDto?: Type<SearchDto>,
    argDtos?: Record<string, any>, // additional properties to response except 'data' and 'total'
    itemExtraDto?: Type<ItemExtraDTO> // additional properties to response array item
) {
    const extraModels = argDtos ? Object.values(argDtos) : []
    const requiredKeys = argDtos ? Object.keys(argDtos) : []

    const argDtosOptions = argDtos
        ? Object.entries(argDtos).reduce((acc, [name, type]) => {
              if (Array.isArray(type)) {
                  acc[name] = {
                      type: 'array',
                      items: {
                          allOf: [{ $ref: getSchemaPath(type[0]) }],
                      },
                  }
              } else {
                  acc[name] = { $ref: getSchemaPath(type) }
              }
              return acc
          }, {})
        : {}

    const decorators = [
        ApiQuery({ name: 'offset', required: false, type: () => Number }),
        ApiQuery({ name: 'limit', required: false, type: () => Number }),
        ApiQuery({
            name: 'search',
            required: false,
            type: () => String,
            ...(searchDto
                ? {
                      schema: { $ref: getSchemaPath(searchDto) },
                  }
                : {}),
        }),
        ApiQuery({ name: 'sort', required: false, type: () => String, description: 'fieldName(numeric)|ASC/DESC' }),
        ApiExtraModels(PaginatedDto, dto, ...extraModels),
        searchDto ? ApiExtraModels(searchDto) : null,
        itemExtraDto ? ApiExtraModels(itemExtraDto) : null,
        ApiOkResponse({
            schema: {
                allOf: [
                    {
                        required: ['data', 'total', ...requiredKeys],
                        properties: {
                            data: {
                                type: 'array',
                                items: itemExtraDto
                                    ? {
                                          allOf: [{ $ref: getSchemaPath(dto) }, { $ref: getSchemaPath(itemExtraDto) }],
                                      }
                                    : { $ref: getSchemaPath(dto) },
                            },
                            // Add additional DTOs to properties
                            ...argDtosOptions,
                            total: {
                                type: 'number',
                            },
                        },
                    },
                ],
            },
        }),
        ApiResponse({ status: 400, type: ErrorDto }),
    ]

    return applyDecorators(...decorators.filter(d => !!d))
}
