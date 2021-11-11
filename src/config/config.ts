import {config} from 'dotenv';
config();

export default{

    port: process.env.PORT || 3000,
    dbuser: process.env.DB_USER || '',
    dbpw: process.env.DB_PW || '',
    dbserver: process.env.DB_SERVER || '',
    dbdatabase: process.env.DB_DATABASE || '',

    q1: process.env.Q1,
    q2: process.env.Q2,
    q3: process.env.Q3,
    q4: process.env.Q4,
    q5: process.env.Q5,
    q6: process.env.Q6,

    secrettoken: process.env.SECRET_TOKEN

};