import { HardwareInterface, ServoDriver } from '../src/HardwareInterface';
import { Servo } from '../src/Servo';
import { IServoController, ServoControllerFactory } from '../src/ServoController';
import { ServoDirection } from '../src/ServoDirection';
import { ServoModel } from '../src/ServoModel';

describe('ServoControllerFactory', () => {
    it('new ServoControllerFactory throws an error', () => {
        expect(() => new ServoControllerFactory()).toThrowError('Use ServoControllerFactory.get() and ServoControllerFactory.create() methods.');
    });

    it('should create and return a new ServoController', () => {
        const ServoDriver: ServoDriver = {
            writePwm: jest.fn(),
            dispose: jest.fn()
        };
        const hardwareInterface = new HardwareInterface(ServoDriver, 'SCF-TEST-1', 0, false);

        const servoController = ServoControllerFactory.create(hardwareInterface);
    
        expect(servoController.setAngleDegrees).toBeDefined();
        expect(servoController.setAngleRadians).toBeDefined();
    });

    it('should throw an error creating multiple ServoControllers of the same name', () => {
        const ServoDriver: ServoDriver = {
            writePwm: jest.fn(),
            dispose: jest.fn()
        };
        const hardwareInterface = new HardwareInterface(ServoDriver, 'SCF-TEST-1', 0, false);

        expect(() => ServoControllerFactory.create(hardwareInterface)).toThrowError(/A ServoController already exists named SCF-TEST-1/);
    });

    it('get() should return a ServoController for uniqueHardwareName SCF-TEST-1', () => {
        const servoController = ServoControllerFactory.get('SCF-TEST-1');

        expect(servoController.setAngleDegrees).toBeDefined();
        expect(servoController.setAngleRadians).toBeDefined();
    });

    it('get() should return undefined for uniqueHardwareName SCF-TEST-2', () => {
        const servoController = ServoControllerFactory.get('SCF-TEST-2');
        expect(servoController).toBeUndefined();
    });

    describe('dispose', () => {
        it('should remove controller and allow recreation', () => {
            const ServoDriver: ServoDriver = {
                writePwm: jest.fn(),
                dispose: jest.fn()
            };

            const hwInterface2 = new HardwareInterface(ServoDriver, 'SCF-TEST-2', 0, false);
            ServoControllerFactory.create(hwInterface2);

            let controller1 = ServoControllerFactory.get('SCF-TEST-1');
            let controller2 = ServoControllerFactory.get('SCF-TEST-2');

            expect(controller1.setAngleDegrees).toBeDefined();
            expect(controller2.setAngleDegrees).toBeDefined();
            
            ServoControllerFactory['dispose']('SCF-TEST-1');

            expect(ServoControllerFactory.get('SCF-TEST-1')).toBeUndefined();
            expect(ServoControllerFactory.get('SCF-TEST-2')).toBeDefined();
            
            const newHwInterface1 = new HardwareInterface(ServoDriver, 'SCF-TEST-1', 0, false);
            const newController1 = ServoControllerFactory.create(newHwInterface1);

            expect(ServoControllerFactory.get('SCF-TEST-1')).toBeDefined();
        });
    });
});

