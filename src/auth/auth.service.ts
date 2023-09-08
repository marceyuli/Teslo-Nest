import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto , LoginUserDto} from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()

export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}

  async create(createUserDto: CreateUserDto) {
    try{
      const {password, ...userData} = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: await bcrypt.hash(password, 10)
      });
      await this.userRepository.save(user);
      delete user.password;
      return user;
      //Retornar el JWT de acceso
    }
    catch(error){
      this.handleDBError(error);
    }
  }

  async login(loginUserDto: LoginUserDto){
    const {password, email} = loginUserDto;

    const user = await this.userRepository.findOne({
      where : {email},
      select : {email: true, password: true}
    });

    if(!user){
      throw new UnauthorizedException('Invalid credentials (email)');
    }
    
    if( !bcrypt.compareSync(password, user.password)){
      throw new UnauthorizedException('Invalid credentials (password)');
    }
    
    return user;
    //Retornar el JWT de acceso
  }

  private handleDBError(error: any): never{
    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    }
    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }

}
