import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateProductProviderDto } from './dto/create-product.provider.dto'
import { UpdateProductProviderDto } from './dto/update-product.provider.dto'
import { PrismaService } from '../prisma.service'
import { ErrorDto } from '../utils/error.dto'
import { ErrorCodeEnum } from '../utils/error.code.enum'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { ProductResponse } from './dto/product.response.dto'

@Injectable()
export class ProductsProviderService {
    constructor(private prisma: PrismaService) {}

    async create(auth: AuthInfoDto, { imageIds, ...dto }: CreateProductProviderDto) {
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
            include: {
                productImage: {
                    include: {
                        image: true,
                    },
                },
            },
        })
        return new ProductResponse(product)
    }

    async findAll(auth: AuthInfoDto) {
        const profile = await this.prisma.profile.findUnique({ where: { userId: auth.id } })

        const products = await this.prisma.product.findMany({
            where: {
                profileId: profile.id,
            },
            include: {
                productImage: {
                    include: {
                        image: true,
                    },
                },
            },
        })

        return products.map(p => new ProductResponse(p))
    }

    async get(auth: AuthInfoDto, id: number) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                productImage: {
                    include: {
                        image: true,
                    },
                },
            },
        })
        return new ProductResponse(product)
    }

    async update(auth: AuthInfoDto, id: number, { imageIds, ...dto }: UpdateProductProviderDto) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                productImage: true,
            },
        })
        if (!product) {
            throw new BadRequestException(new ErrorDto(ErrorCodeEnum.ITEM_NOT_FOUND))
        }
        const updated = await this.prisma.product.update({
            where: { id },
            data: {
                ...dto,
                productImage: {
                    deleteMany: product.productImage.map(pi => ({ imageId: pi.imageId })),
                    ...(imageIds
                        ? {
                              createMany: {
                                  data: imageIds.map(imageId => ({ imageId })),
                              },
                          }
                        : {}),
                },
            },
            include: {
                productImage: {
                    include: {
                        image: true,
                    },
                },
            },
        })
        return new ProductResponse(updated)
    }

    async delete(auth: AuthInfoDto, id: number) {
        await this.prisma.product.delete({ where: { id } })
        return { id }
    }
}
