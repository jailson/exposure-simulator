import { Command } from 'commander';
import * as geolib from 'geolib';
import * as fs from 'fs';
import * as figlet from 'figlet';

console.log(figlet.textSync('Exposure Simulator'));

const program = new Command();

program
  .version('0.0.1')
  .option('-d, --db <file>', 'Path to DB JSON file')
  .option('-e, --exposure <file>', 'Path to output the exposure JSON file')
  .parse(process.argv);

const options = program.opts();

if (!options.db) {
  console.error('Database file is required.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(options.db, 'utf8'));

function calculateExposure(poi:any, soe:any) {
  const distance = geolib.getDistance(poi.location, soe.location);
  const exposure = Math.max(0, 1 - distance / soe.radius);

  if (exposure > 0) {
    console.log('POI', poi.id, 'has exposure to SOE type', soe.type, 'with a rate of', exposure.toFixed(2));
  }
  return exposure;
}

console.log('Points Of Interest', data.poi.length);
console.log('Sources Of Exposure', data.soe.length);

const exposures = data.poi.map((poi: any) => ({
  poi_id: poi.id,
  exposures: data.soe.map((soe: any) => ({
    soe_id: soe.id,
    exposure: calculateExposure(poi, soe),
    type: soe.type
  })),
}));

const output = JSON.stringify(exposures, null, 2);

if (options.exposure) {
  fs.writeFile(options.exposure,output, () => {});
} else {
  console.log(output);
}
