import { DataSource } from 'typeorm';
import { Users } from 'src/entities/users.entity';
import { Roles } from 'src/entities/roles.entity';

export const seedRole = async (dataSource: DataSource): Promise<void> => {
  const existingRoles = await dataSource.getRepository(Roles).find();
  if (existingRoles.length === 0) {
    const userRepository = dataSource.getRepository(Users);
    const adminUser = await userRepository.findOne({ where: {} });
    const ownerUser = await userRepository.findOne({ where: {} });

    await dataSource.getRepository(Roles).save([
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
