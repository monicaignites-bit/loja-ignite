export async function onRequestPost(context) {
  const { request } = context;

  try {
    const data = await request.json();
    const { itens, cliente } = data;

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

    // ========================================================
    // COLOQUE SUA CHAVE PRIVADA AQUI (SEM ESPAÇOS)
    const PUBLIC_KEY = "mateusriapo_mjkr1lmku8q6wn7q".trim();
    const SECRET_KEY = "j2nu6rerxdv53n6c76s3u02qxo20w461fe29pehr563c41ky51i9rhcpsi1kiaio".trim(); 
    // ========================================================

    // Logs de segurança para debug
    console.log("--- INICIANDO PAGAMENT1O (Pages Function) ---");
    console.log("Tamanho da Public Key:", PUBLIC_KEY.length, "caracteres");
    console.log("Tamanho da Secret Key:", SECRET_KEY.length, "caracteres");

    let rawPhone = cliente.telefone.replace(/\D/g, '');
    const formattedPhone = rawPhone.startsWith('55') ? `+${rawPhone}` : `+55${rawPhone}`;

    const response = await fetch("https://app.sigilopay.com.br/api/v1/gateway/checkout", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-public-key': PUBLIC_KEY,
        'x-secret-key': SECRET_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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
        settings: {
          askForAddress: false
        },
        customer: {
          name: cliente.nome,
          email: cliente.email || 'cliente@email.com',
          phone: formattedPhone
        },
        trackProps: {
          orderId: pedidoId
        }
      })
    });

    const textResponse = await response.text();
    console.log("Status retornado pela SigiloPay:", response.status);

    if (!response.ok) {
      return new Response(JSON.stringify({ 
        error: `Erro ${response.status} da SigiloPay: ${textResponse}` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const json = JSON.parse(textResponse);
    return new Response(JSON.stringify({ url: json.checkoutUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log("Erro no Servidor:", error.message);
    return new Response(JSON.stringify({ error: 'Erro no Servidor: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}