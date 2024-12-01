import { INestApplication } from '@nestjs/common'
import { ENDPOINTS } from './constants'
import * as request from 'supertest'
import { LoginUserDto } from '../src/users/dto/login-user.dto'
import { RegistrateUserDto } from '../src/users/dto/registrate-user.dto'
import { UpdateUserDto } from '../src/users/dto/update-user.dto'
import { HorecaRequestCreateDto } from '../src/horecaRequests/dto/horecaRequest.create.dto'
import { PaginateValidateType } from '../src/system/utils/swagger/decorators'
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { AuthResultDto } from '../src/users/dto/auth.result.dto'
import { ProviderRequestCreateDto } from '../src/providerRequests/dto/providerRequest.create.dto'
import { HorecaRequestProviderStatusDto } from '../src/providerRequests/dto/horecaRequest.providerStatus.dto'
import { HorecaRequestTemplateCreateDto } from '../src/horecaRequests/dto/horecaRequest.template.create.dto'
import { HorecaRequestSetStatusDto } from '../src/horecaRequests/dto/horecaRequest.approveProviderRequest.dto'
import { FavouritesCreateDto } from '../src/favourites/dto/favourites.create.dto'
import { ChatCreateDto } from '../src/chat/dto/chat.create.dto'
import { ChatDto } from '../src/chat/dto/chat.dto'
import { HorecaRequestTemplateUpdateDto } from '../src/horecaRequests/dto/horecaRequest.template.update.dto'
import { io, Socket } from 'socket.io-client'
import { SupportRequestCreateDto } from '../src/supportRequests/dto/supportRequest.create.dto'

export const ioClient = (namespace: string, accessToken: string): Socket => {
    return io(process.env.WS_URL + namespace, {
        autoConnect: false,
        transports: ['websocket'],
        extraHeaders: { authorization: 'Bearer ' + accessToken },
    })
}

export const initApp = async (overwriteCb?: (mb: TestingModuleBuilder) => void, tmCb?: (tm: TestingModule) => void) => {
    const tmBuilder = Test.createTestingModule({
        imports: [AppModule],
    })
    if (overwriteCb) {
        overwriteCb(tmBuilder)
    }

    const tm = await tmBuilder.compile()

    if (tmCb) {
        tmCb(tm)
    }
    const app = tm.createNestApplication()
    await app.init()
    return app
}

export const registrateUser = async (app: INestApplication, payload: RegistrateUserDto) => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.SIGNUP)
        .send(payload)
        .then(res => res.body)
}

export const authUser = async (app: INestApplication, payload: LoginUserDto): Promise<AuthResultDto | any> => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.SIGNIN)
        .send(payload)
        .then(res => res.body)
}

export const activateUser = async (app: INestApplication, activationLink: string) => {
    await request(app.getHttpServer()).get(ENDPOINTS.ACTIVATE_PROFILE.replace(':uuid', activationLink))
}

export const createHorecaRequest = async (
    app: INestApplication,
    accessToken: string,
    payload: HorecaRequestCreateDto
) => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.HOREKA_REQUESTS)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(payload)
        .then(res => {
            return res.body
        })
}

export const addFavourites = async (app: INestApplication, accessToken: string, payload: FavouritesCreateDto) => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.HOREKA_FAVOURITES)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(payload)
        .then(res => {
            return res.body
        })
}

export const getFavourites = async (app: INestApplication, accessToken: string) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.HOREKA_FAVOURITES)
        .set('Authorization', 'Bearer ' + accessToken)
        .then(res => {
            return res.body
        })
}

export const deleteFavourites = async (app: INestApplication, accessToken: string, providerId: number) => {
    return request(app.getHttpServer())
        .delete(ENDPOINTS.HOREKA_FAVOURITES + '/' + providerId)
        .set('Authorization', 'Bearer ' + accessToken)
        .then(res => {
            return res.body
        })
}

export const getHorecaRequest = async (app: INestApplication, accessToken: string, id: number) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.HOREKA_REQUEST.replace(':id', id.toString()))
        .set('Authorization', 'Bearer ' + accessToken)
        .then(res => {
            return res.body
        })
}

export const createHorecaRequestTemplate = async (
    app: INestApplication,
    accessToken: string,
    payload: HorecaRequestTemplateCreateDto
) => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.HOREKA_REQUESTS_TEMPLATES)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(payload)
        .then(res => {
            return res.body
        })
}

