import { DataSource } from 'typeorm';
import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';

export const seedProperties = async (dataSource: DataSource): Promise<void> => {
  const propertiesRepository = dataSource.getRepository(Property);
  const userRepository = dataSource.getRepository(User);

  const adminUser = await userRepository.findOne({ where: { id: 1 } });
  const ownerUser = await userRepository.findOne({ where: { id: 2 } });

  if (!adminUser || !ownerUser) {
    throw new Error('Users must be seeded before seeding properties');
  }

  const existingProperties = await propertiesRepository.find();
  if (existingProperties.length === 0) {
    const property1 = propertiesRepository.create({
      propertyName: 'Paradise Shores (tenths)',
      address: '5367 S. Cyan Lane',
      city: 'St. George',
      state: 'Utah',
      country: 'USA',
      zipcode: 84790,
      houseDescription: 'A luxurious villa with all amenities.',
      isExclusive: true,
      propertyShare: 100,
      createdBy: adminUser,
      updatedBy: adminUser,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
    } as Property);

    const property2 = propertiesRepository.create({
      propertyName: 'Crown Jewel',
      address: '5409 S. Aquamarine Lane',
      city: 'St. George',
      state: 'Utah',
      country: 'USA',
      zipcode: 84790,
      houseDescription: 'A beautiful beach house with ocean views.',
      isExclusive: false,
      propertyShare: 50,
      createdBy: ownerUser,
      updatedBy: ownerUser,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
    } as Property);

    await propertiesRepository.save([property1, property2]);
  }
};
