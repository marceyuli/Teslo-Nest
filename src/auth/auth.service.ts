import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()

export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}

  async create(CreateUserDto: CreateUserDto) {
    try{
      const user = this.userRepository.create(CreateUserDto);
      await this.userRepository.save(user);
      return user;
    }
    catch(error){
      this.handleDBError(error);
    }
  }

  private handleDBError(error: any): never{
    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    }
    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }

}
