import { IServoController } from "./ServoController";
import { ServoModel } from "./ServoModel";
import { Range } from "./Range";

export interface IServo {
    readonly servoModel: ServoModel;
    readonly controller: IServoController;
    readonly channel: number;
    readonly centerOffsetPwm: number;
    readonly flipDirection: boolean;
    readonly angleClamp?: Range;
}

export class Servo {
    readonly servoModel: ServoModel;
    readonly controller: IServoController;
    readonly channel: number;
    readonly centerOffsetPwm: number;
    readonly flipDirection: boolean;
    readonly angleClamp?: Range;

    constructor (data: IServo) {
        if (!data.servoModel) {
            throw new Error("Servo: ServoModel must be present (property 'servoModel')");
        }

        if (!data.controller) {
            throw new Error("Servo: ServoController must be present (property 'controller')");
        }

        this.servoModel = data.servoModel;
        this.controller = data.controller;
        this.channel = data.channel;
        this.centerOffsetPwm = data.centerOffsetPwm;
        this.flipDirection = data.flipDirection;
        if(data.angleClamp) this.angleClamp = data.angleClamp;
    }

	setAngleDegrees = (angle: number, debug?: boolean) => {
        this.controller.setAngleDegrees(this, angle, debug)
    };

	setAngleRadians = (angle: number, debug?: boolean) => {
        this.controller.setAngleRadians(this, angle, debug)
    };

    disable = (debug?: boolean) => {
        this.controller.disableServo(this, debug);
    }
}