describe('ServoController', () => {
    let servoController;

    describe('setAngleDegrees', () => {
        const mockWritePwmFn = jest.fn();

        beforeAll(() => {
            const ServoDriver: ServoDriver = {
                writePwm: jest.fn(),
                dispose: jest.fn()
            };
            const hardwareInterface = new HardwareInterface(ServoDriver, 'TEST2', 0, false);
    
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
                it.each([
                    [ 0, 1000 ],
                    [ 50, 1500 ],
                    [ -50, 500 ],
                    [ 25, 1250 ],
                    [ -25, 750 ]
                ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                    const servo = new Servo({
                        servoModel: servoModel1,
                        controller: servoController,
                        channel: 0,
                        centerOffsetPwm: 0, 
                        flipDirection: false,
                        angleClamp: { min: -50, natural: 0, max: 50 },
                    });

                    servoController.setAngleDegrees(servo, angle);
                    expect(mockWritePwmFn).toBeCalledWith(servo, expectedPwm);
                });

                describe('servo centerOffsetPwm = 10', () => {
                    it.each([
                        [ 0, 1000 + 10 ],
                        [ 50, 1500 ], //max 1500
                        [ -50, 500 + 10 ],
                        [ 25, 1250 + 10 ],
                        [ -25, 750 + 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        const servo1 = new Servo({
                            servoModel: servoModel1,
                            controller: servoController,
                            channel: 0,
                            centerOffsetPwm: 10, 
                            flipDirection: false
                        });

                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });

                describe('servo centerOffsetPwm = -10', () => {
                    it.each([
                        [ 0, 1000 - 10 ],
                        [ 50, 1500 - 10 ],
                        [ -50, 500 ], //min 500
                        [ 25, 1250 - 10 ], 
                        [ -25, 750 - 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        const servo1 = new Servo({
                            servoModel: servoModel1,
                            controller: servoController,
                            channel: 0,
                            centerOffsetPwm: -10, 
                            flipDirection: false
                        });

                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });
            });

            describe('flipDirection: true', () => {
                it.each([
                    [ 0, 1000 ],
                    [ -50, 1500 ],
                    [ 50, 500 ],
                    [ -25, 1250 ],
                    [ 25, 750 ]
                ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                    const servo = new Servo({
                        servoModel: servoModel1,
                        controller: servoController,
                        channel: 0,
                        centerOffsetPwm: 0,
                        flipDirection: true
                    });

                    servoController.setAngleDegrees(servo, angle);
                    expect(mockWritePwmFn).toBeCalledWith(servo, expectedPwm);
                });

                describe('servo centerOffsetPwm = 10', () => {
                    it.each([
                        [ 0, 1000 + 10 ],
                        [ -50, 1500 ], //max 1500
                        [ 50, 500 + 10 ],
                        [ -25, 1250 + 10 ],
                        [ 25, 750 + 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        const servo1 = new Servo({
                            servoModel: servoModel1,
                            controller: servoController,
                            channel: 0,
                            centerOffsetPwm: 10,
                            flipDirection: true
                        });

                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });

                describe('servo centerOffsetPwm = -10', () => {
                    it.each([
                        [ 0, 1000 - 10 ],
                        [ -50, 1500 - 10 ],
                        [ 50, 500 ], //min 500
                        [ -25, 1250 - 10 ], 
                        [ 25, 750 - 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        const servo1 = new Servo({
                            servoModel: servoModel1,
                            controller: servoController,
                            channel: 0,
                            centerOffsetPwm: -10,
                            flipDirection: true
                        });

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
                it.each([
                    [ 0, 1000 ],
                    [ -50, 1500 ],
                    [ 50, 500 ],
                    [ -25, 1250 ],
                    [ 25, 750 ]
                ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                    const servo = new Servo({
                        servoModel: servoModel1,
                        controller: servoController,
                        channel: 0,
                        centerOffsetPwm: 0,
                        flipDirection: false
                    });

                    servoController.setAngleDegrees(servo, angle);
                    expect(mockWritePwmFn).toBeCalledWith(servo, expectedPwm);
                });

                describe('servo centerOffsetPwm = 10', () => {
                    it.each([
                        [ 0, 1000 + 10 ],
                        [ -50, 1500 ], //max 1500
                        [ 50, 500 + 10 ],
                        [ -25, 1250 + 10 ],
                        [ 25, 750 + 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        const servo1 = new Servo({
                            servoModel: servoModel1,
                            controller: servoController,
                            channel: 0,
                            centerOffsetPwm: 10,
                            flipDirection: false
                        });

                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });

                describe('servo centerOffsetPwm = -10', () => {
                    it.each([
                        [ 0, 1000 - 10 ],
                        [ -50, 1500 - 10 ],
                        [ 50, 500 ], //min 500
                        [ -25, 1250 - 10 ], 
                        [ 25, 750 - 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        const servo1 = new Servo({
                            servoModel: servoModel1,
                            controller: servoController,
                            channel: 0,
                            centerOffsetPwm: -10,
                            flipDirection: false
                        });

                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });
            });

            describe('flipDirection: true', () => {
                it.each([
                    [ 0, 1000 ],
                    [ 50, 1500 ],
                    [ -50, 500 ],
                    [ 25, 1250 ],
                    [ -25, 750 ]
                ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                    const servo = new Servo({
                        servoModel: servoModel1,
                        controller: servoController,
                        channel: 0,
                        centerOffsetPwm: 0,
                        flipDirection: true
                    });

                    servoController.setAngleDegrees(servo, angle);
                    expect(mockWritePwmFn).toBeCalledWith(servo, expectedPwm);
                });

                describe('servo centerOffsetPwm = 10', () => {
                    it.each([
                        [ 0, 1000 + 10 ],
                        [ 50, 1500 ], //max 1500
                        [ -50, 500 + 10 ],
                        [ 25, 1250 + 10 ],
                        [ -25, 750 + 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        const servo1 = new Servo({
                            servoModel: servoModel1,
                            controller: servoController,
                            channel: 0,
                            centerOffsetPwm: 10,
                            flipDirection: true
                        });

                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });

                describe('servo centerOffsetPwm = -10', () => {
                    it.each([
                        [ 0, 1000 - 10 ],
                        [ 50, 1500 - 10 ],
                        [ -50, 500 ], //min 500
                        [ 25, 1250 - 10 ], 
                        [ -25, 750 - 10 ]
                    ])('when angle is %i, expect pwm of %i', (angle, expectedPwm) => {
                        const servo1 = new Servo({
                            servoModel: servoModel1,
                            controller: servoController,
                            channel: 0,
                            centerOffsetPwm: -10,
                            flipDirection: true
                        });

                        servoController.setAngleDegrees(servo1, angle);
                        expect(mockWritePwmFn).toBeCalledWith(servo1, expectedPwm);
                    });
                });
            });
        });
    });

    describe('disable/enable servo', () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        beforeEach(() => {
            consoleLogSpy.mockClear();
            consoleWarnSpy.mockClear();
        });

        const servoModel = new ServoModel({
            pwmRange: { min: 500, natural: 1000, max: 1500 },
            angleRange: { min: -50, natural: 0, max: 50 },
            speed: 0.1,
            servoDirection: ServoDirection.LOWER_PWM_CLOCKWISE
        });

        describe('enableServo', () => {
            describe('when hardware does not implement disableServo', () => {
                it('logs debug message when debug = true', () => {
                    const ServoDriver: ServoDriver = {
                        writePwm: jest.fn(),
                        dispose: jest.fn()
                    };
                    const hardwareInterface = new HardwareInterface(ServoDriver, 'TEST-DISABLE-SERVO-1', 0, false);
                    const servoController = ServoControllerFactory.create(hardwareInterface);
    
                    const servo = new Servo({
                        servoModel: servoModel,
                        controller: servoController,
                        channel: 2,
                        centerOffsetPwm: 10,
                        flipDirection: true
                    });
    
                    servoController.disableServo(servo, true);
    
                    expect(console.log).toHaveBeenCalledTimes(1);
                    expect(console.log).toHaveBeenCalledWith('ServoController: disableServo: hardware: TEST-DISABLE-SERVO-1, channel: 2');
                    expect(console.warn).toHaveBeenCalledTimes(1);
                    expect(console.warn).toHaveBeenCalledWith('ServoController: Unable to disable servo, hardware TEST-DISABLE-SERVO-1 has no implementation');
                });
            });
    
            describe('when hardware does implement disableServo', () => {
                it('calls appropiate ServoDriver method', () => {
    
                    const mockServoDriverDisableServoFn = jest.fn();
    
                    const ServoDriver: ServoDriver = {
                        writePwm: jest.fn(),
                        disableServo: mockServoDriverDisableServoFn,
                        dispose: jest.fn()
                    };
    
                    const hardwareInterface = new HardwareInterface(ServoDriver, 'TEST-DISABLE-SERVO-2', 0, false);
                    const servoController = ServoControllerFactory.create(hardwareInterface);
    
                    const servo = new Servo({
                        servoModel: servoModel,
                        controller: servoController,
                        channel: 2,
                        centerOffsetPwm: 10,
                        flipDirection: true
                    });
    
                    servoController.disableServo(servo, true);
    
                    expect(mockServoDriverDisableServoFn).toHaveBeenCalledWith(2);
    
                    expect(console.log).toHaveBeenCalledTimes(1);
                    expect(console.log).toHaveBeenCalledWith('ServoController: disableServo: hardware: TEST-DISABLE-SERVO-2, channel: 2');
                    expect(console.warn).not.toHaveBeenCalled();
                });
            });
        });

        describe('disableServo', () => {
            describe('when hardware does not implement enableServo', () => {
                it('logs debug message when debug = true', () => {
                    const ServoDriver: ServoDriver = {
                        writePwm: jest.fn(),
                        dispose: jest.fn()
                    };
                    const hardwareInterface = new HardwareInterface(ServoDriver, 'TEST-ENABLE-SERVO-1', 0, false);
                    const servoController = ServoControllerFactory.create(hardwareInterface);
    
                    const servo = new Servo({
                        servoModel: servoModel,
                        controller: servoController,
                        channel: 2,
                        centerOffsetPwm: 10,
                        flipDirection: true
                    });
    
                    servoController.enableServo(servo, true);
    
                    expect(console.log).toHaveBeenCalledTimes(1);
                    expect(console.log).toHaveBeenCalledWith('ServoController: enableServo: hardware: TEST-ENABLE-SERVO-1, channel: 2');
                    expect(console.warn).toHaveBeenCalledTimes(1);
                    expect(console.warn).toHaveBeenCalledWith('ServoController: Unable to enable servo, hardware TEST-ENABLE-SERVO-1 has no implementation');
                });
            });
    
            describe('when hardware does implement enableServo', () => {
                it('calls appropiate ServoDriver method', () => {
    
                    const mockServoDriverEnableServoFn = jest.fn();
    
                    const ServoDriver: ServoDriver = {
                        writePwm: jest.fn(),
                        enableServo: mockServoDriverEnableServoFn,
                        dispose: jest.fn()
                    };
    
                    const hardwareInterface = new HardwareInterface(ServoDriver, 'TEST-ENABLE-SERVO-2', 0, false);
                    const servoController = ServoControllerFactory.create(hardwareInterface);
    
                    const servo = new Servo({
                        servoModel: servoModel,
                        controller: servoController,
                        channel: 2,
                        centerOffsetPwm: 10,
                        flipDirection: true
                    });
    
                    servoController.enableServo(servo, true);
    
                    expect(mockServoDriverEnableServoFn).toHaveBeenCalledWith(2);
    
                    expect(console.log).toHaveBeenCalledTimes(1);
                    expect(console.log).toHaveBeenCalledWith('ServoController: enableServo: hardware: TEST-ENABLE-SERVO-2, channel: 2');
                    expect(console.warn).not.toHaveBeenCalled();
                });
            });
        });
    });

    describe('writePwm', () => {
        const mockWritePwmFn = jest.fn();
        let servoController: IServoController;
        let servo: Servo;
        const channelNo = 102;

        const servoModel = new ServoModel({
            pwmRange: { min: 500, natural: 1000, max: 1500 },
            angleRange: { min: -50, natural: 0, max: 50 },
            speed: 0.1,
            servoDirection: ServoDirection.LOWER_PWM_CLOCKWISE
        });

        beforeAll(() => {
            const ServoDriver: ServoDriver = { 
                writePwm: mockWritePwmFn,
                dispose: jest.fn()
            };
            const hardwareInterface = new HardwareInterface(ServoDriver, 'TEST3', 0, false);
    
            servoController = ServoControllerFactory.create(hardwareInterface);

            servo = new Servo({
                servoModel: servoModel,
                controller: servoController,
                channel: channelNo,
                centerOffsetPwm: 0, 
                flipDirection: true
            });
        });
    
        afterEach(() => {
            mockWritePwmFn.mockClear();
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
