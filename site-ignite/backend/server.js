const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/criar-checkout', async (req, res) => {
  try {
    const { itens, cliente } = req.body;

    const PRODUTOS = {
      1: { name: 'Ignite V300', price: 13818 },
      2: { name: 'Ignite V400', price: 15510 },
      3: { name: 'Ignite V500', price: 15228 },
      4: { name: 'Elfbar TRIO 40K', price: 13900 },
      5: { name: 'Lost Vape Thelema Solo', price: 46900 },
      6: { name: 'Life Pod PR Eco 8000', price: 5443 }
    };
    const FRETE = 3000;

    let totalCentavos = FRETE;
    itens.forEach(item => {
      if (PRODUTOS[item.originalId]) {
        totalCentavos += PRODUTOS[item.originalId].price * item.qty;
      }
    });

    const totalReais = totalCentavos / 100;
    const pedidoId = 'PEDIDO-' + Date.now();

    // SUAS CHAVES AQUI
    const PUBLIC_KEY = "mateusriapo_mjkr1lmku8q6wn7q";
    const SECRET_KEY = "j2nu6rerxdv53n6c76s3u02qxo20w461fe29pehr563c41ky51i9rhcpsi1kiaio"; 

    let rawPhone = cliente.telefone.replace(/\D/g, '');
    const formattedPhone = rawPhone.startsWith('55') ? `+${rawPhone}` : `+55${rawPhone}`;

    const response = await fetch("https://app.sigilopay.com.br/api/v1/gateway/checkout", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': PUBLIC_KEY,
        'x-secret-key': SECRET_KEY
      },
      body: JSON.stringify({
        product: {
          name: `Pedido #${pedidoId} - Ignite`,
          externalId: pedidoId,
          offer: {
            name: `Oferta Pedido #${pedidoId}`,
            offerType: "NATIONAL",
            price: totalReais
          },
          price: totalReais,
          quantity: 1
        },
        settings: { askForAddress: false },
        customer: {
          name: cliente.nome,
          email: cliente.email || 'cliente@email.com',
          phone: formattedPhone
        },
        trackProps: { orderId: pedidoId }
      })
    });

    const textResponse = await response.text();
    console.log("Status SigiloPay:", response.status);

    if (!response.ok) {
      return res.status(400).json({ error: `Erro ${response.status}: ${textResponse}` });
    }

    const json = JSON.parse(textResponse);
    return res.status(200).json({ url: json.checkoutUrl });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));