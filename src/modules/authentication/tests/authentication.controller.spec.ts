import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from '../authentication.controller';
import { AuthenticationService } from '../authentication.service';
import { InviteDTO } from '../dto/invite.dto';
import { RegisterDTO } from '../dto/register.dto';
import { LoginDTO } from '../dto/login.dto';

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
            sendInvite: jest
              .fn()
              .mockResolvedValue({ message: 'Invitation sent successfully' }),
            register: jest
              .fn()
              .mockResolvedValue({ message: 'User registered successfully' }),
            login: jest.fn().mockResolvedValue({ token: 'some-token' }),
            logout: jest
              .fn()
              .mockResolvedValue({ message: 'Logout successful' }),
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

  describe('sendInvite', () => {
    it('should send an invite and return a success message', async () => {
      const inviteDTO: InviteDTO = { email: 'test@example.com', roleId: 1 };
      const result = await controller.sendInvite(inviteDTO);
      expect(result).toEqual({ message: 'Invitation sent successfully' });
      expect(service.sendInvite).toHaveBeenCalledWith(inviteDTO);
    });
  });

  describe('register', () => {
    it('should register a user and return a success message', async () => {
      const registerDTO: RegisterDTO = {
        inviteToken: 'some-token',
        username: 'testuser',
        phone: '1234567890',
        password: 'password',
      };
      const result = await controller.register(registerDTO);
      expect(result).toEqual({ message: 'User registered successfully' });
      expect(service.register).toHaveBeenCalledWith(registerDTO);
    });
  });

  describe('login', () => {
    it('should login a user and return a token', async () => {
      const loginDTO: LoginDTO = {
        email: 'test@example.com',
        password: 'password',
      };
      const result = await controller.login(loginDTO);
      expect(result).toEqual({ token: 'some-token' });
      expect(service.login).toHaveBeenCalledWith(loginDTO);
    });
  });

  describe('logout', () => {
    it('should logout a user and return a success message', async () => {
      const token = 'Bearer some-token';
      const result = await controller.logout(token);
      expect(result).toEqual({ message: 'Logout successful' });
      expect(service.logout).toHaveBeenCalledWith(token);
    });
  });
});
