const express = require('express')
const router = express.Router()
const { queries } = require('../database')

const TODOS_HORARIOS = [
  '09:00', '10:00', '11:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00'
]

router.get('/horarios/:data', async (req, res) => {
  try {
    const { data } = req.params
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return res.status(400).json({ erro: 'Formato de data inválido. Use YYYY-MM-DD' })
    }
    const agendados  = (await queries.getByData(data)).map(r => r.hora)
    const bloqueados = (await queries.getBloqueados(data)).map(r => r.hora)
    const ocupados   = [...new Set([...agendados, ...bloqueados])]
    const horarios   = TODOS_HORARIOS.map(hora => ({ hora, disponivel: !ocupados.includes(hora) }))
    res.json({ data, horarios })
  } catch (err) {
    console.error('Erro ao buscar horários:', err)
    res.status(500).json({ erro: 'Erro interno' })
  }
})

router.post('/agendar', async (req, res) => {
  try {
    const { nome, telefone, servico, preco, duracao, data, hora, obs } = req.body
    if (!nome || !telefone || !servico || !data || !hora) {
      return res.status(400).json({ erro: 'Campos obrigatórios faltando' })
    }
    const agendados  = (await queries.getByData(data)).map(r => r.hora)
    const bloqueados = (await queries.getBloqueados(data)).map(r => r.hora)
    if (agendados.includes(hora) || bloqueados.includes(hora)) {
      return res.status(409).json({ erro: 'Horário não está mais disponível' })
    }
    const resultado = await queries.inserir({
      nome: nome.trim(), telefone: telefone.trim(),
      servico, preco: preco || '', duracao: duracao || '',
      data, hora, obs: obs || ''
    })
    res.json({ ok: true, id: resultado.lastInsertRowid, mensagem: `Agendado! ${nome}, te esperamos dia ${data} às ${hora}.` })
  } catch (err) {
    console.error('Erro ao agendar:', err)
    res.status(500).json({ erro: 'Erro interno ao salvar agendamento' })
  }
})

router.delete('/agendar/:id', async (req, res) => {
  try {
    await queries.cancelar(req.params.id)
    res.json({ ok: true, mensagem: 'Agendamento cancelado' })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao cancelar' })
  }
})

module.exports = router
