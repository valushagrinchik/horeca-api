import { BadRequestException, Injectable } from '@nestjs/common'
import { RegistrateUserDto } from '../dto/registrate-user.dto'
import { ErrorDto } from '../../system/utils/dto/error.dto'
import { ErrorCodes } from '../../system/utils/enums/errorCodes.enum'
import { UpdateUserDto } from '../dto/update-user.dto'
import { Address, Prisma, Profile, ProfileType, User, UserRole } from '@prisma/client'
import { generatePassword } from '../../system/crypto'
import { DatabaseService } from '../../system/database/database.service'
import { CreateHorecaProfileDto } from '../dto/horeca/create-horeca-profile.dto'
import { CreateProviderProfileDto } from '../dto/provider/create-provider-profile.dto'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class UsersDbService {
    constructor(private db: DatabaseService) {}

    createUser = async (dto: Omit<RegistrateUserDto, 'repeatPassword' | 'GDPRApproved'>) => {
        return this.db.user.create({
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
            include: {
                profile: true,
            },
        })
    }

    updateUser = async (id: number, data: Prisma.UserUpdateInput) => {
        return this.db.user.update({
            where: { id },
            data,
        })
    }

    getUserWithProfile = async (id: number) => {
        return this.db.user.findUnique({
            where: { id },
            include: { profile: { include: { addresses: true } } },
        })
    }

    getUser = async (id: number) => {
        return this.db.user.findUnique({ where: { id } })
    }

    getUserByEmail = async (email: string) => {
        return this.db.user.findFirst({ where: { email } })
    }

    getUserByActivationLink = async (activationLink: string) => {
        return this.db.user.findFirst({ where: { activationLink } })
    }

    updateProfile = async (id: number, dto: UpdateUserDto) => {
        const user = await this.db.user.findUnique({
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

        return this.db.user.update({
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
        return this.db.user.update({
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
