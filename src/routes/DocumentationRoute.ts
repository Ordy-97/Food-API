import express, {Request, Response, NextFunction} from 'express'
import path from 'path'

const router = express.Router();

// Route pour servir la documentation
router.get('/', (req: Request, res: Response) => {
    const documentationPath = path.resolve(__dirname, '../utility/documentation.html'); // Chemin vers le fichier dans `utility`
    console.log('Serving documentation from:', documentationPath); // Log pour vérifier le chemin
    res.sendFile(documentationPath, (err) => {
      if (err) {
        console.error('Error sending file:', err.message);
        res.status(500).send('Unable to load the documentation file.');
      }
    });
  });

export {router as DocRoute}