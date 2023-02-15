// https://downgit.github.io/#/home to download param files at https://github.com/Leanny/leanny.github.io/tree/master/splat3/data/parameter/210/weapon
const fs = require('fs');

const version = process.argv[2]; // get argument from cli command
const sveltekitPath = `${__dirname}/../resources/sveltekit/src`;
const outputPath = `${sveltekitPath}/lib/params/latest-params.json`;
const paramsPath = `${__dirname}/params/${version}`;
const weaponInfoPath = `${paramsPath}/WeaponInfoMain.json`;
const subInfoPath = `${paramsPath}/WeaponInfoSub.json`;
const specialInfoPath = `${paramsPath}/WeaponInfoSpecial.json`;
const hmlPath = `${paramsPath}/params.json`;
let weaponParams = {};
let subParams = {};
let specialParams = {};



// check if a version was supplied in the cli
if (!version) {
  console.error('Error: you must specify a version to run this script. Example: npm run params 210');
  return -1;
}


// get weapon list
let weaponData = fs.readFileSync(weaponInfoPath);
weaponData = JSON.parse(weaponData.toString());
weaponData.forEach(weapon => {
  if (weapon.Type === 'Versus') {
    const weaponNameParts = weapon.__RowId.split('_');
    const weaponCategory = weaponNameParts[0];
    const weaponType = weaponNameParts[1];
    const weaponParamFilename = `Weapon${weaponCategory}${weaponType}.game__GameParameterTable.json`;

    try {
      // get each specified weapon params
      let weaponParam = fs.readFileSync(`${paramsPath}/${weaponParamFilename}`);
      weaponParam = JSON.parse(weaponParam.toString());

      weaponParam['WeaponName'] = weapon.__RowId;

      weaponParams[weapon.Id] = weaponParam;
    } catch (error) {
      console.error(`Got an error trying to read ${paramsPath}/${weaponParamFilename}: ${error.message}`);
    }
  }
})



// get sub list
let subData = fs.readFileSync(subInfoPath);
subData = JSON.parse(subData.toString());
subData.forEach(sub => {
  if (sub.Type === 'Versus') {
    const subNameParts = sub.__RowId.split('_');
    const subFilename = (sub.__RowId.includes('Bomb'))
      ? subNameParts[0] + subNameParts[1]
      : sub.__RowId;
    const subParamFilename = `Weapon${subFilename}.game__GameParameterTable.json`;

    try {
      // get each specified sub params
      let subParam = fs.readFileSync(`${paramsPath}/${subParamFilename}`);
      subParam = JSON.parse(subParam.toString());

      subParam['SubName'] = sub.__RowId;

      subParams[sub.Id] = subParam;
    } catch (error) {
      console.error(`Got an error trying to read ${paramsPath}/${subParamFilename}: ${error.message}`);
    }
  }
})



// get special list
let specialData = fs.readFileSync(specialInfoPath);
specialData = JSON.parse(specialData.toString());
specialData.forEach(special => {
  if (special.Type === 'Versus') {
    const specialParamFilename = `Weapon${special.__RowId}.game__GameParameterTable.json`;

    try {
      // get each specified special params
      let specialParam = fs.readFileSync(`${paramsPath}/${specialParamFilename}`);
      specialParam = JSON.parse(specialParam.toString());

      specialParam['SpecialName'] = special.__RowId;

      specialParams[special.Id] = specialParam;
    } catch (error) {
      console.error(`Got an error trying to read ${paramsPath}/${specialParamFilename}: ${error.message}`);
    }
  }
})



// delete latest params file if exists
if (fs.existsSync(outputPath)) {
  try {
    fs.unlinkSync(outputPath);
    console.log(`Successfully deleted ${outputPath}`);
  } catch (err) {
    console.error(`Error, could not unlink ${outputPath}: ${err}`);
  }
}



// write to output
const params = {
  weapons: weaponParams,
  subs: subParams,
  specials: specialParams
};
fs.writeFileSync(outputPath, JSON.stringify(params));
console.log(`Successfully wrote to ${outputPath}`);



// copy over info and hml files
fs.copyFile(weaponInfoPath, `${sveltekitPath}/lib/params/WeaponInfoMain.json`, (err) => {
  if (err) throw err;
  console.log(`Successfully copied ${weaponInfoPath} to ${sveltekitPath}/lib/params/WeaponInfoMain.json`);
});

fs.copyFile(subInfoPath, `${sveltekitPath}/lib/params/SubInfoMain.json`, (err) => {
  if (err) throw err;
  console.log(`Successfully copied ${subInfoPath} to ${sveltekitPath}/lib/params/SubInfoMain.json`);
});

fs.copyFile(specialInfoPath, `${sveltekitPath}/lib/params/SpecialInfoMain.json`, (err) => {
  if (err) throw err;
  console.log(`Successfully copied ${specialInfoPath} to ${sveltekitPath}/lib/params/SpecialInfoMain.json`);
});

fs.copyFile(hmlPath, `${sveltekitPath}/lib/params/hml.json`, (err) => {
  if (err) throw err;
  console.log(`Successfully copied ${hmlPath} to ${sveltekitPath}/lib/params/hml.json`);
})

return 1;
