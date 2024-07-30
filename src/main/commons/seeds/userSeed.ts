import { DataSource } from 'typeorm';
import { User } from 'src/main/entities/user.entity';
import { Role } from 'src/main/entities/role.entity';
import * as bcrypt from 'bcrypt';

export const seedUser = async (dataSource: DataSource): Promise<void> => {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);

  const adminRole = await roleRepository.findOne({ where: { id: 1 } });
  const ownerRole = await roleRepository.findOne({ where: { id: 2 } });

  if (!adminRole || !ownerRole) {
    throw new Error('Roles must be seeded before seeding users');
  }

  const existingUsers = await userRepository.find();
  if (existingUsers.length === 0) {
    const adminUser = userRepository.create({
      firstName: 'Admin',
      lastName: 'User',
      password: await bcrypt.hash('Admin@123', 10),
      role: adminRole,
      isActive: true,
      createdBy: 1,
      updatedBy: 1,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
    });

    const ownerUser = userRepository.create({
      firstName: 'Owner',
      lastName: 'User',
      password: await bcrypt.hash('Owner@123', 10),
      role: ownerRole,
      isActive: true,
      createdBy: 1,
      updatedBy: 1,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
    });

    await userRepository.save([adminUser, ownerUser]);
  }
};
