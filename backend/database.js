const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const db = new sqlite3.Database(path.join(__dirname, '..', 'agenda.db'))

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS agendamentos (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      nome       TEXT    NOT NULL,
      telefone   TEXT    NOT NULL,
      servico    TEXT    NOT NULL,
      preco      TEXT    NOT NULL,
      duracao    TEXT    NOT NULL,
      data       TEXT    NOT NULL,
      hora       TEXT    NOT NULL,
      obs        TEXT    DEFAULT '',
      status     TEXT    DEFAULT 'confirmado',
      criado_em  TEXT    DEFAULT (datetime('now', 'localtime'))
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS horarios_bloqueados (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      data   TEXT NOT NULL,
      hora   TEXT NOT NULL,
      motivo TEXT DEFAULT 'ocupado'
    )
  `)
})

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err)
      else resolve({ lastInsertRowid: this.lastID })
    })
  })
}

const queries = {
  getByData:    (data) => dbAll(`SELECT hora FROM agendamentos WHERE data = ? AND status != 'cancelado'`, [data]),
  getBloqueados:(data) => dbAll(`SELECT hora FROM horarios_bloqueados WHERE data = ?`, [data]),
  inserir:      (ag)   => dbRun(`INSERT INTO agendamentos (nome, telefone, servico, preco, duracao, data, hora, obs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [ag.nome, ag.telefone, ag.servico, ag.preco, ag.duracao, ag.data, ag.hora, ag.obs]),
  cancelar:     (id)   => dbRun(`UPDATE agendamentos SET status = 'cancelado' WHERE id = ?`, [id]),
  getHoje:      ()     => dbAll(`SELECT * FROM agendamentos WHERE data = date('now', 'localtime') AND status != 'cancelado' ORDER BY hora ASC`),
  getPorData:   (data) => dbAll(`SELECT * FROM agendamentos WHERE data = ? AND status != 'cancelado' ORDER BY hora ASC`, [data]),
  getAmanha:    ()     => dbAll(`SELECT * FROM agendamentos WHERE data = date('now', '+1 day', 'localtime') AND status = 'confirmado'`)
}

module.exports = { db, queries }
