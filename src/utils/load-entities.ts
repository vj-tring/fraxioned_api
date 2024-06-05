import { join } from 'path';
import { sync as globSync } from 'glob';

export function loadEntities(): any[] {
  const entityFiles = globSync(
    join(__dirname, '..', 'modules', '**', '*.entity.{ts,js}'),
  );

  return entityFiles.flatMap((file) => {
    const entityModule = require(file);
    const entities = Object.values(entityModule).filter(
      (value) => typeof value === 'function',
    );
    if (entities.length > 0) {
      return entities;
    }
    throw new Error(`Invalid entity export in file: ${file}`);
  });
}
