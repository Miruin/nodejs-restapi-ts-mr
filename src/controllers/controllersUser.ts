import { Request, response, Response} from 'express';
import sql, { Connection, ConnectionPool, IResult } from 'mssql'
import bcryptjs from 'bcryptjs';
import { creartoken } from "../helpers/service";
import config from "../config/config";
import { getcon, getdatosuser } from '../database/connection'



class Controllersuser {
    constructor() {
        
    }

    
    async reguser (req: Request, res: Response): Promise<any>{
       
        try {

            const pool = await getcon()

            if (!pool)  return res.status(500).send({msg: 'Error del servidor'})
               
            let { nick, email, contrasena, na, fn} = req.body;
            
            if(nick == null || email == null || contrasena == null || na == null || fn == null) {
    
                return res.status(400).json({ msg : 'No se han llenado los valores correctamente'});
    
            } else {

                const result = await getdatosuser(pool, nick);

                if (!result)  return res.status(500).send({msg: 'Error del servidor'})

                if (result.recordset[0]) { 
                        
                    pool.close();
                    return res.status(400).send({msg: 'Ya se esta usando este usuario'});

                } else {
    
                    let rondas = 10;
                    let pwh = await bcryptjs.hash(contrasena,rondas);
                    await pool.request()
                    .input('nick', sql.VarChar, nick)
                    .input('email', sql.VarChar, email)
                    .input('pw', sql.VarChar, pwh)
                    .input('na', sql.VarChar, na)
                    .input('fn', sql.VarChar, fn)
                    .query(String(config.q1));
                    pool.close();
                    return res.status(200).send({msg: 'Se ha registrado satisfactoriamente'});
                    
                    
                }
            }
    
        
    
        } catch(e) {
            console.error(e);
            return res.status(500).send({msg: 'Error en el servidor'})
        }
    }
    
    
    async login(req: Request, res: Response): Promise<any> {
    
    
        try {
    
            const pool = await getcon();

            if (!pool)  return res.status(500).send({msg: 'Error del servidor'})
    
            let { nick, contrasena} = req.body;
    
            if (nick == null || contrasena == null) {
    
                return res.status(400).send({ msg : 'No se han llenado los valores correctamente'});
                
            } else {
                
                const result = await getdatosuser(pool, nick)
    
                if (!result)  return res.status(500).send({msg: 'Error del servidor'})
    
                if (result.recordset[0]) {
    
                    const pwv = await bcryptjs.compare(contrasena, result.recordset[0].pw_usuario)
    
                    if (pwv) {
    
                        pool.close()
    
                        return res.status(200).send({token: creartoken(nick), msg: 'Se ha iniciado secion satisfactoriamente', nickname: nick});
                        
                    } else {
                        pool.close();
                        return res.status(200).send({msg: 'La contrasena no coincide'});
                    }
    
                } else {
                    pool.close();
                    return res.status(200).send({msg: 'No se ha encontrado el usuario'});
                }
    
                
    
            }
            
        } catch (error) {
            
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'})
    
        }
    
    }
    
    async datosuser(req: Request, res: Response): Promise<any> {
    
        try {
    
            const pool = await getcon();
            if (!pool)  return res.status(500).send({msg: 'Error del servidor'})

            const result = await getdatosuser(pool, String(req.user));

            if (!result)  return res.status(500).send({msg: 'Error del servidor'})
    
            let nick = result.recordset[0].nick_usuario;
            let email = result.recordset[0].email_usuario;
            let na = result.recordset[0].na_usuario;
            let fn = result.recordset[0].fn_usuario;
    
            pool.close();
            
            return res.status(200).send({nick, email, na, fn});
            
        } catch (error) {
    
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'})
            
        }
    }
    
    async moduser(req: Request, res: Response): Promise<any> {
    
        try {
    
            let { nick, email, na, fn} = req.body
    
            const pool = await getcon()

            if (!pool)  return res.status(500).send({msg: 'Error del servidor'})

            const result1 = await getdatosuser(pool, String(req.user));

            if (!result1)  return res.status(500).send({msg: 'Error del servidor'})
    
            if (nick == result1.recordset[0].nick_usuario && email == result1.recordset[0].email_usuario &&
                na == result1.recordset[0].na_usuario && fn == result1.recordset[0].fn_usuario) {
    
                    return res.status(200).send({msg: 'No se ha cambiado ningun valor...'})
                
            } else {
    
                const result2 = await getdatosuser(pool, nick);

                if (!result2)  return res.status(500).send({msg: 'Error del servidor'})
                
                if (result2.recordset[0]) {
    
    
                    await pool.request()
                    .input('email', sql.VarChar, email)
                    .input('na', sql.VarChar, na)
                    .input('fn', sql.VarChar, fn)
                    .input('nickname', req.user)
                    .query(String(config.q5));
                    pool.close();
    
                    return res.status(200).send({msg: 'Se ha actualizado satisfactoriamente'});
                } else {
    
                    await pool.request()
                    .input('nick', sql.VarChar, nick)
                    .input('email', sql.VarChar, email)
                    .input('na', sql.VarChar, na)
                    .input('fn', sql.VarChar, fn)
                    .input('nickname', req.user)
                    .query(String(config.q4));
                    pool.close
    
                    return res.status(200).send({token: creartoken(nick), msg: 'Se ha actualizado satisfactoriamente'})
                    
                }
    
                
            }
            
        } catch (error) {
    
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'})
            
        }
    }
    
    
    async logout(req: Request, res: Response): Promise<any> {

        try {

            const pool = await getcon();

            if (!pool)  return res.status(500).send({msg: 'Error del servidor'})

            const result = await getdatosuser(pool, String(req.user));

            if (!result)  return res.status(500).send({msg: 'Error del servidor'})
        
            if (result.recordset[0]) {
        
                return res.status(200).send({msg: 'Tienes permiso para deslogearte'})
        
            } else {
        
                return res.status(500).send({msg: 'No se encuentra este usuario en la DB'})
        
            }
            
        } catch (error) {

            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'})
            
        }
        
    }
    
    async deluser(req: Request, res: Response): Promise<any> {
    
        try {
    
            const pool = await getcon();

            if (!pool)  return res.status(500).send({msg: 'Error del servidor'})

            const result = await getdatosuser(pool, String(req.user));

            if (!result)  return res.status(500).send({msg: 'Error del servidor'})
    
            if (result.recordset[0]) {
    
                await pool.request()
                .input('nick', req.user)
                .query(String(config.q6))
                pool.close()
            
                return res.status(200).send({msg: 'El usuario se ha eliminado'})
            } else {
    
                pool.close()
                return res.status(400).send({msg: 'No se encontro el usuario'})
            }
            
        } catch (error) {
    
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'})
            
        }
    
    }
}


const cu = new Controllersuser()

export default cu