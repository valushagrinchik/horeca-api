import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CronStatus, CronTask } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class CronPrismaService {
    constructor(
        private readonly configService: ConfigService,
        private prisma: PrismaService,
        private readonly logger: Logger = new Logger()
    ) {
        this.MAX_TRIES = this.configService.get('CRON_MAX_TRIES') || 100
    }

    MAX_TRIES: number = 0
 
    /**
     * Get not running tasks
     * @returns
     */
    async getNotRunningTasks() {
        const tasks = await this.prisma.cronTask.findMany({
            where: {
                cronStatus: {in: [CronStatus.Ready, CronStatus.Error]}
            },
            orderBy: {
                cronTries: 'desc'
            },
            
        })
    

        return tasks
    }

    /**
     * Get task by id
     * @param id
     * @returns
     */
    async getTaskById(id: number) {
        return await this.prisma.cronTask.findUnique({where :{id}})
    }


    /**
     * Update task
     * @param id
     * @param updateData
     */
    async updateTask({ id }: CronTask, updateData: any): Promise<CronTask> {
        return await this.prisma.cronTask.update({
            where: {
                id
            },
            data: updateData
        })
    }

    /**
     * Set task status to start
     * @param item
     */
    async startTask(item: CronTask) {
        return await this.updateTask(item,  {
            cronStatus: CronStatus.Work,
            cronStart: new Date(),
            cronTries: item.cronTries + 1
        })
    }

    /**
     * Set task status to finish
     * @param item
     */
    async finishTask(item: CronTask, proof?: number | string) {
        return await this.updateTask(
            item,
            {
                cronStatus: CronStatus.Done,
                cronFinish: new Date(),
                cronProof: proof.toString(),
            }
        )
    }

    /**
     * Set task status to ready
     * @param item
     */
    async readyTask(item: CronTask) {
        return await this.updateTask(
            item,
            {
                cronStatus: CronStatus.Ready,
                cronStart: null,
            }
        )
    }

    /**
     * Set task status to error
     * @param item
     */
    async errorTask(item: CronTask) {
        // set task failed if counter more then MAX_TRIES
        const task = await this.getTaskById(item.id)
        if (task.cronTries >= this.MAX_TRIES) {
            await this.failedTask(item)
            return
        }

        return await this.updateTask(
            item,
            {
                cronStatus: CronStatus.Error,
                cronStart: null,
            }
        )
    }

    /**
     * Set task failed
     * @param item
     */
    async failedTask(item: CronTask) {
        return await this.updateTask(
            item,
            {
                cronStatus: CronStatus.Failed,
            }
        )
    }

    /**
     * Process tasks
     * @param service Service
     * @param method Method in service
     */
    async processTasks(service: any, method: any): Promise<void> {
        try {
            const tasks = await this.getNotRunningTasks()

            if (tasks.length > 0) this.logger.log(`Cron ${service.constructor.name} tasks: ${tasks.length}`)

            await Promise.all(
                tasks.map(async (item: CronTask) => {
                    try {
                        const result = await this.startTask(item)

                        // if task already started
                        if (!result) {
                            this.logger.log(`Task ${service.constructor.name}#${item.id} already started`)
                            return
                        }

                        const proof = await service[method](item)
                        // if task not return success result
                        if (!proof) {
                            await this.readyTask(item)
                            return
                        }
                        // force failed task
                        if (proof === -1) {
                            await this.failedTask(item)
                            return
                        }

                        await this.finishTask(item, proof)
                    } catch (err) {
                        this.logger.log(`Cron ${service.constructor.name} error: ${err.message}`, JSON.stringify(err))

                        await this.errorTask(item)
                    }
                })
            )
        } catch (err) {
            this.logger.error(`Process ${service}:${method} error`, err)
        }
    }
}
