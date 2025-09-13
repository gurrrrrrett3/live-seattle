import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import Route from "./route.entity.js";

@Entity()
export default class Trip {

    @PrimaryKey()
    id!: string;

    @ManyToOne(() => Route)
    route!: Rel<Route>;

    @Property()
    serviceId!: string;
    @Property({
        nullable: true
    })
    shortName!: string;

    @Property()
    headSign!: string;

    @Enum(() => Direction)
    direction!: Direction;

    @Property()
    blockId?: string;

    @Property()
    shapeId!: string

    @Property()
    wheelChairAccessible!: boolean;

    // @Property({
    //     nullable: true
    // })
    // drtAdvanceBookMin?: number;

    @Property()
    bikesAllowed!: boolean;

    // @Property({
    //     nullable: true
    // })
    // fareId?: number;

    // @Property({
    //     nullable: true
    // })
    // peakOffPeak?: boolean;

    // @Property({
    //     nullable: true
    // })
    // boardingType?: number;

}

export enum Direction {
    Outbound,
    Inbound
}