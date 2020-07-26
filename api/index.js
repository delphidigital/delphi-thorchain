import express from 'express';
import fs from 'fs';

const app = express();

function stubJSON(id) {
  const rawdata = fs.readFileSync(`./stubs/${id}.json`);
  return JSON.parse(rawdata);
}

app.all('/v1/pools', (req, res) => {
  res.json(stubJSON('pools'));
});

app.all('/v1/pools/detail', (req, res) => {
  res.json(stubJSON(`pools-${req.query.asset}`));
});

app.all('/v1/stats', (req, res) => {
  res.json(stubJSON('stats'));
});

app.all('/thorchain/nodeaccounts', (req, res) => {
  res.json(stubJSON('nodeAccounts'));
});

module.exports = {
  handler: app,
};
