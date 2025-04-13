
import express from 'express';
import cors from 'cors';
import mercadopago from 'mercadopago';

const app = express();
app.use(express.json());

app.use(cors({ origin: 'https://404wear.vercel.app' }));

mercadopago.configure({
  access_token: 'APP_USR-8816027706096437-040807-875f959ba9a1cb82e85a58f1113e243b-450373505',
});

const productosDisponibles = [
  { nombre: "Camperón 404 Black", precio: 25000 },
  { nombre: "Camperón Tech White", precio: 25000 },
  { nombre: "Campera Gray Noise", precio: 25000 },
  { nombre: "Campera Shadow Mode", precio: 25000 },
  { nombre: "Buzo White Base", precio: 13500 },
  { nombre: "Buzo Static", precio: 13500 },
  { nombre: "Remera Sent", precio: 15000 },
  { nombre: "Remera Skyline", precio: 15000 },
  { nombre: "Remera Emily Rose", precio: 15000 },
  { nombre: "Remera Antonio", precio: 15000 },
  { nombre: "Conjunto Gray Noise", precio: 25000 },
  { nombre: "Conjunto Shadow Mode", precio: 25000 },
  { nombre: "Pantalón Gray Noise", precio: 13500 },
  { nombre: "Pantalón Shadow Mode", precio: 13500 }
];

app.post('/create_preference', (req, res) => {
  try {
    const { items } = req.body;

    const productosValidados = items.map((item) => {
      const productoReal = productosDisponibles.find(p => p.nombre === item.nombre);
      if (!productoReal || productoReal.precio !== item.precio) {
        throw new Error(`Producto inválido o modificado: ${item.nombre}`);
      }
      return {
        title: item.nombre,
        unit_price: productoReal.precio,
        quantity: item.cantidad,
        currency_id: 'ARS'
      };
    });

    const preference = {
      items: productosValidados,
      back_urls: {
        success: "https://404wear.vercel.app?status=approved",
        failure: "https://404wear.vercel.app?status=failed",
      },
      auto_return: "approved",
    };

    mercadopago.preferences
      .create(preference)
      .then((response) => res.json({ id: response.body.id }))
      .catch((err) => {
        console.error("Mercado Pago error:", err);
        res.status(500).json({ error: "Error al crear preferencia" });
      });

  } catch (err) {
    console.error("Error al validar productos:", err);
    res.status(400).json({ error: err.message || "Datos inválidos" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor 404wear backend corriendo en puerto ${PORT}`));
