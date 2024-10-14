import { DataSource } from 'typeorm';
import { Space } from 'entities/space.entity';
import { SpaceTypes } from 'src/main/entities/space-types.entity';

export const seedSpaceType = async (dataSource: DataSource): Promise<void> => {
  const spaceRepository = dataSource.getRepository(Space);
  const spaceTypesRepository = dataSource.getRepository(SpaceTypes);

  const generalSpace = await spaceRepository.findOne({
    where: { id: 1 },
  });
  const bedroomSpace = await spaceRepository.findOne({
    where: { id: 2 },
  });
  const bathroomSpace = await spaceRepository.findOne({
    where: { id: 3 },
  });

  if (!generalSpace || !bedroomSpace || !bathroomSpace) {
    throw new Error('Space must be seeded before seeding Space Type');
  }

  const existingSpaceTypes = await spaceTypesRepository.find();
  if (existingSpaceTypes.length === 0) {
    const diningRoom = spaceTypesRepository.create({
      name: 'Dining Room',
      space: generalSpace,
    });

    const exterior = spaceTypesRepository.create({
      name: 'Exterior',
      space: generalSpace,
    });

    const familyRoom = spaceTypesRepository.create({
      name: 'Family Room',
      space: generalSpace,
    });

    const garage = spaceTypesRepository.create({
      name: 'Garage',
      space: generalSpace,
    });

    const kitchen = spaceTypesRepository.create({
      name: 'Kitchen',
      space: generalSpace,
    });

    const livingRoom = spaceTypesRepository.create({
      name: 'Living Room',
      space: generalSpace,
    });

    const other = spaceTypesRepository.create({
      name: 'Other',
      space: generalSpace,
    });

    const patio = spaceTypesRepository.create({
      name: 'Patio',
      space: generalSpace,
    });

    const pool = spaceTypesRepository.create({
      name: 'Pool',
      space: generalSpace,
    });

    const theatreRoom = spaceTypesRepository.create({
      name: 'Theatre Room',
      space: generalSpace,
    });

    const entry = spaceTypesRepository.create({
      name: 'Entry',
      space: generalSpace,
    });

    const laundryRoom = spaceTypesRepository.create({
      name: 'Laundry Room',
      space: generalSpace,
    });

    const kitchenette = spaceTypesRepository.create({
      name: 'Kitchenette',
      space: generalSpace,
    });

    const kingBed = spaceTypesRepository.create({
      name: 'King bed',
      space: bedroomSpace,
    });

    const caliKingBed = spaceTypesRepository.create({
      name: 'Cali. king bed',
      space: bedroomSpace,
    });

    const queenBed = spaceTypesRepository.create({
      name: 'Queen bed',
      space: bedroomSpace,
    });

    const doubleBed = spaceTypesRepository.create({
      name: 'Double bed',
      space: bedroomSpace,
    });

    const twinBed = spaceTypesRepository.create({
      name: 'Twin bed',
      space: bedroomSpace,
    });

    const bunkBed = spaceTypesRepository.create({
      name: 'Bunk bed',
      space: bedroomSpace,
    });

    const toddlerBed = spaceTypesRepository.create({
      name: 'Toddler bed',
      space: bedroomSpace,
    });

    const cribBed = spaceTypesRepository.create({
      name: 'Crib bed',
      space: bedroomSpace,
    });

    const sleeperSofaOrFutonBed = spaceTypesRepository.create({
      name: 'Sleeper Sofa/Futon',
      space: bedroomSpace,
    });

    const cotOrMurphyBed = spaceTypesRepository.create({
      name: 'Cot/Murphy',
      space: bedroomSpace,
    });

    const couchBed = spaceTypesRepository.create({
      name: 'Couch',
      space: bedroomSpace,
    });

    const hammock = spaceTypesRepository.create({
      name: 'Hammock',
      space: bedroomSpace,
    });

    const airMattress = spaceTypesRepository.create({
      name: 'Air Mattress',
      space: bedroomSpace,
    });

    const floorMattress = spaceTypesRepository.create({
      name: 'Floor Mattress',
      space: bedroomSpace,
    });

    const trundle = spaceTypesRepository.create({
      name: 'Trundle',
      space: bedroomSpace,
    });

    const waterBed = spaceTypesRepository.create({
      name: 'Water Bed',
      space: bedroomSpace,
    });

    const fullBathroom = spaceTypesRepository.create({
      name: 'Full',
      space: bathroomSpace,
    });

    const halfBathroom = spaceTypesRepository.create({
      name: 'Half',
      space: bathroomSpace,
    });

    const showerOnlyBathroom = spaceTypesRepository.create({
      name: 'Shower Only',
      space: bathroomSpace,
    });

    const ensuiteBathroom = spaceTypesRepository.create({
      name: 'Ensuite',
      space: bathroomSpace,
    });

    const banner = spaceTypesRepository.create({
      name: 'Banner',
      space: generalSpace,
    });

    const banners = spaceTypesRepository.create({
      name: 'Banners',
      space: generalSpace,
    });

    await spaceTypesRepository.save([
      diningRoom,
      exterior,
      familyRoom,
      garage,
      kitchen,
      livingRoom,
      other,
      patio,
      pool,
      theatreRoom,
      entry,
      laundryRoom,
      kitchenette,
      kingBed,
      caliKingBed,
      queenBed,
      doubleBed,
      twinBed,
      bunkBed,
      toddlerBed,
      cribBed,
      sleeperSofaOrFutonBed,
      cotOrMurphyBed,
      couchBed,
      hammock,
      airMattress,
      floorMattress,
      trundle,
      waterBed,
      fullBathroom,
      halfBathroom,
      showerOnlyBathroom,
      ensuiteBathroom,
      banner,
      banners,
    ]);
  }
};

