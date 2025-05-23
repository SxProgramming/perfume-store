const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Ajustar ruta si .env está en la raíz del proyecto

const appRoutes = require('./routes/appRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de CORS más específica (ajusta FRONTEND_URL en .env)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://127.0.0.1:5500', // Permite solo tu frontend
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', appRoutes);

app.get('/', (req, res) => {
    res.send('<h1>✨ Aura Perfumería Backend API ✨</h1><p>API lista y funcionando.</p>');
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server está brillando en http://localhost:${PORT}`);
    console.log(`🔧 Frontend esperado en: ${process.env.FRONTEND_URL}`);
    console.log(`📦 API disponible en: ${process.env.API_BASE_URL || `http://localhost:${PORT}/api`}`);
});