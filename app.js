const express = require("express");

const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

//initializing Database and Server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

initializeDBAndServer();

//Get List of States API
app.get("/states/", async (req, res) => {
  const getStatesQuery = `
        SELECT 
          * 
        FROM 
          state;
    `;

  const dbResponse = await db.all(getStatesQuery);

  const stateDetails = dbResponse.map((obj) => {
    return {
      stateId: obj.state_id,
      stateName: obj.state_name,
      population: obj.population,
    };
  });
  res.send(stateDetails);
});

//Get State details API
app.get("/states/:stateId/", async (req, res) => {
  const { stateId } = req.params;
  const getStateDetailsQuery = `
        SELECT 
          * 
        FROM 
          state 
        WHERE 
          state_id = ${stateId};
    `;

  const dbResponse = await db.get(getStateDetailsQuery);
  const stateDetails = [dbResponse].map((obj) => {
    return {
      stateId: obj.state_id,
      stateName: obj.state_name,
      population: obj.population,
    };
  });
  res.send(...stateDetails);
});

//ADD District Details API
app.post("/districts/", async (req, res) => {
  const districtDetails = req.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictDetailsQuery = `
        INSERT INTO 
          district(district_name, state_id, cases, cured, active, deaths)
        VALUES (
              '${districtName}',
               ${stateId},
               ${cases},
               ${cured},
               ${active},
               ${deaths}
        );
    `;
  const dbResponse = await db.run(addDistrictDetailsQuery);
  const districtId = dbResponse.lastID;
  res.send("District Successfully Added");
  //console.log(districtId);
});

//Get District Details API
app.get("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const getDistrictDetailsQuery = `
        SELECT 
          * 
        FROM 
          district
        WHERE 
          district_id = ${districtId};
    `;

  const dbResponse = await db.get(getDistrictDetailsQuery);
  const districtDetails = [dbResponse].map((obj) => {
    return {
      districtId: obj.district_id,
      districtName: obj.district_name,
      stateId: obj.stateId,
      cured: obj.cured,
      active: obj.active,
      deaths: obj.deaths,
    };
  });
  res.send(...districtDetails);
});

//Delete district details API
app.delete("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const deleteDistrictDetailsQuery = `
        DELETE FROM 
          district 
        WHERE 
          district_id = ${districtId};
    `;

  const dbResponse = await db.run(deleteDistrictDetailsQuery);
  res.send("District Removed");
});
