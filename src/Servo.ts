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

    constructor(data: Servo){
        this.servoModel = data.servoModel;
        this.centerOffsetPwm = data.centerOffsetPwm;
        this.channel = data.channel;
        this.flipDirection = data.flipDirection;
    }
}
