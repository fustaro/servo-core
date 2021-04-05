import { HardwareInterface } from "./HardwareInterface";
import { Servo, ServoDirection } from "./Servo";

export class ServoControllerFactory {
	private static readonly controllers = new Map<string, IServoController>();

    constructor() {
        throw new Error('Use ServoControllerFactory.get() and ServoControllerFactory.create() methods.');
	}

	static get = (uniqueHardwareName: string): IServoController | null => {
		return ServoControllerFactory.controllers.get(uniqueHardwareName);
	}
	
    static create = (hardwareInterface: HardwareInterface): IServoController => {
		if(ServoControllerFactory.controllers.has(hardwareInterface.uniqueHardwareName)){
			throw new Error(`A ServoController already exists named ${hardwareInterface.uniqueHardwareName}, you can only run this command if ServoControllerFactor.get() returns null.
			This is to stop you initializing your hardware multiple times.`);
		}

		const controller = new ServoController(hardwareInterface);
		ServoControllerFactory.controllers.set(hardwareInterface.uniqueHardwareName, controller);

		return controller;
    }
}

export interface IServoController {
	setAngleDegrees: (servo: Servo, angle: number) => void;
	setAngleRadians: (servo: Servo, angle: number) => void;
}

class ServoController implements IServoController {
	readonly hardwareInterface: HardwareInterface;
	readonly previousPwmValues: number[];

	constructor(servoHardwareDriver: HardwareInterface){
		this.hardwareInterface = servoHardwareDriver;
		this.previousPwmValues = new Array<number>(servoHardwareDriver.chanelCount);
	}

	setAngleDegrees = (servo: Servo, angle: number) => {
		const sm = servo.servoModel;
		let flip = servo.flipDirection;

		if(servo.servoModel.servoDirection == ServoDirection.LOWER_PWM_CLOCKWISE) flip = !flip;

		if(servo.angleClamp){
			angle = Math.max(Math.min(angle, servo.angleClamp.max), servo.angleClamp.min);
		}

		const angleRange = angle < 0 ? sm.angleRange.min : sm.angleRange.max;
		const pwmRange = (flip ? -angle : angle) < 0 ? sm.pwmRange.min : sm.pwmRange.max;
	
		const pwmDiff = pwmRange - sm.pwmRange.natural;
		
		let pwm = sm.pwmRange.natural + pwmDiff * (angle / angleRange);
		pwm += servo.centerOffsetPwm;
		pwm = Math.max(Math.min(pwm, sm.pwmRange.max), sm.pwmRange.min);
	
		if(this.hardwareInterface.asyncPwmWrite){
			setTimeout(() => {
				this.writePwm(servo, pwm);
			}, 0);
		} else {
			this.writePwm(servo, pwm);
		}
	}

	setAngleRadians = (servo: Servo, angle: number) => {
		this.setAngleDegrees(servo, angle / Math.PI * 180);
	}

	private writePwm = (servo: Servo, pwm: number) => {
		pwm = Math.round(pwm);

		if(pwm === this.previousPwmValues[servo.channel]){
			return;
		}

		this.previousPwmValues[servo.channel] = pwm;
		this.hardwareInterface.pwmWriter.writePwm(servo.channel, pwm);
	}
}
