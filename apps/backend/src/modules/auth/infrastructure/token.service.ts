import jwt from "jsonwebtoken";
import {config} from "@eventflux/config";

export class TokenService{
    generate(payload:{id:String,tenantId:string,role:string}){
        return jwt.sign(payload,config.backend.jwtSecret,{expiresIn:'1d'});
    }

    verify(token:string):any{
        return jwt.verify(token,config.backend.jwtSecret);
    }
}