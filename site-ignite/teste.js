const PUBLIC_KEY = "mateusriapo_14yybj11ksm13dxh";
const SECRET_KEY = "z4rm9jg1hhsik9k0b79bcpgaq2wdszv84rk0w4o6qt7s5zir5dicvlrb98eg20je"; // <-- COLE A CHAVE j2nu6 AQUI

fetch("https://app.sigilopay.com.br/api/v1/gateway/checkout", {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-public-key': PUBLIC_KEY,
    'x-secret-key': SECRET_KEY
  },
  body: JSON.stringify({
    product: {
      name: "Teste",
      externalId: "123",
      offer: { name: "Oferta", offerType: "NATIONAL", price: 10.00 },
      price: 10.00,
      quantity: 1
    },
    settings: { askForAddress: false }
  })
})
.then(async res => {
  const text = await res.text();
  console.log("Status retornado pela SigiloPay:", res.status);
  console.log("Resposta:", text);
})
.catch(err => console.error("Erro:", err));