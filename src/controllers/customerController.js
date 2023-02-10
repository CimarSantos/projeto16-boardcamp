import { db } from "../database/database.connection.js";

async function insertCustomer(req, res) {
  const { name, phone, cpf, birthday } = req.body;

  try {
    const { rowCount } = await db.query(
      `INSERT INTO customers (name, phone, cpf, birthday) 
      SELECT $1, $2, $3, $4 WHERE NOT EXISTS (SELECT * FROM customers WHERE cpf = $5);`,
      [name, phone, cpf, birthday, cpf]
    );
    if (rowCount === 1) return res.sendStatus(201);
    else return res.status(409).send("CPF já cadastrado, tente outro.");
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

async function getCustomers(_, res) {
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

  const createData = formatDate(data);

  try {
    const customers = await db.query("SELECT * FROM customers");
    const formmattedCustomers = customers.rows.map((customer) => {
      const birthday = formatDate(new Date(customer.birthday));
      return { ...customer, birthday: birthday };
    });

    res.send(formmattedCustomers);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

async function getCustomersById(req, res) {
  const { id } = req.params;
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

  const createData = formatDate(data);

  try {
    const customers = await db.query("SELECT * FROM customers WHERE id = $1", [
      id,
    ]);
    const formmattedCustomers = customers.rows.map((customer) => {
      const birthday = formatDate(new Date(customer.birthday));
      return { ...customer, birthday: birthday };
    });

    if (!customers.rows.length)
      return res.status(404).send("Este usuário não existe.");

    res.send(formmattedCustomers);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export { insertCustomer, getCustomers, getCustomersById };
