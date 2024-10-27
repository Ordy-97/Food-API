// const express = require('express');
import express, { Application }  from "express";
import { AdminRoute, CustomerRoute, DeliveryRoute, VandorRoute } from "../routes";
import path from 'path';
import { ShoppingRoute } from "../routes/ShoppingRoute";


export default async (app: Application) => {
    
    app.use(express.json());
    app.use(express.urlencoded({ extended : true}))
    
    app.use('/images', express.static(path.join(__dirname, '../images')))
    
    app.use('/admin', AdminRoute);
    app.use('/vandor', VandorRoute);

    app.use('/customer', CustomerRoute);

    app.use('/delivery', DeliveryRoute);

    app.use(ShoppingRoute);
    return app;
}


