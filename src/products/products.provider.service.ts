import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateProductProviderDto } from './dto/create-product.provider.dto'
import { UpdateProductProviderDto } from './dto/update-product.provider.dto'
import { PrismaService } from 'src/prisma.service'
import { ErrorDto } from 'src/utils/error.dto'
import { ErrorCodeEnum } from 'src/utils/error.code.enum'
import { AuthInfoDto } from 'src/users/dto/auth.info.dto'

@Injectable()
export class ProductsProviderService {
    constructor(private prisma: PrismaService) {}

    async create(auth: AuthInfoDto, dto: CreateProductProviderDto) {
        const profile = await this.prisma.profile.findUnique({where: { userId:  auth.id }})
        return await this.prisma.product.create({ data: {...dto,  profile: {
            connect: { id: profile.id}
        }} })
    }

    async get(auth: AuthInfoDto, id: number) {
        const product = await this.prisma.product.findUnique({ where: { id } })
        return product
    }

    async update(auth: AuthInfoDto, id: number, dto: UpdateProductProviderDto) {
        const product = await this.prisma.product.findUnique({ where: { id } })
        if (!product) {
            throw new BadRequestException(new ErrorDto(ErrorCodeEnum.ITEM_NOT_FOUND))
        }
        return await this.prisma.product.update({ where: { id }, data: dto })
    }

    async delete(auth: AuthInfoDto, id: number) {
        await this.prisma.product.delete({ where: { id } })
        return { id }
    }
}
