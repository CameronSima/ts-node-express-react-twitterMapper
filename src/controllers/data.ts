import {Request, Response} from "express";
import { default as Tweet } from '../models/Tweet';
import { default as ConsoleResponse } from '../utils/consoleResponse';
import MapService from '../services/mapService';
import ConsoleService from '../services/consoleService';
import * as async from 'async';

const mapServices = new MapService
const consoleService = new ConsoleService

export let getAll = async (req: Request, res: Response) => {
    let data = await mapServices.getData();
    res.json(data);
}


export let getConsole = async (req: Request, res: Response) => {
    consoleService.getConsole((data: Array<JSON>) => {
        console.log(data)
        res.json(data);
    });
}
