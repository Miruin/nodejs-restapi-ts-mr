import { Request, Response } from 'express';
import jwt from 'jwt-simple';
import moment from 'moment';
import config from '../config/config'


export const creartoken = (usuario: String) => {

    const payload = {
        sub: usuario,
        iat: moment().unix(),
        exp: moment().add(1, 'days').unix()
    }

    return jwt.encode(payload, String(config.secrettoken))

}

//middleware

export const auth = (req: Request, res: Response, next: any) =>{

    try {
    
        let { nick } = req.body
    
        if (!req.headers.authorization) {

            return res.status(403).send({ msg: 'No tienes autorizacion'})
        
        } 

        const token = req.headers.authorization.split(" ")[1]
        const payload = jwt.decode(token,  String(config.secrettoken))

        if (payload.exp <= moment().unix()) {

            return res.status(401).send({ msg: 'El token ha expirado'})
            
        }
    
        req.user = payload.sub
        next()
        
    } catch (error) {

        console.error(error);
        return res.status(500).send({ msg: 'Error en el servidor'})
        
        
    }    
}

