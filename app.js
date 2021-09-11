const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayerDetailsQuery = `
    SELECT *
    FROM cricket_team;`;
  const playersArray = await db.all(getPlayerDetailsQuery);
  response.send(playersArray);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  console.log(playerDetails);
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerDetailsQuery = `
  INSERT INTO
    cricket_team(playerName,jerseyNumber,role)
  VALUES
    (${playerName},${jerseyNumber},${role});`;
  const dbResponse = await db.run(addPlayerDetailsQuery);
  const playerId = dbResponse.lastId;
  response.send(dbResponse);
});
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `
    SELECT
     *
    FROM
     cricket_team
    WHERE
      player_id = ${playerId};`;
  const playersArray = await db.all(getPlayerDetailsQuery);
  response.send(playersArray);
});
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayersQuery = `
    UPDATE
      cricket_team
    SET
      playerName = ${playerName},
      jerseyNumber = ${jerseyNumber},
      role = ${role}
    WHERE
      player_id = ${playerId};`;
  await db.run(updatePlayersQuery);
  response.send("Book Updated Successfully");
});
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Book Deleted Successfully");
});

module.exports = app;
