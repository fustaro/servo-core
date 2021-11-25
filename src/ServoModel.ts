import { ServoDirection } from "./ServoDirection";
import { Range } from "./Range";

export interface IServoModel {
    readonly pwmRange: Range;
    readonly angleRange: Range;
    readonly speed: number; 
    readonly servoDirection: ServoDirection;
}

export class ServoModel {
    readonly pwmRange: Range;
    readonly angleRange: Range;
    readonly speed: number; 
    readonly servoDirection: ServoDirection;

    constructor (data: IServoModel) {

        if (!data.pwmRange) {
            throw new Error("ServoModel: PWM Range must be present (property 'pwmRange')");
        }

        if (!data.angleRange) {
            throw new Error("ServoModel: Angle Range must be present (property 'angleRange')");
        }

        this.pwmRange = data.pwmRange;
        this.angleRange = data.angleRange;
        this.speed = data.speed;
        this.servoDirection = data.servoDirection;
    }
}