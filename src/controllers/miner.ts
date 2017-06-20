import {Request, Response} from "express";
import { Mongoose } from 'mongoose';
import { default as Tweet } from '../models/Tweet';
import { default as ProcessManager } from '../utils/processManager';
let processManager = ProcessManager.getInstance();

export let getTurnOn = (req: Request, res: Response) => {
    const response = processManager.startMiner();
    res.send(response);
}

export let getTurnOff = (req: Request, res: Response) => {
    const response = processManager.stopMiner();
    res.send(response);
}