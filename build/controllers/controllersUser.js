"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mssql_1 = __importDefault(require("mssql"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const service_1 = require("../helpers/service");
const config_1 = __importDefault(require("../config/config"));
const connection_1 = require("../database/connection");
class Controllersuser {
    constructor() {
    }
    reguser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pool = yield (0, connection_1.getcon)();
                if (!pool)
                    return res.status(500).send({ msg: 'Error del servidor' });
                let { nick, email, contrasena, na, fn } = req.body;
                if (nick == null || email == null || contrasena == null || na == null || fn == null) {
                    return res.status(400).json({ msg: 'No se han llenado los valores correctamente' });
                }
                else {
                    const result = yield (0, connection_1.getdatosuser)(pool, nick);
                    if (!result)
                        return res.status(500).send({ msg: 'Error del servidor' });
                    if (result.recordset[0]) {
                        pool.close();
                        return res.status(400).send({ msg: 'Ya se esta usando este usuario' });
                    }
                    else {
                        let rondas = 10;
                        let pwh = yield bcryptjs_1.default.hash(contrasena, rondas);
                        yield pool.request()
                            .input('nick', mssql_1.default.VarChar, nick)
                            .input('email', mssql_1.default.VarChar, email)
                            .input('pw', mssql_1.default.VarChar, pwh)
                            .input('na', mssql_1.default.VarChar, na)
                            .input('fn', mssql_1.default.VarChar, fn)
                            .query(String(config_1.default.q1));
                        pool.close();
                        return res.status(200).send({ msg: 'Se ha registrado satisfactoriamente' });
                    }
                }
            }
            catch (e) {
                console.error(e);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pool = yield (0, connection_1.getcon)();
                if (!pool)
                    return res.status(500).send({ msg: 'Error del servidor' });
                let { nick, contrasena } = req.body;
                if (nick == null || contrasena == null) {
                    return res.status(400).send({ msg: 'No se han llenado los valores correctamente' });
                }
                else {
                    const result = yield (0, connection_1.getdatosuser)(pool, nick);
                    if (!result)
                        return res.status(500).send({ msg: 'Error del servidor' });
                    if (result.recordset[0]) {
                        const pwv = yield bcryptjs_1.default.compare(contrasena, result.recordset[0].pw_usuario);
                        if (pwv) {
                            pool.close();
                            return res.status(200).send({ token: (0, service_1.creartoken)(nick), msg: 'Se ha iniciado secion satisfactoriamente', nickname: nick });
                        }
                        else {
                            pool.close();
                            return res.status(200).send({ msg: 'La contrasena no coincide' });
                        }
                    }
                    else {
                        pool.close();
                        return res.status(200).send({ msg: 'No se ha encontrado el usuario' });
                    }
                }
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    datosuser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pool = yield (0, connection_1.getcon)();
                if (!pool)
                    return res.status(500).send({ msg: 'Error del servidor' });
                const result = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                if (!result)
                    return res.status(500).send({ msg: 'Error del servidor' });
                let nick = result.recordset[0].nick_usuario;
                let email = result.recordset[0].email_usuario;
                let na = result.recordset[0].na_usuario;
                let fn = result.recordset[0].fn_usuario;
                pool.close();
                return res.status(200).send({ nick, email, na, fn });
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    moduser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { nick, email, na, fn } = req.body;
                const pool = yield (0, connection_1.getcon)();
                if (!pool)
                    return res.status(500).send({ msg: 'Error del servidor' });
                const result1 = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                if (!result1)
                    return res.status(500).send({ msg: 'Error del servidor' });
                if (nick == result1.recordset[0].nick_usuario && email == result1.recordset[0].email_usuario &&
                    na == result1.recordset[0].na_usuario && fn == result1.recordset[0].fn_usuario) {
                    return res.status(200).send({ msg: 'No se ha cambiado ningun valor...' });
                }
                else {
                    const result2 = yield (0, connection_1.getdatosuser)(pool, nick);
                    if (!result2)
                        return res.status(500).send({ msg: 'Error del servidor' });
                    if (result2.recordset[0]) {
                        yield pool.request()
                            .input('email', mssql_1.default.VarChar, email)
                            .input('na', mssql_1.default.VarChar, na)
                            .input('fn', mssql_1.default.VarChar, fn)
                            .input('nickname', req.user)
                            .query(String(config_1.default.q5));
                        pool.close();
                        return res.status(200).send({ msg: 'Se ha actualizado satisfactoriamente' });
                    }
                    else {
                        yield pool.request()
                            .input('nick', mssql_1.default.VarChar, nick)
                            .input('email', mssql_1.default.VarChar, email)
                            .input('na', mssql_1.default.VarChar, na)
                            .input('fn', mssql_1.default.VarChar, fn)
                            .input('nickname', req.user)
                            .query(String(config_1.default.q4));
                        pool.close;
                        return res.status(200).send({ token: (0, service_1.creartoken)(nick), msg: 'Se ha actualizado satisfactoriamente' });
                    }
                }
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pool = yield (0, connection_1.getcon)();
                if (!pool)
                    return res.status(500).send({ msg: 'Error del servidor' });
                const result = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                if (!result)
                    return res.status(500).send({ msg: 'Error del servidor' });
                if (result.recordset[0]) {
                    return res.status(200).send({ msg: 'Tienes permiso para deslogearte' });
                }
                else {
                    return res.status(500).send({ msg: 'No se encuentra este usuario en la DB' });
                }
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    deluser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pool = yield (0, connection_1.getcon)();
                if (!pool)
                    return res.status(500).send({ msg: 'Error del servidor' });
                const result = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                if (!result)
                    return res.status(500).send({ msg: 'Error del servidor' });
                if (result.recordset[0]) {
                    yield pool.request()
                        .input('nick', req.user)
                        .query(String(config_1.default.q6));
                    pool.close();
                    return res.status(200).send({ msg: 'El usuario se ha eliminado' });
                }
                else {
                    pool.close();
                    return res.status(400).send({ msg: 'No se encontro el usuario' });
                }
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
}
const cu = new Controllersuser();
exports.default = cu;
