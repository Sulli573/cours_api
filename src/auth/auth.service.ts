import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly users: UsersService) {}

  async signup(dto: SignupDto) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.users.create({
      email: dto.email,
      password: passwordHash,
    });

    return { id: user.id, email: user.email };
  }
}