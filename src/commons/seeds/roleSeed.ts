import { DataSource } from 'typeorm';
import { Role } from 'entities/role.entity';

export const seedRole = async (dataSource: DataSource) => {
  const existingUsers = await dataSource.getRepository(Role).find();
  if (existingUsers.length === 0) {
    await dataSource.getRepository(Role).save([
      {
        role_name: 'Admin',
        description: 'admin-role',
        created_by: 1,
        created_at: new Date(Date.now()),
        updated_by: 1,
        updated_at: new Date(Date.now()),
      },
      {
        role_name: 'Broker',
        description: 'broker-role',
        created_by: 1,
        created_at: new Date(Date.now()),
        updated_by: 1,
        updated_at: new Date(Date.now()),
      },
    ]);
  }
};
