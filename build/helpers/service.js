"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.creartoken = void 0;
const jwt_simple_1 = __importDefault(require("jwt-simple"));
const moment_1 = __importDefault(require("moment"));
const config_1 = __importDefault(require("../config/config"));
const creartoken = (usuario) => {
    const payload = {
        sub: usuario,
        iat: (0, moment_1.default)().unix(),
        exp: (0, moment_1.default)().add(1, 'days').unix()
    };
    return jwt_simple_1.default.encode(payload, String(config_1.default.secrettoken));
};
exports.creartoken = creartoken;
//middleware
const auth = (req, res, next) => {
    try {
        let { nick } = req.body;
        if (!req.headers.authorization) {
            return res.status(403).send({ msg: 'No tienes autorizacion' });
        }
        const token = req.headers.authorization.split(" ")[1];
        const payload = jwt_simple_1.default.decode(token, String(config_1.default.secrettoken));
        if (payload.exp <= (0, moment_1.default)().unix()) {
            return res.status(401).send({ msg: 'El token ha expirado' });
        }
        req.user = payload.sub;
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ msg: 'Error en el servidor' });
    }
};
exports.auth = auth;
