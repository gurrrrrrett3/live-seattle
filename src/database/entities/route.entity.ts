import { Collection, Entity, Enum, Index, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import Trip from "./trip.entity.js";

@Entity()
export default class Route {

    @PrimaryKey()
    id!: string;

    @Property()
    @Index()
    agencyId!: string;

    @Property()
    shortName!: string;

    @Property({
        nullable: true
    })
    longName?: string;

    @Enum(() => RouteType)
    type!: RouteType;

    @Property()
    description!: string;

    @Property()
    url!: string;

    @Property()
    color!: string;

    @Property()
    textColor!: string;

    @Property({
        nullable: true
    })
    networkId?: string;

    @Property({
        nullable: true
    })
    sortOrder?: number;

    @OneToMany(() => Trip, trip => trip.route)
    trips = new Collection<Rel<Trip>>(this);

}

export enum RouteType {
    LightRail = 0,
    Subway = 1,
    Rail = 2,
    Bus = 3,
    Ferry = 4
}