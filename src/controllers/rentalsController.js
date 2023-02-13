import { db } from "../database/database.connection.js";

async function insertRental(req, res) {
  const { customerId, gameId, daysRented } = res.locals.rental;

  const data = new Date();

  const zeroFill = (n) => {
    return n < 9 ? `0${n}` : `${n}`;
  };
  const formatDate = (date) => {
    const d = zeroFill(date.getDate());
    const mo = zeroFill(date.getMonth() + 1);
    const y = zeroFill(date.getFullYear());

    return `${y}-${mo}-${d}`;
  };

  const rentedDate = formatDate(data);

  try {
    const getGamePrice = await db.query(
      `SELECT "pricePerDay" FROM games WHERE id = $1`,
      [gameId]
    );
    const dailyPrice = getGamePrice.rows[0].pricePerDay;
    const originalPrice = daysRented * dailyPrice;

    const rental = await db.query(
      `INSERT INTO rentals ("customerId", "gameId", "daysRented", "rentDate", "originalPrice") VALUES ($1, $2, $3, $4, $5)`,
      [customerId, gameId, daysRented, rentedDate, originalPrice]
    );

    return res.sendStatus(201);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function getRental(req, res) {
  try {
    const result = await db.query(`
      SELECT 
        rentals.id,
        rentals."customerId",
        rentals."gameId",
        rentals."rentDate",
        rentals."daysRented",
        rentals."returnDate",
        rentals."originalPrice",
        rentals."delayFee",
        customers.id AS "customer.id",
        customers.name AS "customer.name",
        games.id AS "game.id",
        games.name AS "game.name"
      FROM rentals
      INNER JOIN customers ON rentals."customerId" = customers.id
      INNER JOIN games ON rentals."gameId" = games.id
    `);

    const rentals = result.rows.map((r) => {
      return {
        id: r.id,
        customerId: r.customerId,
        gameId: r.gameId,
        rentDate: r.rentDate,
        daysRented: r.daysRented,
        returnDate: r.returnDate,
        originalPrice: r.originalPrice,
        delayFee: r.delayFee,
        customer: {
          id: r["customer.id"],
          name: r["customer.name"],
        },
        game: {
          id: r["game.id"],
          name: r["game.name"],
        },
      };
    });

    return res.send(rentals);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}

async function updateRental(req, res) {}
async function deleteRental(req, res) {
  const { id } = res.locals.rental;

  try {
    const deleteRental = await db.query("DELETE FROM rentals WHERE id = $1", [
      id,
    ]);

    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export { insertRental, getRental, updateRental, deleteRental };
