import { join } from 'path';
import { glob } from 'glob';

export function loadRepositories(): Function[] {
  const entityFiles = glob.sync(
    join(__dirname, '..', 'modules', '**', '*.repository.{ts,js}'),
  );

  return entityFiles.map((file) => {
    const entityModule = require(file);
    const entity = Object.values(entityModule)[0];

    if (typeof entity === 'function') {
      return entity as Function;
    }

    throw new Error(`Invalid entity export in file: ${file}`);
  });
}
