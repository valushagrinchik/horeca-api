import { ApiProperty } from '@nestjs/swagger';
import { Uploads as UploadPrisma } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Upload implements UploadPrisma {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;

  @Exclude()
  mimetype: string;
  @Exclude()
  size: number;
  @Exclude()
  path: string;

  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  constructor(partial: UploadPrisma) {
    Object.assign(this, partial);
  }
}
