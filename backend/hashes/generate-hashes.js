const bcrypt = require('bcryptjs');

const passwords = {
  'Admin123!': 'admin@dicri.gob.gt',
  'Coord123!': 'coordinador1@dicri.gob.gt',
  'Tecnico123!': 'tecnico1@dicri.gob.gt'
};

async function generateHashes() {
  console.log('Generando hashes de contraseñas...\n');
  
  for (const [password, email] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}\n`);
  }
}

generateHashes();

// Email: admin@dicri.gob.gt
// Password: Admin123!
// Hash: $2a$10$kyqatbMufIhIu6cHMI1jEe9Ioqo6fRpkHM2dhebWzFoHd3O/H0Lja

// Email: coordinador1@dicri.gob.gt
// Password: Coord123!
// Hash: $2a$10$3S2.jdXE4.GYUE7K0sOUvutHxByJZm7DAnT9K4e02IquMia.Wflh6

// Email: tecnico1@dicri.gob.gt
// Password: Tecnico123!
// Hash: $2a$10$3IHTn0sBNqlSUT9PWkn/xuFUCni1ccJO/Ro3JJxegW8FGHbWho0ja
