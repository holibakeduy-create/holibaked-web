// netlify/functions/create-preference.js
//
// Esta función corre en el servidor de Netlify, nunca en el navegador del
// cliente. Por eso es el lugar seguro para usar el Access Token de Mercado
// Pago: tiene que estar configurado como variable de entorno MP_ACCESS_TOKEN
// en Netlify (Site settings → Environment variables), nunca escrito acá.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Mercado Pago todavía no está configurado (falta MP_ACCESS_TOKEN).' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido.' }) };
  }

  const { items, payer, externalReference } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'El carrito está vacío.' }) };
  }

  const origin = event.headers.origin || `https://${event.headers.host}`;

  const preference = {
    items: items.map((it) => ({
      title: String(it.label || 'Producto Holi Baked').slice(0, 250),
      quantity: Math.max(1, Number(it.qty) || 1),
      unit_price: Number(it.unitPrice) || 0,
      currency_id: 'UYU',
    })),
    payer: {
      name: payer?.name || undefined,
      phone: payer?.phone?.number ? { number: payer.phone.number } : undefined,
    },
    back_urls: {
      success: `${origin}/gracias.html`,
      failure: `${origin}/index.html`,
      pending: `${origin}/gracias.html`,
    },
    auto_return: 'approved',
    external_reference: (externalReference || '').slice(0, 250),
    statement_descriptor: 'HOLI BAKED',
  };

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await mpRes.json();

    if (!mpRes.ok) {
      console.error('Mercado Pago error:', data);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'Mercado Pago rechazó la preferencia.', details: data }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ init_point: data.init_point }),
    };
  } catch (err) {
    console.error('Error inesperado:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Error inesperado generando el pago.' }) };
  }
};s23
