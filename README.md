full# Heston Auth Starter (MERN)
- Backend: Express, MongoDB, express-session (no localStorage)
- Frontend: React (Create React App), react-router
- DVLA lookup integrated on Staff Dashboard

## Quick Start
### Backend
```bash
cd backend
cp .env.example .env
# set MONGO_URI and SESSION_SECRET; CLIENT_ORIGIN default http://localhost:3000
npm install
npm run dev
```
Seeds default admin: **admin / 1234**

### Frontend
```bash
cd ../frontend
npm install
# echo REACT_APP_API_BASE=http://localhost:5000 > .env  # if needed
npm start
```

Open http://localhost:3000
#
