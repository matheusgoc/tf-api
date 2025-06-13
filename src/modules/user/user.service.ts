import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { MongoFindManyOptions } from 'typeorm/find-options/mongodb/MongoFindManyOptions';

import { User, USER_ROLE } from '../../entities/user.entity';
import { UserProfileDto } from './dto/user-profile.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUserDto } from './dto/list-user.dto';
import { PageDto, PageMetaDto } from '../core/dto/page-options.dto';
import { EncryptionService } from '../core/encryption/encryption.service';
import {
  AUTH_PURPOSE,
  AuthService,
  UNAUTHORIZED_REASON,
} from '@/modules/auth/auth.service';
import { UserMailService } from '@/modules/mail/user-mail.service';

@Injectable()
export class UserService extends EncryptionService {
  constructor(
    @InjectRepository(User) private repo: MongoRepository<User>,
    private readonly userMail: UserMailService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  private filter(options: ListUserDto) {
    const { search, role, inactive } = options;
    const where: MongoFindManyOptions<User>['where'] = { $and: [] };

    // active users - by default
    if (inactive && inactive !== 'false') {
      where.$and.push({
        deactivatedAt: { $ne: null, $exists: true },
      });
    }

    // inactive users - when declared
    else {
      where.$and.push({
        $or: [
          { deactivatedAt: { $eq: null } },
          { deactivatedAt: { $exists: false } },
        ],
      });
    }

    // search by email - when search represents an email
    if (search && search.includes('@')) {
      where.$and.push({
        email: { $eq: search.toLowerCase() },
      });
    }

    // search by ID - when search represents an ObjectId
    else if (search && /^[a-f\d]{24}$/i.test(search)) {
      where.$and.push({
        _id: { $eq: new ObjectId(search) },
      });
    }

    // search by name otherwise
    else if (search) {
      where.$and.push({
        name: { $regex: new RegExp(`^${search}`, 'i') },
      });
    }

    // search by role
    if (role) {
      where.$and.push({
        role: { $eq: role },
      });
    }

    return where;
  }

  async findAll(options: ListUserDto): Promise<PageDto<User>> {
    const order = this.mapSort<User>(options.order, {
      name: 'name',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      deactivatedAt: 'deactivatedAt',
      role: 'role',
    });

    const [entities, itemCount] = await this.repo.findAndCount({
      skip: (options.page - 1) * options.take,
      take: options.take,
      order,
      where: this.filter(options),
      select: [
        'id',
        'name',
        'email',
        'role',
        'createdAt',
        'updatedAt',
        'deactivatedAt',
        'enrolledAt',
      ],
    });

    const pageMetaData = new PageMetaDto({
      pageOptionsDto: options,
      itemCount,
    });

    return new PageDto(entities, pageMetaData);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOneBy({ _id: { $eq: new ObjectId(id) } });

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    delete user.password;

    return user;
  }

  findByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }

  private async validate(dto: UpdateUserDto, excludeId?: string) {
    if (dto.role === USER_ROLE.MASTER) {
      throw new UnprocessableEntityException('USER_MASTER_NOT_ALLOWED');
    }
    if (dto.email) {
      const where: Record<string, any> = { email: dto.email };
      if (excludeId) {
        where._id = { $ne: new ObjectId(excludeId) };
      }
      if (await this.repo.countBy(where)) {
        throw new ConflictException('USER_WITH_SAME_EMAIL');
      }
    }
  }

  async create(dto: CreateUserDto) {
    await this.validate(dto);

    const user = this.repo.create({
      name: dto.name,
      email: dto.email,
      role: dto.role,
      profile: {
        language: dto.profile.language,
        region: dto.profile.region,
      },
    });

    const createdUser = await this.repo.save(user);

    this.startEnrollment(createdUser.id.toString());

    return createdUser;
  }

  async startEnrollment(id: string) {
    const user = await this.findOne(id);

    if (user.enrolledAt) {
      throw new UnprocessableEntityException(
        UNAUTHORIZED_REASON.USER_IS_ENROLLED,
      );
    }

    await this.repo.save(user);

    const token = this.authService.generateToken(user, AUTH_PURPOSE.ENROLL);
    this.userMail.sendEnrollEmail(user, token.access_token);
  }

  async enroll(user: User, password: string) {
    user.password = await this.hashPassword(password);
    user.enrolledAt = new Date();

    return this.repo.save(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.validate(dto, id);

    const user = await this.findOne(id);

    user.name = dto.name;
    user.email = dto.email;
    user.role = dto.role;

    return this.repo.save(user);
  }

  async updateProfile(id: string, dto: UserProfileDto) {
    const user = await this.findOne(id);

    if (dto.language) {
      user.profile = { ...user.profile, language: dto.language };
    }

    if (dto.region) {
      user.profile = { ...user.profile, region: dto.region };
    }

    return this.repo.save(user);
  }

  async deactivate(id: string) {
    const user = await this.findOne(id);
    user.deactivatedAt = new Date();

    return this.repo.save(user);
  }

  async activate(id: string) {
    const user = await this.findOne(id);
    user.deactivatedAt = null;

    return this.repo.save(user);
  }

  async setPassword(user: User, password: string) {
    user.password = await this.hashPassword(password);
    return this.repo.save(user);
  }
}
