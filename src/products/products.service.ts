import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ErrorDto } from '../system/dto/error.dto'
import { ErrorCodeEnum } from '../system/error.code.enum'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { ProductDto } from './dto/product.dto'
import { PaginateValidateType } from '../system/swagger/decorators'
import { ProductSearchDto } from './dto/product.search.dto'
import { UploadsLinkType } from '@prisma/client'
import { UploadsLinkService } from '../uploads/uploads.link.service'
import { ProductUpdateDto } from './dto/product.update.dto'
import { ProductCreateDto } from './dto/product.create.dto'

@Injectable()
export class ProductsService {
    constructor(
        private prisma: PrismaService,
        private uploadsLinkService: UploadsLinkService
    ) {}

    async create(auth: AuthInfoDto, { imageIds, ...dto }: ProductCreateDto) {
        const profile = await this.prisma.profile.findUnique({ where: { userId: auth.id } })
        const product = await this.prisma.product.create({
            data: {
                ...dto,
                profile: {
                    connect: { id: profile.id },
                },
                ...(imageIds
                    ? {
                          productImage: {
                              createMany: {
                                  data: imageIds.map(imageId => ({ imageId })),
                              },
                          },
                      }
                    : {}),
            },
        })

        if (imageIds) {
            await this.uploadsLinkService.createMany(UploadsLinkType.Product, product.id, imageIds)
        }

        return this.get(auth, product.id)
    }

    async findAll(auth: AuthInfoDto, paginate: PaginateValidateType<ProductSearchDto>) {
        const search = paginate.search
        const profile = await this.prisma.profile.findUnique({ where: { userId: auth.id } })

        const products = await this.prisma.product.findMany({
            where: {
                profileId: profile.id,
                ...search,
            },
            orderBy: {
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })

        const images = await this.uploadsLinkService.getImages(
            UploadsLinkType.Product,
            products.map(p => p.id)
        )

        return products.map(
            p =>
                new ProductDto({
                    ...p,
                    images: images[p.id].map(image => image.image),
                })
        )
    }

    async get(auth: AuthInfoDto, id: number) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        })

        const images = await this.uploadsLinkService.getImages(UploadsLinkType.Product, [product.id])

        return new ProductDto({
            ...product,
            images: images[product.id].map(image => image.image),
        })
    }

    async update(auth: AuthInfoDto, id: number, { imageIds, ...dto }: ProductUpdateDto) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        })

        if (!product) {
            throw new BadRequestException(new ErrorDto(ErrorCodeEnum.ITEM_NOT_FOUND))
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
        await this.uploadsLinkService.createMany(UploadsLinkType.Product, product.id, imageIds )
        return this.get(auth, id)
    }

    async delete(auth: AuthInfoDto, id: number) {
        await this.prisma.product.delete({ where: { id } })
        return { id }
    }
}
