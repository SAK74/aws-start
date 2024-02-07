import { Injectable, Inject } from '@nestjs/common';

import { v4 } from 'uuid';

import { User } from '../models';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(userId: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async createOne({ name, password, email }: Omit<User, 'id'>): Promise<User> {
    const id = v4();
    const newUser = { id: name || id, name, password, email };

    return await this.prisma.user.create({ data: newUser });
  }
}
