import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateProductProviderDto } from './dto/create-product.provider.dto'
import { UpdateProductProviderDto } from './dto/update-product.provider.dto'
import { PrismaService } from 'src/prisma.service'
import { ErrorDto } from 'src/utils/error.dto'
import { ErrorCodeEnum } from 'src/utils/error.code.enum'
import { AuthInfoDto } from 'src/users/dto/auth.info.dto'
import { ProductResponse } from './dto/product.response.dto'

@Injectable()
export class ProductsProviderService {
    constructor(private prisma: PrismaService) {}

    async create(auth: AuthInfoDto, dto: CreateProductProviderDto) {
        const profile = await this.prisma.profile.findUnique({where: { userId:  auth.id }})
        const product = await this.prisma.product.create({ data: {...dto,  profile: {
            connect: { id: profile.id}
        }} })
        return new ProductResponse(product)
    }

    async findAll(auth: AuthInfoDto) {
        const profile = await this.prisma.profile.findUnique({where: { userId:  auth.id }})

        const products = await this.prisma.product.findMany({ where: {
            profileId: profile.id
        }})

        return products.map(p => new ProductResponse(p))
    }

    async get(auth: AuthInfoDto, id: number) {
        const product = await this.prisma.product.findUnique({ where: { id } })
        return new ProductResponse(product)
    }

    async update(auth: AuthInfoDto, id: number, dto: UpdateProductProviderDto) {
        const product = await this.prisma.product.findUnique({ where: { id } })
        if (!product) {
            throw new BadRequestException(new ErrorDto(ErrorCodeEnum.ITEM_NOT_FOUND))
        }
        const updated = await this.prisma.product.update({ where: { id }, data: dto })
        return new ProductResponse(updated)
    }

    async delete(auth: AuthInfoDto, id: number) {
        await this.prisma.product.delete({ where: { id } })
        return { id }
    }
}
