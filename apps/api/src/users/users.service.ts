import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        avatar: true,
        password: true,
      },
    });
    return user;
  }

  async findOrCreate(email: string, data: DeepPartial<User>) {
    let user = await this.userRepository.findOneBy({ email });

    if (!user) {
      const newUser = this.userRepository.create(data);
      user = await this.userRepository.save(newUser);
    }

    return user;
  }

  async save(data: { email: string; password?: string }) {
    const { email, password } = data;
    const user = this.userRepository.create({ email, password });
    return await this.userRepository.save(user);
  }
}
