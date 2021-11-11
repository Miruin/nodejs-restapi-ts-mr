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
exports.getdatosuser = exports.getcon = void 0;
const mssql_1 = __importDefault(require("mssql"));
const config_1 = __importDefault(require("../config/config"));
function getcon() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield mssql_1.default.connect({
                user: config_1.default.dbuser,
                password: config_1.default.dbpw,
                server: config_1.default.dbserver,
                database: config_1.default.dbdatabase,
                options: {
                    encrypt: true,
                    trustServerCertificate: true,
                    cryptoCredentialsDetails: {
                        minVersion: 'TLSv1'
                    }
                }
            });
            return pool;
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.getcon = getcon;
;
function getdatosuser(p, nickname) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield p.request()
                .input('nick', nickname)
                .query(String(config_1.default.q2));
            return result;
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.getdatosuser = getdatosuser;
