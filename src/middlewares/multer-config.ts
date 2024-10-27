import express, {Request, Response, NextFunction, application} from 'express'
import multer from 'multer';


const imageStorage = multer.diskStorage({

     destination: (req, file, cb) => {
          cb(null, 'images');
     },
     filename: (req, file, cb) => {
          cb(null, new Date().toISOString().replace(/:/g, '-') + '_' + file.originalname)
     }
})

export const Images = multer({ storage: imageStorage }).array('images', 10)
