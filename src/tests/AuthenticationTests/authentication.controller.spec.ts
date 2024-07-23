import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from '../../controller/Authentication/authentication.controller';
import { AuthenticationService } from '../../service/Authentication/authentication.service';
import { InviteUserDto } from '../../dto/AuthenticationDto/invite-user.dto';
import { LoginDto } from '../../dto/AuthenticationDto/login.dto';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            inviteUser: jest.fn().mockResolvedValue({ message: 'Invite sent successfully' }),
            login: jest.fn().mockResolvedValue({ message: 'Login successful' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('inviteUser', () => {
    it('should invite a user', async () => {
      const inviteUserDto: InviteUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '123 Main St',
        addressLine2: '',
        state: 'CA',
        city: 'Los Angeles',
        zip: '90001',
        phoneNumber: '1234567890',
        roleId: 1,
      };

      const result = await controller.inviteUser(inviteUserDto);

      expect(result).toEqual({ message: 'Invite sent successfully' });
      expect(service.inviteUser).toHaveBeenCalledWith(inviteUserDto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };

      const result = await controller.login(loginDto);

      expect(result).toEqual({ message: 'Login successful' });
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });
});