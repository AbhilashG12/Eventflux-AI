export class User {
    constructor(
        private readonly id : string,
        private readonly email : string,
        private readonly passwordHash : string,
        private readonly tenantId : string,
        private readonly role : 'ADMIN' | 'MEMBER',

    ){}
}

export interface IUserRepo {
    findByEmal(email:string):Promise<User|null>;
    save(user:User):Promise<void>;
}