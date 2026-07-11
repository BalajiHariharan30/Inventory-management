import cors from 'cors';
import express, { Application } from 'express';
import morgan from 'morgan';
import rootRouter from './routes';
import notFound from './middlewares/notFound';
import globalErrorHandler from './middlewares/globalErrorhandler';

const app: Application = express();

app.use(express.json());
app.use(morgan('dev'));

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

import fs from 'fs';
import path from 'path';

// application routes
app.use('/api/v1', rootRouter);

// Serve static files from the React frontend build
const frontendBuildPath = fs.existsSync(path.join(__dirname, './frontend-dist'))
  ? path.join(__dirname, './frontend-dist')
  : path.join(__dirname, '../dist/frontend-dist');

console.log('🔍 DEBUG: __dirname is', __dirname);
console.log('🔍 DEBUG: frontendBuildPath is', frontendBuildPath);
console.log('🔍 DEBUG: frontendBuildPath exists?', fs.existsSync(frontendBuildPath));
try {
  if (fs.existsSync(frontendBuildPath)) {
    console.log('🔍 DEBUG: files in frontendBuildPath:', fs.readdirSync(frontendBuildPath));
  } else {
    console.log('🔍 DEBUG: files in parent directory:', fs.readdirSync(path.join(__dirname, '..')));
    console.log('🔍 DEBUG: files in backend directory:', fs.readdirSync(path.join(__dirname, '../..')));
  }
} catch (e: any) {
  console.log('🔍 DEBUG: failed to read directory:', e.message);
}

app.use(express.static(frontendBuildPath));

// Fallback all other routes to React router index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
