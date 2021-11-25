import { IServo, Servo } from "../src/Servo";
import { IServoController } from "../src/ServoController";
import { ServoDirection } from "../src/ServoDirection";
import { ServoModel } from "../src/ServoModel";

const servoModel = new ServoModel({
    pwmRange: { min: 500, natural: 1000, max: 1500 },
    angleRange: { min: -50, natural: 0, max: 50 },
    speed: 0.1,
    servoDirection: ServoDirection.HIGHER_PWM_CLOCKWISE
});

const mockSetAngleDegrees = jest.fn();
const mockSetAngleRadians = jest.fn();

const mockServoController: IServoController = {
    setAngleDegrees: mockSetAngleDegrees,
    setAngleRadians: mockSetAngleRadians
};

describe('constructor', () => {
    it('when servoModel is null, throws exeption', () => {
        const servoData: IServo = {
            servoModel: null,
            controller: mockServoController,
            channel: 0,
            centerOffsetPwm: 0, 
            flipDirection: false,
            angleClamp: { min: -50, natural: 0, max: 50 },
        };

        expect(() => new Servo(servoData)).toThrowError("Servo: ServoModel must be present (property 'servoModel')");
    });

    it('when controller is null, throws exeption', () => {
        const servoData: IServo = {
            servoModel: servoModel,
            controller: null,
            channel: 0,
            centerOffsetPwm: 0, 
            flipDirection: false,
            angleClamp: { min: -50, natural: 0, max: 50 },
        };

        expect(() => new Servo(servoData)).toThrowError("Servo: ServoController must be present (property 'controller')");
    });
});

describe('setAngleDegrees', () => {
    afterEach(() => {
        mockSetAngleDegrees.mockClear();
        mockSetAngleRadians.mockReset();
    });

    it('calls controller.setAngleDegrees with correct properties: 1', () => {
        const servo = new Servo({
            servoModel: servoModel,
            controller: mockServoController,
            channel: 0,
            centerOffsetPwm: 0, 
            flipDirection: false,
            angleClamp: { min: -50, natural: 0, max: 50 },
        });

        servo.setAngleDegrees(102);

        expect(mockSetAngleDegrees).toHaveBeenCalledTimes(1);
        expect(mockSetAngleDegrees).toHaveBeenCalledWith(servo, 102, undefined);
        expect(mockSetAngleRadians).not.toHaveBeenCalled();
    });

    it('calls controller.setAngleDegrees with correct properties: 2', () => {
        const servo = new Servo({
            servoModel: servoModel,
            controller: mockServoController,
            channel: 0,
            centerOffsetPwm: 0, 
            flipDirection: false,
            angleClamp: { min: -50, natural: 0, max: 50 },
        });

        servo.setAngleDegrees(43, true);

        expect(mockSetAngleDegrees).toHaveBeenCalledTimes(1);
        expect(mockSetAngleDegrees).toHaveBeenCalledWith(servo, 43, true);
        expect(mockSetAngleRadians).not.toHaveBeenCalled();
    });
});

describe('setAngleRadians', () => {
    afterEach(() => {
        mockSetAngleDegrees.mockClear();
        mockSetAngleRadians.mockReset();
    });

    it('calls controller.setAngleRadians with correct properties: 1', () => {
        const servo = new Servo({
            servoModel: servoModel,
            controller: mockServoController,
            channel: 0,
            centerOffsetPwm: 0, 
            flipDirection: false,
            angleClamp: { min: -50, natural: 0, max: 50 },
        });

        servo.setAngleRadians(0.45);

        expect(mockSetAngleRadians).toHaveBeenCalledTimes(1);
        expect(mockSetAngleRadians).toHaveBeenCalledWith(servo, 0.45, undefined);
        expect(mockSetAngleDegrees).not.toHaveBeenCalled();
    });

    it('calls controller.setAngleRadians with correct properties: 2', () => {
        const servo = new Servo({
            servoModel: servoModel,
            controller: mockServoController,
            channel: 0,
            centerOffsetPwm: 0, 
            flipDirection: false,
            angleClamp: { min: -50, natural: 0, max: 50 },
        });

        servo.setAngleRadians(-1.23, true);

        expect(mockSetAngleRadians).toHaveBeenCalledTimes(1);
        expect(mockSetAngleRadians).toHaveBeenCalledWith(servo, -1.23, true);
        expect(mockSetAngleDegrees).not.toHaveBeenCalled();
    });
});
