# 💅 Nail Studio — Sistema de Agendamento

## 🚀 Como rodar

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000  
Painel: http://localhost:3000/painel

---

## 🖼️ Como adicionar imagens

Coloque as imagens dos serviços na pasta `frontend/images/` com estes nomes:

| Arquivo              | Serviço       |
|----------------------|---------------|
| `logo.png`           | Logo do salão |
| `manicure.jpg`       | Manicure      |
| `pedicure.jpg`       | Pedicure      |
| `mani-pedi.jpg`      | Mani + Pedi   |
| `gel.jpg`            | Gel/Acrílico  |
| `nailart.jpg`        | Nail Art      |

> Se a imagem não existir, aparece o emoji automaticamente.

Para usar a logo no cabeçalho, edite `frontend/index.html` e descomente a linha:
```html
<img src="images/logo.png" alt="Nail Studio">
```

---

## 📁 Estrutura

```
manicure/
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── lembretes.js
│   └── routes/
│       ├── agendamentos.js
│       └── painel.js
├── frontend/
│   ├── index.html
│   ├── painel.html
│   └── images/          ← coloque as fotos aqui
├── agenda.db            ← gerado automaticamente
└── package.json
```

---

## 🌐 Deploy no Railway

1. Suba o projeto no GitHub
2. Crie conta em [railway.app](https://railway.app)
3. Conecte o repositório e clique em Deploy
