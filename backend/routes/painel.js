const express = require('express')
const router = express.Router()
const { queries } = require('../database')

router.get('/hoje', async (req, res) => {
  try {
    const agendamentos = await queries.getHoje()
    res.json({ agendamentos, total: agendamentos.length })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar agendamentos' })
  }
})

router.get('/dia/:data', async (req, res) => {
  try {
    const agendamentos = await queries.getPorData(req.params.data)
    res.json({ agendamentos, total: agendamentos.length })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar agendamentos' })
  }
})

module.exports = router
