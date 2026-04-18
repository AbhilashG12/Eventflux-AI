export class Tenant {
    constructor(
        private readonly id : string,
        private readonly name : string,
        private readonly apiKey : string,
        private readonly createdAt : Date,

    ) {}
}


export interface ITenantRepo{
    create(name:string):Promise<Tenant>;
    findById(id:string):Promise<Tenant|null>;
}