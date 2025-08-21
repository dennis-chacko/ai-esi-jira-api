export interface IMapper<Source, Target> {
    mapToTarget(source: Source): Promise<Target[]>;
}