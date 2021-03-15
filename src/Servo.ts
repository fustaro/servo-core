export enum ServoDirection {
    HIGHER_PWM_CLOCKWISE,
    LOWER_PWM_CLOCKWISE,
}

export interface Range {
    readonly min: number;
    readonly natural: number;
    readonly max: number;
}

export class ServoModel {
    readonly pwmRange: Range;
    readonly angleRange: Range;
    readonly speed: number; 
    readonly servoDirection: ServoDirection;

    constructor(data: ServoModel){
        this.pwmRange = data.pwmRange;
        this.angleRange = data.angleRange;
        this.speed = data.speed;
        this.servoDirection = data.servoDirection;
    }
}

export class Servo {
    readonly servoModel: ServoModel;
    readonly centerOffsetPwm: number;
    readonly channel: number;
    readonly flipDirection: boolean;

    constructor(servoModel: ServoModel, centerOffsetPwm: number, flipDirection: boolean, channel: number){
        this.servoModel = servoModel;
        this.centerOffsetPwm = centerOffsetPwm;
        this.channel = channel;
        this.flipDirection = flipDirection;
    }
}
