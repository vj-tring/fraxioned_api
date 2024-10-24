import { DataSource } from 'typeorm';
import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';

export const seedProperties = async (dataSource: DataSource): Promise<void> => {
  const propertiesRepository = dataSource.getRepository(Property);
  const userRepository = dataSource.getRepository(User);

  const adminUser = await userRepository.findOne({ where: { id: 1 } });

  if (!adminUser) {
    throw new Error('Admin user must be seeded before seeding properties');
  }

  const existingProperties = await propertiesRepository.find();
  if (existingProperties.length === 0) {
    const properties = [
      {
        propertyName: 'Paradise Shores (eighths)',
        address: '5367 S. Cyan Lane',
        city: 'St. George',
        state: 'Utah',
        country: 'United States',
        zipcode: 84790,
        houseDescription:
          'Ready for an escape to your home away from home? Book a stay at the beautiful Paradise Shores, your oasis in St. George, Utah. Jump back into the clear waters of the community lagoon, just steps away from your front door. Or, if you’re looking for more privacy, take a dip in your secluded private pool and spa. With game tables, a theater room, large common areas, and cozy bedrooms, you might not want to leave the house at all. There’s room for the whole crew, so bring them all (or don’t). Either way, get ready to make some lifelong memories at your vacation home. Paradise Shores- your favorite place with your favorite people.',
        isExclusive: false,
        propertyShare: 8,
        propertyRemainingShare: 8,
        latitude: 0,
        longitude: 0,
        isActive: true,
        displayOrder: 1,
        createdBy: adminUser,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
      {
        propertyName: 'Paradise Shores (tenths)',
        address: '5367 S. Cyan Lane',
        city: 'St. George',
        state: 'Utah',
        country: 'United States',
        zipcode: 84790,
        houseDescription:
          'Ready for an escape to your home away from home? Book a stay at the beautiful Paradise Shores, your oasis in St. George, Utah. Jump back into the clear waters of the community lagoon, just steps away from your front door. Or, if you’re looking for more privacy, take a dip in your secluded private pool and spa. With game tables, a theater room, large common areas, and cozy bedrooms, you might not want to leave the house at all. There’s room for the whole crew, so bring them all (or don’t). Either way, get ready to make some lifelong memories at your vacation home. Paradise Shores- your favorite place with your favorite people.',
        isExclusive: false,
        propertyShare: 10,
        propertyRemainingShare: 10,
        latitude: 0,
        longitude: 0,
        isActive: true,
        displayOrder: 2,
        createdBy: adminUser,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
      {
        propertyName: 'Crown Jewel',
        address: '5409 S. Aquamarine Lane',
        city: 'St. George',
        state: 'Utah',
        country: 'United States',
        zipcode: 84790,
        houseDescription:
          'Ready for an escape to your home away from home? Book a stay at the Crown Jewel, your oasis in St. George, Utah. Jump back into the clear waters of the community lagoon, just a short walk from your front door. Head to the pickleball courts for a round of friendly competition. With large common areas, a private spa, game tables, and cozy bedrooms, you might not want to leave the house at all. Get ready to make lifelong memories at your vacation home. Crown Jewel- your favorite place with your favorite people.',
        isExclusive: false,
        propertyShare: 8,
        propertyRemainingShare: 8,
        latitude: 0,
        longitude: 0,
        isActive: true,
        displayOrder: 3,
        createdBy: adminUser,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
      {
        propertyName: 'Modern Lagoon',
        address: '833 W. Cyan Lane',
        city: 'St. George',
        state: 'Utah',
        country: 'United States',
        zipcode: 84790,
        houseDescription:
          'Ready for an escape to your home away from home? Book a stay at the stunning Modern Lagoon, your personal oasis in St. George, Utah. Jump back into the clear waters of the community lagoon, just steps away from your front door. Or, if you’re looking for more privacy, take a dip in your private pool and spa. With game tables, a theater room, large common areas, and cozy bedrooms, you might not want to leave the house at all. There’s room for the whole crew, so bring them all (or don’t). Either way, get ready to make some lifelong memories at your vacation home. Modern Lagoon- your favorite place with your favorite people.',
        isExclusive: false,
        propertyShare: 13,
        propertyRemainingShare: 13,
        latitude: 0,
        longitude: 0,
        isActive: true,
        displayOrder: 4,
        createdBy: adminUser,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
      {
        propertyName: 'Blue Bear Lake',
        address: '537 Blue Lake Street',
        city: 'Garden City',
        state: 'Utah',
        country: 'United States',
        zipcode: 84028,
        houseDescription:
          'Ready for an escape to your home away from home? Book a stay at Blue Bear Lake, your cozy mountain retreat. Explore the year-round outdoor activities that Bear Lake Valley has to offer. Enjoy the small town charm of Garden City, and try some new local cuisine. After your adventures, return to the comfort of your townhome- complete with large common areas, game tables, and cozy bedrooms. Get ready to make lifelong memories at your vacation home. Blue Bear Lake- your favorite place with your favorite people.',
        isExclusive: false,
        propertyShare: 8,
        propertyRemainingShare: 8,
        latitude: 0,
        longitude: 0,
        isActive: true,
        displayOrder: 5,
        createdBy: adminUser,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
      {
        propertyName: 'Bear Lake Bluffs',
        address: '732 Spruce Drive',
        city: 'Garden City',
        state: 'Utah',
        country: 'United States',
        zipcode: 84028,
        houseDescription:
          'Ready for an escape to your home away from home? Book a stay at Bear Lake Bluffs, your cozy mountain retreat. Explore the year-round outdoor activities that Bear Lake Valley has to offer. Enjoy the small town charm of Garden City, and try some new local cuisine. After your adventures, return to the comfort of your second home- complete with large common areas, game tables, and cozy bedrooms. There’s room for the whole crew, so bring them all (or don’t). Either way, get ready to make some lifelong memories at your vacation home. Bear Lake Bluffs- your favorite place with your favorite people.',
        isExclusive: false,
        propertyShare: 8,
        propertyRemainingShare: 8,
        latitude: 0,
        longitude: 0,
        isActive: true,
        displayOrder: 6,
        createdBy: adminUser,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
      {
        propertyName: 'Swan Creek',
        address: '1343 N. Trapper Lane',
        city: 'Garden City',
        state: 'Utah',
        country: 'United States',
        zipcode: 84028,
        houseDescription:
          'Ready for an escape to your home away from home? Book a stay at Swan Creek, your cozy mountain retreat. Explore the year-round outdoor activities that Bear Lake Valley has to offer. Enjoy the small town charm of Garden City, and try some new local cuisine. After your adventures, return to the comfort of your second home- complete with large common areas, game tables, and cozy bedrooms. There’s room for the whole crew, so bring them all (or don’t). Either way, get ready to make some lifelong memories at your vacation home. Swan Creek- your favorite place with your favorite people.',
        isExclusive: true,
        propertyShare: 8,
        propertyRemainingShare: 8,
        latitude: 0,
        longitude: 0,
        isActive: true,
        displayOrder: 7,
        createdBy: adminUser,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
      {
        propertyName: 'Huckleberry House',
        address: '565 Richland Valley Street',
        city: 'Garden City',
        state: 'Utah',
        country: 'United States',
        zipcode: 84028,
        houseDescription:
          'Ready for an escape to your home away from home? Book a stay at Huckleberry House, your cozy mountain retreat. Explore the year-round outdoor activities that Bear Lake Valley has to offer. Enjoy the small town charm of Garden City, and try some new local cuisine. After your adventures, return to the comfort of your townhome- complete with large common areas, game tables, and cozy bedrooms. Get ready to make lifelong memories at your vacation home. Huckleberry House- your favorite place with your favorite people.',
        isExclusive: false,
        propertyShare: 8,
        propertyRemainingShare: 8,
        latitude: 0,
        longitude: 0,
        isActive: true,
        displayOrder: 8,
        createdBy: adminUser,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
      {
        propertyName: 'Raspberry Retreat',
        address: '330 W Morningstar Circle',
        city: 'Utah',
        state: 'Arizona',
        country: 'United States',
        zipcode: 84028,
        houseDescription:
          'Ready for an escape to your home away from home? Book a stay at Raspberry Retreat, your cozy mountain escape. Explore the year-round outdoor activities that Bear Lake Valley has to offer. Enjoy the small town charm of Garden City, and try some new local cuisine. After your adventures, return to the comfort of your second home- complete with large common areas, game tables, and cozy bedrooms. There’s room for the whole crew, so bring them all (or don’t). Either way, get ready to make some lifelong memories at your vacation home. Raspberry Retreat- your favorite place with your favorite people.',
        isExclusive: false,
        propertyShare: 8,
        propertyRemainingShare: 8,
        latitude: 0,
        longitude: 0,
        isActive: true,
        displayOrder: 9,
        createdBy: adminUser,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
      {
        propertyName: 'Lake Escape',
        address: '13 Rosemary Lane',
        city: 'Page',
        state: 'Arizona',
        country: 'United States',
        zipcode: 86040,
        houseDescription:
          'Ready for an escape to your home away from home? Book a stay at Lake Escape, your oasis in the Arizona desert. Explore the year-round outdoor activities that Page has to offer. Lake Powell, Horseshoe Bend, and the Grand Canyon, are all only minutes away. After your adventures, return to the comfort of your townhome- complete with large common areas, modern amenities, and cozy bedrooms. Get ready to make lifelong memories at your vacation home. Lake Escape- your favorite place with your favorite people.',
        isExclusive: false,
        propertyShare: 8,
        propertyRemainingShare: 8,
        latitude: 0,
        longitude: 0,
        isActive: true,
        displayOrder: 10,
        createdBy: adminUser,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      },
    ];

    const propertyEntities = properties.map((property) =>
      propertiesRepository.create(property),
    );

    await propertiesRepository.save(propertyEntities);
  }
};
