import {
  Command,
  CommandRunner,
  InquirerService,
  Question,
  QuestionSet,
} from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { User, USER_ROLE } from '../entities/user.entity';
import { EncryptionService } from '../modules/core/encryption/encryption.service';
import { ConsoleLogService } from '../modules/core/logger/console-log/console-log.service';

@Command({
  name: 'seed-user',
  description: 'Add initial users for the application setup',
})
export class SeedUserCommand extends CommandRunner {
  constructor(
    private readonly ds: DataSource,
    private readonly inquirerService: InquirerService,
    private readonly encryptionService: EncryptionService,
    private readonly console: ConsoleLogService,
  ) {
    super();
  }

  async run(): Promise<void> {
    this.console.warn('This command will add the first master User!');

    try {
      await this.start();
    } catch (error) {
      this.console.error('Oops! A runtime error has happened:');
      this.console.log(error, '');
    }
  }

  async start() {
    let proceed = await this.prompt('SeedUserProceed');
    if (!proceed.confirmation) {
      this.console.error('Command declined!');
      return;
    }

    const userRepo: Repository<User> = this.ds.getMongoRepository(User);

    this.console.warn('Verifing if master user has been added already...');
    const hasMasterUser = await userRepo.countBy({ role: USER_ROLE.MASTER });
    if (hasMasterUser) {
      this.console.error('A master user exists already.');
      return false;
    }
    this.console.log('No master user was found.\n');

    const { name, email } = await this.promptUserInfo();
    const password = await this.promptUserPassword();

    this.console.warn(`About to add the master user ${name}<${email}>`);
    proceed = await this.prompt('SeedUserProceed');
    if (!proceed.confirmation) {
      this.console.error('Command declined!');
      return;
    }

    this.console.warn('Registering master user...');

    const user = userRepo.create({
      name: name,
      email: email,
      password: await this.encryptionService.hashPassword(password),
      role: USER_ROLE.MASTER,
    });

    await userRepo.save(user);

    this.console.success('Master user was added succefully!');
  }

  async promptUserInfo() {
    const res = await this.prompt('SeedUserUserInfo');
    const name = res.name.trim();
    const email = res.email.trim();

    name.trim().length >= 2;
    if (name.length < 2) {
      this.console.error("User's name is incorrect!");

      return this.promptUserInfo();
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.console.error("User's email is incorrect!");

      return this.promptUserInfo();
    }

    return {
      name: res.name,
      email: res.email,
    };
  }

  /**
   * @todo remove this method after implementing password email flow
   */
  async promptUserPassword() {
    const res = await this.prompt('SeedUserUserPasswordPrompt');
    const password = res.password.trim();
    const passwordConfirmation = res.passwordConfirmation.trim();

    // 8 characters long, one capital letter, one number, one special character @$!%*?&
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regex.test(password)) {
      this.console.error('Password is invalid!');
      this.console.log('Password must contain:\n');
      this.console.log('at least 8 characters');
      this.console.log('at least 1 capital letter');
      this.console.log('at least 1 lower letter');
      this.console.log('at least 1 number');
      this.console.log('at least 1 special character of @$!%*?&\n');

      return this.promptUserPassword();
    }
    if (password !== passwordConfirmation) {
      this.console.error('Password and confirmation do not match!');

      return this.promptUserPassword();
    }

    return password;
  }

  async prompt(questionSetName: string) {
    const answer = await this.inquirerService.prompt<Record<string, any>>(
      questionSetName,
      undefined,
    );

    return answer;
  }
}

@QuestionSet({ name: 'SeedUserProceed' })
export class SeedUserProceedPrompt {
  @Question({
    message: 'Do you want to proceed?',
    name: 'confirmation',
    type: 'confirm',
  })
  parseProceedConfirmation(input: string) {
    return input;
  }
}

@QuestionSet({ name: 'SeedUserUserInfo' })
export class SeedUserUserInfoPrompt {
  @Question({
    message: "Enter the user's name:",
    name: 'name',
  })
  parseName(input: string) {
    return input;
  }
  @Question({
    message: "Enter the user's email:",
    name: 'email',
  })
  parseEmail(input: string) {
    return input;
  }
}

@QuestionSet({ name: 'SeedUserUserPasswordPrompt' })
export class SeedUserUserPasswordPrompt {
  @Question({
    message: "Enter the user's password:",
    name: 'password',
    type: 'password',
  })
  parsePassword(input: string) {
    return input;
  }
  @Question({
    message: "Confirm the user's password",
    name: 'passwordConfirmation',
    type: 'password',
  })
  parsePasswordConfirmation(input: string) {
    return input;
  }
}
