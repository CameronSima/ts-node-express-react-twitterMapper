import {Request, Response} from "express";
import { default as Tweet } from '../models/Tweet';
import { default as ConsoleResponse } from '../utils/consoleResponse';
import MapService from '../services/mapService';
import ConsoleService from '../services/consoleService';
import * as async from 'async';

const mapServices = new MapService
const consoleService = new ConsoleService

// Get all geo-coded tweets
export let getAll = async (req: Request, res: Response) => {
    let data = await mapServices.getData();
    res.json(data);
}

// get console data
export let getConsole = async (req: Request, res: Response) => {
    consoleService.getConsole((data: Array<JSON>) => {
        console.log(data)
        res.json(data);
    });
}

// return the mapbox access token from this endpoint so the frontend 
// doesn't have to store it

export let getMapBoxToken = (req: Request, res: Response) => {
    res.json(process.env.MAPBOX_ACCESS_TOKEN);
}
