import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common'
import { Address, Prisma, PrismaClient, Profile, ProfileType, User, UserRole } from '@prisma/client'
import { ErrorCodes } from './system/utils/enums/errorCodes.enum'
import { ErrorDto } from './system/utils/dto/error.dto'
import { UpdateUserDto } from './users/dto/update-user.dto'
import { CreateProviderProfileDto } from './users/dto/provider/create-provider-profile.dto'
import { CreateHorecaProfileDto } from './users/dto/horeca/create-horeca-profile.dto'
import { RegistrateUserDto } from './users/dto/registrate-user.dto'
import { v4 as uuidv4 } from 'uuid'
import { generatePassword } from './system/crypto'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        console.log('PrismaService initialization...')
        await this.$connect()
    }

    createUser = async (dto: RegistrateUserDto) => {
        return this.user.create({
            data: {
                email: dto.email,
                password: generatePassword(dto.password),
                name: dto.name,
                tin: dto.tin,
                phone: dto.phone,
                activationLink: uuidv4(),
                role: dto.profile.profileType == ProfileType.Horeca ? UserRole.Horeca : UserRole.Provider,
                profile: {
                    create: {
                        profileType: dto.profile.profileType as ProfileType,
                        ...(dto.profile as Omit<RegistrateUserDto['profile'], 'addresses'>),
                        ...('addresses' in dto.profile
                            ? {
                                  addresses: {
                                      createMany: {
                                          data: dto.profile.addresses.map(address => {
                                              return {
                                                  address: address.address,
                                                  ...address.weekdays.reduce((prev, weekday) => {
                                                      prev[weekday + 'From'] = address[weekday + 'From']
                                                      prev[weekday + 'To'] = address[weekday + 'To']
                                                      return prev
                                                  }, {}),
                                              }
                                          }) as Prisma.AddressCreateManyProfileInput[],
                                      },
                                  },
                              }
                            : {}),
                    },
                },
            },
        })
    }

    updateProfile = async (id: number, dto: UpdateUserDto) => {
        const user = await this.user.findUnique({
            where: { id },
            include: { profile: { include: { addresses: true } } },
        })
        if (!user) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.USER_DOES_NOT_EXISTS))
        }

        if (user.profile.profileType == ProfileType.Horeca) {
            return this.updateHorecaProfile(user, dto)
        } else {
            return this.updateProviderProfile(user, dto)
        }
    }

    updateHorecaProfile = async (
        user: User & { profile: Profile & { addresses: Address[] } },
        { profile: profileInput, password, repeatPassword, ...mainInfo }: UpdateUserDto
    ) => {
        const profile = profileInput as CreateHorecaProfileDto
        const { addresses = [], ...profileInfo } = profile || {}
        const existingAddresses = user.profile.addresses.map(a => a.id)

        return this.user.update({
            where: { id: user.id },
            include: { profile: { include: { addresses: true } } },
            data: {
                ...mainInfo,
                ...(password ? { password: generatePassword(password) } : {}),
                profile: {
                    update: {
                        data: {
                            ...profileInfo,
                            addresses: {
                                update: addresses
                                    .filter(a => a.id && existingAddresses.includes(a.id))
                                    .map(address => {
                                        return {
                                            address: address.address,
                                            ...address.weekdays.reduce((prev, weekday) => {
                                                prev[weekday + 'From'] = address[weekday + 'From']
                                                prev[weekday + 'To'] = address[weekday + 'To']
                                                return prev
                                            }, {}),
                                        }
                                    }) as unknown as Prisma.AddressUpdateWithWhereUniqueWithoutProfileInput[],
                                create: addresses
                                    .filter(a => !a.id)
                                    .map(address => {
                                        return {
                                            address: address.address,
                                            ...address.weekdays.reduce((prev, weekday) => {
                                                prev[weekday + 'From'] = address[weekday + 'From']
                                                prev[weekday + 'To'] = address[weekday + 'To']
                                                return prev
                                            }, {}),
                                        }
                                    }) as Prisma.AddressCreateManyProfileInput[],
                                deleteMany: {
                                    id: { in: existingAddresses.filter(id => !addresses.map(a => a.id).includes(id)) },
                                },
                            },
                        },
                    },
                },
            },
        })
    }

    updateProviderProfile = async (
        user: User & { profile: Profile },
        { profile: profileInput, password, repeatPassword, ...mainInfo }: UpdateUserDto
    ) => {
        const profile = profileInput as CreateProviderProfileDto
        return this.user.update({
            where: { id: user.id },
            include: { profile: { include: { addresses: true } } },
            data: {
                ...mainInfo,
                ...(password ? { password: generatePassword(password) } : {}),
                profile: {
                    update: {
                        data: profile,
                    },
                },
            },
        })
    }
}
