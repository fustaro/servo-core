import { HardwareInterface, PwmWriter } from '../src/HardwareInterface';
import { Servo, ServoDirection, ServoModel } from '../src/Servo';
import { IServoController, ServoControllerFactory } from '../src/ServoController';

describe('ServoControllerFactory', () => {
    it('new ServoControllerFactory throws an error', () => {
        expect(() => new ServoControllerFactory()).toThrowError('Use ServoControllerFactory.get() and ServoControllerFactory.create() methods.');
    });

    it('should create and return a new ServoController', () => {
        const pwmWriter: PwmWriter = { writePwm: jest.fn() };
        const hardwareInterface = new HardwareInterface(pwmWriter, 'TEST1', 0, false);

        const servoController = ServoControllerFactory.create(hardwareInterface);
    
        expect(servoController.setAngleDegrees).toBeDefined();
        expect(servoController.setAngleRadians).toBeDefined();
    });

    it('should throw an error creating multiple ServoControllers of the same name', () => {
        const pwmWriter: PwmWriter = { writePwm: jest.fn() };
        const hardwareInterface = new HardwareInterface(pwmWriter, 'TEST1', 0, false);

        expect(() => ServoControllerFactory.create(hardwareInterface)).toThrowError(/A ServoController already exists named TEST1/);
    });

    it('get() should return a ServoController for uniqueHardwareName TEST1', () => {
        const servoController = ServoControllerFactory.get('TEST1');

        expect(servoController.setAngleDegrees).toBeDefined();
        expect(servoController.setAngleRadians).toBeDefined();
    });

    it('get() should return undefined for uniqueHardwareName TEST2', () => {
        const servoController = ServoControllerFactory.get('TEST2');

        expect(servoController).toBeUndefined();
    });
});

