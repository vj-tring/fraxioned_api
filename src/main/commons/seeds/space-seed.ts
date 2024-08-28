import { DataSource } from 'typeorm';
import { Space } from 'src/main/entities/space.entity';

export const seedSpace = async (dataSource: DataSource): Promise<void> => {
  const spaceRepository = dataSource.getRepository(Space);

  const existingSpaces = await spaceRepository.find();
  if (existingSpaces.length === 0) {
    const generalSpace = spaceRepository.create({
      name: 'General',
    });

    const bedroomSpace = spaceRepository.create({
      name: 'Bedroom',
    });

    const bathroomSpace = spaceRepository.create({
      name: 'Bathroom',
    });

    await spaceRepository.save([generalSpace, bedroomSpace, bathroomSpace]);
  }
};
