export interface IMapper<TDomain, TEntity> {
  toDomain(entity: TEntity): TDomain;
  toEntity(domain: TDomain): TEntity;
  toDomainList(entities: TEntity[]): TDomain[];
  toEntityList(domains: TDomain[]): TEntity[];
}

export abstract class BaseMapper<TDomain, TEntity> implements IMapper<TDomain, TEntity> {
  abstract toDomain(entity: TEntity): TDomain;
  abstract toEntity(domain: TDomain): TEntity;

  toDomainList(entities: TEntity[]): TDomain[] {
    if (!entities) return [];
    return entities.map((entity) => this.toDomain(entity));
  }

  toEntityList(domains: TDomain[]): TEntity[] {
    if (!domains) return [];
    return domains.map((domain) => this.toEntity(domain));
  }
}