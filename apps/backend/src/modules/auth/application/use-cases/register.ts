import { IUserRepo } from "../../domain/user.entity";
import { ITenantRepo } from "../../../tenant/domain/tenant.entity";
import bcrypt, { hash } from "bcrypt";

export class RegisterUseCase {
    constructor(
        private readonly userRepo : IUserRepo,
        private readonly tenantRepo : ITenantRepo,
    ){}


    async execute(data:any){
        const tenant = await this.tenantRepo.create(`${data.name}'s Org`);

        const hashed = await bcrypt.hash(data.password,10);

        const newUser = {
            email : data.email,
            passwordHash : hashed,
            tenantId : data.id,
            role : 'ADMIN',
        }

        await this.userRepo.save(newUser as any);
        return {user:{email:newUser.email},tenant}
    }
}