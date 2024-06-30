import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { ApplicationDto } from "./dto/application.dto";
import { AuthInfoDto } from 'src/users/dto/auth.info.dto';

@Injectable()
export class ApplicationsProviderService {
    constructor(private prisma: PrismaService) {}

    async create(auth: AuthInfoDto, {imageIds, proposalId, ...dto}: CreateApplicationDto) {
        const profile = await this.prisma.profile.findUnique({ where: { userId: auth.id } })

        const app = await this.prisma.application.create({
            data: {
                ...dto,
                profile: {
                    connect: {id: profile.id }
                },
                proposal: {
                    connect: { id: proposalId}
                },
                ...(imageIds
                    ? {
                          images: {
                              createMany: {
                                  data: imageIds.map(imageId => ({ imageId })),
                              },
                          },
                      }
                    : {}),
            },
        })

        return new ApplicationDto(app)
    }
}
