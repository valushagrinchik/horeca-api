import { BadRequestException, Injectable } from '@nestjs/common'
import { ErrorDto } from '../system/utils/dto/error.dto'
import { ErrorCodes } from '../system/utils/enums/errorCodes.enum'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { ProductDto } from './dto/product.dto'
import { PaginateValidateType } from '../system/utils/swagger/decorators'
import { ProductSearchDto } from './dto/product.search.dto'
import { UploadsLinkType } from '@prisma/client'
import { UploadsLinkService } from '../uploads/uploads.link.service'
import { ProductUpdateDto } from './dto/product.update.dto'
import { ProductCreateDto } from './dto/product.create.dto'
import { DatabaseService } from '../system/database/database.service'

@Injectable()
export class ProductsService {
    constructor(
        private prisma: DatabaseService,
        private uploadsLinkService: UploadsLinkService
    ) {}

    async create(auth: AuthInfoDto, { imageIds, ...dto }: ProductCreateDto) {
        const product = await this.prisma.product.create({
            data: {
                ...dto,
                user: {
                    connect: { id: auth.id },
                },
            },
        })

        if (imageIds) {
            await this.uploadsLinkService.createMany(UploadsLinkType.Product, product.id, imageIds)
        }

        return this.get(auth, product.id)
    }

    async findAllAndCount(
        auth: AuthInfoDto,
        paginate: PaginateValidateType<ProductSearchDto>
    ): Promise<[ProductDto[], number]> {
        const search = paginate.search

        const products = await this.prisma.product.findMany({
            where: {
                userId: auth.id,
                ...search,
            },
            orderBy: {
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })

        const total = await this.prisma.product.count({
            where: {
                userId: auth.id,
                ...search,
            },
        })

        const images = await this.uploadsLinkService.getImages(
            UploadsLinkType.Product,
            products.map(p => p.id)
        )

        const data = products.map(
            p =>
                new ProductDto({
                    ...p,
                    images: (images[p.id] || []).map(image => image.image),
                })
        )
        return [data, total]
    }

    async get(auth: AuthInfoDto, id: number) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        })

        const images = await this.uploadsLinkService.getImages(UploadsLinkType.Product, [product.id])

        return new ProductDto({
            ...product,
            images: (images[product.id] || []).map(image => image.image),
        })
    }

    async update(auth: AuthInfoDto, id: number, { imageIds, ...dto }: ProductUpdateDto) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        })

        if (!product) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.ITEM_NOT_FOUND))
        }
        await this.prisma.product.update({
            where: { id },
            data: dto,
        })

        // TODO: needs optimisation and avoidance of recreation
        await this.prisma.uploadsLink.deleteMany({
            where: {
                sourceType: UploadsLinkType.Product,
                sourceId: id,
            },
        })
        await this.uploadsLinkService.createMany(UploadsLinkType.Product, product.id, imageIds)
        return this.get(auth, id)
    }

    async delete(auth: AuthInfoDto, id: number) {
        await this.prisma.product.delete({ where: { id } })
        return { id }
    }
}