describe('ServoController', () => {
    let servoController;

    describe('setAngleDegrees', () => {
        const mockWritePwmFn = jest.fn();

        beforeAll(() => {
            const pwmWriter: PwmWriter = { writePwm: jest.fn() };
            const hardwareInterface = new HardwareInterface(pwmWriter, 'TEST2', 0, false);
    
            servoController = ServoControllerFactory.create(hardwareInterface);
            servoController['writePwm'] = mockWritePwmFn;
        });
    
        afterEach(() => {
            mockWritePwmFn.mockClear();
        });

        describe('servoDirection: HIGHER_PWM_CLOCKWISE', () => {
            const servoModel1 = new ServoModel({
                pwmRange: { min: 500, natural: 1000, max: 1500 },
                angleRange: { min: -50, natural: 0, max: 50 },
                speed: 0.1,
                servoDirection: ServoDirection.HIGHER_PWM_CLOCKWISE
            });

            describe('flipDirection: false', () => {
                const servo = new Servo({
                    servoModel: servoModel1, 
                    centerOffsetPwm: 0, 
                    flipDirection: false,
                    channel: 0,
                    angleClamp: { min: -50, natural: 0, max: 50 }
                });

                it.each([
                    [ 0, 1000 ],
                    [ 50, 1500 ],
                    [ -50, 500 ],
                    [ 25, 1250 ],
                    [ -25, 750 ]
                ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                    servoController.setAngleDegrees(servo, angle);
                    expect(mockWritePwmFn).toBeCalledWith(servo, expectedPwm);
                });

                describe('servo centerOffsetPwm = 10', () => {
                    const servo1 = new Servo({
                        servoModel: servoModel1, 
                        centerOffsetPwm: 10, 
                        flipDirection: false,
                        channel: 0
                    });

                    it.each([
                        [ 0, 1000 + 10 ],
                        [ 50, 1500 ], //max 1500
                        [ -50, 500 + 10 ],
                        [ 25, 1250 + 10 ],
                        [ -25, 750 + 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });

                describe('servo centerOffsetPwm = -10', () => {
                    const servo1 = new Servo({
                        servoModel: servoModel1, 
                        centerOffsetPwm: -10, 
                        flipDirection: false,
                        channel: 0
                    });

                    it.each([
                        [ 0, 1000 - 10 ],
                        [ 50, 1500 - 10 ],
                        [ -50, 500 ], //min 500
                        [ 25, 1250 - 10 ], 
                        [ -25, 750 - 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });
            });

            describe('flipDirection: true', () => {
                const servo = new Servo({
                    servoModel: servoModel1, 
                    centerOffsetPwm: 0, 
                    flipDirection: true,
                    channel: 0
                });

                it.each([
                    [ 0, 1000 ],
                    [ -50, 1500 ],
                    [ 50, 500 ],
                    [ -25, 1250 ],
                    [ 25, 750 ]
                ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                    servoController.setAngleDegrees(servo, angle);
                    expect(mockWritePwmFn).toBeCalledWith(servo, expectedPwm);
                });

                describe('servo centerOffsetPwm = 10', () => {
                    const servo1 = new Servo({
                        servoModel: servoModel1, 
                        centerOffsetPwm: 10, 
                        flipDirection: true,
                        channel: 0
                    });

                    it.each([
                        [ 0, 1000 + 10 ],
                        [ -50, 1500 ], //max 1500
                        [ 50, 500 + 10 ],
                        [ -25, 1250 + 10 ],
                        [ 25, 750 + 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });

                describe('servo centerOffsetPwm = -10', () => {
                    const servo1 = new Servo({
                        servoModel: servoModel1, 
                        centerOffsetPwm: -10, 
                        flipDirection: true,
                        channel: 0
                    });

                    it.each([
                        [ 0, 1000 - 10 ],
                        [ -50, 1500 - 10 ],
                        [ 50, 500 ], //min 500
                        [ -25, 1250 - 10 ], 
                        [ 25, 750 - 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });
            });
        });

        describe('servoDirection: LOWER_PWM_CLOCKWISE', () => {
            const servoModel1 = new ServoModel({
                pwmRange: { min: 500, natural: 1000, max: 1500 },
                angleRange: { min: -50, natural: 0, max: 50 },
                speed: 0.1,
                servoDirection: ServoDirection.LOWER_PWM_CLOCKWISE
            });

            describe('flipDirection: false', () => {
                const servo = new Servo({
                    servoModel: servoModel1, 
                    centerOffsetPwm: 0, 
                    flipDirection: false,
                    channel: 0
                });

                it.each([
                    [ 0, 1000 ],
                    [ -50, 1500 ],
                    [ 50, 500 ],
                    [ -25, 1250 ],
                    [ 25, 750 ]
                ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                    servoController.setAngleDegrees(servo, angle);
                    expect(mockWritePwmFn).toBeCalledWith(servo, expectedPwm);
                });

                describe('servo centerOffsetPwm = 10', () => {
                    const servo1 = new Servo({
                        servoModel: servoModel1, 
                        centerOffsetPwm: 10, 
                        flipDirection: false,
                        channel: 0
                    });

                    it.each([
                        [ 0, 1000 + 10 ],
                        [ -50, 1500 ], //max 1500
                        [ 50, 500 + 10 ],
                        [ -25, 1250 + 10 ],
                        [ 25, 750 + 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });

                describe('servo centerOffsetPwm = -10', () => {
                    const servo1 = new Servo({
                        servoModel: servoModel1, 
                        centerOffsetPwm: -10, 
                        flipDirection: false,
                        channel: 0
                    });

                    it.each([
                        [ 0, 1000 - 10 ],
                        [ -50, 1500 - 10 ],
                        [ 50, 500 ], //min 500
                        [ -25, 1250 - 10 ], 
                        [ 25, 750 - 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });
            });

            describe('flipDirection: true', () => {
                const servo = new Servo({
                    servoModel: servoModel1, 
                    centerOffsetPwm: 0, 
                    flipDirection: true,
                    channel: 0
                });

                it.each([
                    [ 0, 1000 ],
                    [ 50, 1500 ],
                    [ -50, 500 ],
                    [ 25, 1250 ],
                    [ -25, 750 ]
                ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                    servoController.setAngleDegrees(servo, angle);
                    expect(mockWritePwmFn).toBeCalledWith(servo, expectedPwm);
                });

                describe('servo centerOffsetPwm = 10', () => {
                    const servo1 = new Servo({
                        servoModel: servoModel1, 
                        centerOffsetPwm: 10, 
                        flipDirection: true,
                        channel: 0
                    });

                    it.each([
                        [ 0, 1000 + 10 ],
                        [ 50, 1500 ], //max 1500
                        [ -50, 500 + 10 ],
                        [ 25, 1250 + 10 ],
                        [ -25, 750 + 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });

                describe('servo centerOffsetPwm = -10', () => {
                    const servo1 = new Servo({
                        servoModel: servoModel1, 
                        centerOffsetPwm: -10, 
                        flipDirection: true,
                        channel: 0
                    });

                    it.each([
                        [ 0, 1000 - 10 ],
                        [ 50, 1500 - 10 ],
                        [ -50, 500 ], //min 500
                        [ 25, 1250 - 10 ], 
                        [ -25, 750 - 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });
            });
        });
    });

    describe('writePwm', () => {
        const mockWritePwmFn = jest.fn();
        let servoController: IServoController;

        beforeAll(() => {
            const pwmWriter: PwmWriter = { writePwm: mockWritePwmFn };
            const hardwareInterface = new HardwareInterface(pwmWriter, 'TEST3', 0, false);
    
            servoController = ServoControllerFactory.create(hardwareInterface);
        });
    
        afterEach(() => {
            mockWritePwmFn.mockClear();
        });

        const servoModel = new ServoModel({
            pwmRange: { min: 500, natural: 1000, max: 1500 },
            angleRange: { min: -50, natural: 0, max: 50 },
            speed: 0.1,
            servoDirection: ServoDirection.LOWER_PWM_CLOCKWISE
        });

        const channelNo = 102;

        const servo = new Servo({
            servoModel: servoModel, 
            centerOffsetPwm: 0, 
            flipDirection: true,
            channel: channelNo
        });

        it('should call writePwm with correct channel and pwm values', () => {
            const pwm = 1231;
            servoController['writePwm'](servo, pwm);
            expect(mockWritePwmFn).toHaveBeenCalledWith(channelNo, pwm);
        });

        it('should not call writePwm when previous channel and pwm values were the same', () => {
            const pwm = 1231;
            servoController['writePwm'](servo, pwm);
            expect(mockWritePwmFn).not.toHaveBeenCalled();
        });
    });
});
