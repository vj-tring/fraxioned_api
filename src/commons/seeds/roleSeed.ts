import { DataSource } from 'typeorm';
import { Role } from 'entities/role.entity';
import { User } from 'entities/user.entity';

export const seedRole = async (dataSource: DataSource): Promise<void> => {
  const existingRoles = await dataSource.getRepository(Role).find();
  if (existingRoles.length === 0) {
    const userRepository = dataSource.getRepository(User);
    const adminUser = await userRepository.findOne({ where: {} });
    const ownerUser = await userRepository.findOne({ where: {} });

    await dataSource.getRepository(Role).save([
      {
        roleName: 'Admin',
        roleDescription: 'admin-role',
        createdBy: adminUser,
        updatedBy: adminUser,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
      {
        roleName: 'Owner',
        roleDescription: 'owner-role',
        createdBy: ownerUser,
        updatedBy: ownerUser,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
    ]);
  }
};