export const updateHorecaRequestTemplate = async (
    app: INestApplication,
    accessToken: string,
    id: number,
    payload: HorecaRequestTemplateUpdateDto
) => {
    return request(app.getHttpServer())
        .put(ENDPOINTS.HOREKA_REQUESTS_TEMPLATES + '/' + id)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(payload)
        .then(res => {
            return res.body
        })
}

export const getHorecaRequestTemplate = async (app: INestApplication, accessToken: string, id: number) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.HOREKA_REQUESTS_TEMPLATES + '/' + id)
        .set('Authorization', 'Bearer ' + accessToken)
        .then(res => {
            return res.body
        })
}

export const deleteHorecaRequestTemplate = async (app: INestApplication, accessToken: string, id: number) => {
    return request(app.getHttpServer())
        .delete(ENDPOINTS.HOREKA_REQUESTS_TEMPLATES + '/' + id)
        .set('Authorization', 'Bearer ' + accessToken)
        .then(res => {
            return res.body
        })
}

export const getHorecaRequestTemplates = async (app: INestApplication, accessToken: string) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.HOREKA_REQUESTS_TEMPLATES)
        .set('Authorization', 'Bearer ' + accessToken)
        .then(res => {
            return res.body
        })
}

export const findAllHorecaRequest = async (
    app: INestApplication,
    accessToken: string,
    paginate: Partial<PaginateValidateType> = {}
) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.HOREKA_REQUESTS)
        .set('Authorization', 'Bearer ' + accessToken)
        .query(paginate)
        .then(res => {
            return res.body
        })
}

export const findAllHorecaRequestForProvider = async (
    app: INestApplication,
    accessToken: string,
    paginate: any = {}
) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.HOREKA_REQUESTS_FOR_PROVIDER)
        .set('Authorization', 'Bearer ' + accessToken)
        .query(paginate)
        .then(res => {
            return res.body
        })
}
export const setHorecaRequestStatus = async (
    app: INestApplication,
    accessToken: string,
    payload: HorecaRequestProviderStatusDto
) => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.HOREKA_REQUESTS_FOR_PROVIDER_STATUS)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(payload)
        .then(res => {
            return res.body
        })
}

export const createProviderRequest = async (
    app: INestApplication,
    accessToken: string,
    payload: ProviderRequestCreateDto
) => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.PROVIDER_REQUESTS)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(payload)
        .then(res => {
            return res.body
        })
}

export const findAllProviderRequests = async (
    app: INestApplication,
    accessToken: string,
    paginate: Partial<PaginateValidateType> = {}
) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.PROVIDER_REQUESTS)
        .set('Authorization', 'Bearer ' + accessToken)
        .query(paginate)
        .then(res => {
            return res.body
        })
}

export const approveProviderRequest = async (
    app: INestApplication,
    accessToken: string,
    payload: HorecaRequestSetStatusDto
) => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.HOREKA_APPROVE_PROVIDER_REQUEST)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(payload)
        .then(res => {
            return res.body
        })
}

export const createChat = async (
    app: INestApplication,
    accessToken: string,
    payload: ChatCreateDto
): Promise<ChatDto | any> => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.CHATS)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(payload)
        .then(res => res.body)
}

export const getChats = async (app: INestApplication, accessToken: string) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.CHATS)
        .set('Authorization', 'Bearer ' + accessToken)
        .then(res => res.body)
}

export const getChat = async (app: INestApplication, accessToken: string, id: number) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.CHAT.replace(':id', id.toString()))
        .set('Authorization', 'Bearer ' + accessToken)
        .then(res => res.body)
}

export const getChatMessages = async (app: INestApplication, accessToken: string, id: number) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.CHAT_MESSAGES + '?chatId=' + id)
        .set('Authorization', 'Bearer ' + accessToken)
        .then(res => res.body)
}

export const getProfile = async (app: INestApplication, accessToken: string) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.PROFILE)
        .set('Authorization', 'Bearer ' + accessToken)
        .then(res => res.body)
}

export const updateProfile = async (app: INestApplication, accessToken: string, payload: UpdateUserDto) => {
    return request(app.getHttpServer())
        .put(ENDPOINTS.PROFILE)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(payload)
        .then(res => res.body)
}

export const createSupportRequest = async (
    app: INestApplication,
    accessToken: string,
    payload: SupportRequestCreateDto
): Promise<ChatDto | any> => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.SUPPORT)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(payload)
        .then(res => res.body)
}

export const assignAdminToSupportRequest = async (app: INestApplication, accessToken: string, id: number) => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.SUPPORT_ADMIN.replace(':id', id.toString()))
        .set('Authorization', 'Bearer ' + accessToken)
        .then(res => res.body)
}
