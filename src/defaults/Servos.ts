import { ServoDirection } from "../ServoDirection";
import { ServoModel } from "../ServoModel";

export const Turnigy_TGY1501: ServoModel = new ServoModel({
    pwmRange:   { min: 660, natural: 1000,  max: 1280 },
    angleRange: { min: -60, natural: 0,     max: 60 },
    speed: 0.14,
    servoDirection: ServoDirection.HIGHER_PWM_CLOCKWISE
});

export const Turnigy_TGY4409MD: ServoModel = new ServoModel({
    pwmRange:   { min: 528, natural: 1500,  max: 2496 },
    angleRange: { min: -90, natural: 0,     max: 90 },
    speed: 0.11,
    servoDirection: ServoDirection.HIGHER_PWM_CLOCKWISE
});

export const TowerPro_MG92B: ServoModel = new ServoModel({
    pwmRange:   { min: 720, natural: 1500,  max: 2280 },
    angleRange: { min: -76.5, natural: 0,     max: 76.5 },
    speed: 0.08,
    servoDirection: ServoDirection.LOWER_PWM_CLOCKWISE
});

export const Corona_DS339HV: ServoModel = new ServoModel({
    pwmRange:   { min: 750, natural: 1500,  max: 2250 },
    angleRange: { min: -75, natural: 0,     max: 75 },
    speed: 0.11,
    servoDirection: ServoDirection.HIGHER_PWM_CLOCKWISE
});

export const Savox_SH0256: ServoModel = new ServoModel({
    pwmRange:   { min: 750, natural: 1500,  max: 2250 },
    angleRange: { min: -72.5, natural: 0,     max: 72.5 },
    speed: 0.11,
    servoDirection: ServoDirection.HIGHER_PWM_CLOCKWISE
});

