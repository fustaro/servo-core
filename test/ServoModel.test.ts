import { ServoDirection } from "../src/ServoDirection";
import { IServoModel, ServoModel } from "../src/ServoModel";

describe('constructor', () => {
    it('when angleRange is null, throws exeption', () => {   
        const data: IServoModel = {
            angleRange: null,
            pwmRange: { min: 500, natural: 1000, max: 1500 },
            speed: 0.1,
            servoDirection: ServoDirection.HIGHER_PWM_CLOCKWISE
        };

        expect(() => new ServoModel(data)).toThrowError("ServoModel: Angle Range must be present (property 'angleRange')");
    });

    it('when pwmRange is null, throws exeption', () => {
        const data: IServoModel = {
            angleRange: { min: -50, natural: 0, max: 50 },
            pwmRange: null,
            speed: 0.1,
            servoDirection: ServoDirection.HIGHER_PWM_CLOCKWISE
        };

        expect(() => new ServoModel(data)).toThrowError("ServoModel: PWM Range must be present (property 'pwmRange'");
    });
});
