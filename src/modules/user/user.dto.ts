export class UserDTO {
  id: number;
  username: string;
  phone: string;
  email: string;
  password: string;
  roleId: number;
  isActive: boolean;
  currentSessionId: string;
  resetToken: string;
  inviteToken: string;
  lastLoginTime: Date;
  lastUpdated: Date;
  createdAt: Date;
}
