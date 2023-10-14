import { IServoController } from "./ServoController";
import { ServoModel } from "./ServoModel";
import { Range } from "./Range";

export interface ServoConfig {
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

    constructor (config: ServoConfig) {
        if (!config.servoModel) {
            throw new Error("Servo: ServoModel must be present (property 'servoModel')");
        }

        if (!config.controller) {
            throw new Error("Servo: ServoController must be present (property 'controller')");
        }

        this.servoModel = config.servoModel;
        this.controller = config.controller;
        this.channel = config.channel;
        this.centerOffsetPwm = config.centerOffsetPwm;
        this.flipDirection = config.flipDirection;
        if(config.angleClamp) this.angleClamp = config.angleClamp;
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

    enable = (debug?: boolean) => {
        this.controller.enableServo(this, debug);
    }

    isDisabled = () => {
        return this.controller.isDisabled(this);
    }
}
