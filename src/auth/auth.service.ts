import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { raw } from 'express';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  parseBasicToken(rawToken: string) {
    /// 1) 토큰을 ''기준으로 스필릿한 후 토큰 값만 추출
    const basicSplit = rawToken.split(' ');
    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘 못 되었습니다.');
    }
    const [_, token] = basicSplit;

    ///2) 추출한 토큰을 base64 디코딩해서 이메일과 비밀번호로 나눈다.
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    /// email:password
    const tokenSplit = decoded.split(':');
    if (tokenSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘 못 되었습니다.');
    }

    const [email, password] = tokenSplit;

    return {
      email,
      password,
    };
  }
  async register(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (user) {
      throw new BadRequestException('이미 가입한 이메일 입니다!');
    }
    const hash = await bcrypt.hash(
      password,
      this.configService.get<number>('HASH_ROUNDS'),
    ); //10번에 해당하는 복잡도

    await this.userRepository.save({
      email,
      password: hash,
    });

    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }
  async login(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }
    const passOk = await bcrypt.compare(password, user.password);

    if (!passOk) {
      throw new BadRequestException('잘못된');
    }

    const refreshTokenSecret = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );
    const accessTokenSecret = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    );
    return {
      refreshToken: await this.jwtService.signAsync(
        {
          sub: user.id,
          role: user.role,
          type: 'refrsh',
        },
        {
          secret: refreshTokenSecret,
          expiresIn: '24h',
        },
      ),
      accessToken: await this.jwtService.signAsync(
        {
          sub: user.id,
          role: user.role,
          type: 'access',
        },
        {
          secret: accessTokenSecret,
          expiresIn: 300,
        },
      ),
    };
  }
}
