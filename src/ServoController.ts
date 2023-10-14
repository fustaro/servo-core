import { HardwareInterface } from "./HardwareInterface";
import { Servo } from "./Servo";
import { ServoDirection } from "./ServoDirection";

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

	private static dispose = (uniqueHardwareName: string): void => {
		ServoControllerFactory.controllers.delete(uniqueHardwareName);
	}
}

export interface IServoController {
	setAngleDegrees: (servo: Servo, angle: number, debug?: boolean) => void;
	setAngleRadians: (servo: Servo, angle: number, debug?: boolean) => void;
	disableServo: (servo: Servo, debug?: boolean) => void;
	enableServo: (servo: Servo, debug?: boolean) => void;
	isDisabled: (servo: Servo, debug?: boolean) => boolean;
	dispose: () => void;
}

class ServoController implements IServoController {
	readonly hardwareInterface: HardwareInterface;
	readonly previousPwmValues: number[];
	readonly disabledServos: boolean[];

	constructor(servoHardwareDriver: HardwareInterface){
		this.hardwareInterface = servoHardwareDriver;
		this.previousPwmValues = new Array<number>(servoHardwareDriver.channelCount);
		this.disabledServos = new Array<boolean>(servoHardwareDriver.channelCount);
	}

	setAngleDegrees = (servo: Servo, angle: number, debug: boolean = false) => {
		if(this.isDisabled(servo)){
			if(debug){
				console.debug("Servo disabled, cannot set angle");
			}
			return;
		}

		const sm = servo.servoModel;
		let flip = servo.flipDirection;

		if(servo.servoModel.servoDirection == ServoDirection.LOWER_PWM_CLOCKWISE) flip = !flip;

		if(isNaN(angle)) angle = 0;

		let debugMessage;

		if(debug){
			debugMessage = `Servo: setAngleDegrees: ${angle}deg, hardware: ${this.hardwareInterface.uniqueHardwareName}, channel: ${servo.channel}\n`;
		}

		if(servo.angleClamp?.min){
			angle = Math.max(angle, servo.angleClamp.min);
			debugMessage += `-- angle clamping set on min: (${servo.angleClamp.min})deg, result: ${angle}deg\n`;
		}

		if(servo.angleClamp?.max){
			angle = Math.min(angle, servo.angleClamp.max);
			debugMessage += `-- angle clamping set on max: (${servo.angleClamp.max})deg, result: ${angle}deg\n`;
		}

		if(debug && !servo.angleClamp?.min && !servo.angleClamp?.max){
			debugMessage += `-- no angle clamping set on servo\n`;
		}

		const angleRange = angle < 0 ? sm.angleRange.min : sm.angleRange.max;
		const pwmRange = (flip ? -angle : angle) < 0 ? sm.pwmRange.min : sm.pwmRange.max;

		if(debug){
			if(angle < 0){
				debugMessage += `-- angle < 0, using min angle range to calculate pwm ratio: ${angleRange}\n`;
			} else {
				debugMessage += `-- angle >= 0, using max angle range to calculate pwm ratio: ${angleRange}\n`;
			}

			if(flip){
				debugMessage += `-- flipDirection is set, using opposite pwm range for calculations: ${pwmRange}\n`;
			} else {
				debugMessage += `-- flipDirection not set, using pwm range for calculations: ${pwmRange}\n`;
			}
		}
	
		const pwmDiff = pwmRange - sm.pwmRange.natural;
		
		let pwm = sm.pwmRange.natural + pwmDiff * (angle / angleRange);

		if(debug){
			debugMessage += `-- angle as ratio of angleRange: ${(angle / angleRange)}, natural (home) pwm: ${sm.pwmRange.natural}, calculated pwm: ${pwm}\n`;
		}

		pwm += servo.centerOffsetPwm;

		if(debug){
			if(servo.centerOffsetPwm != 0){
				debugMessage += `-- centerOffsetPwm: ${servo.centerOffsetPwm}, adjusted output pwm: ${pwm}\n`;
			} else {
				debugMessage += `-- no centerOffsetPwm set on servo\n`;
			}
		}

		pwm = Math.max(Math.min(pwm, sm.pwmRange.max), sm.pwmRange.min);

		if(debug){
			debugMessage += `-- final pwm: ${pwm}, clamped to ${sm.pwmRange.min} - ${sm.pwmRange.max}\n`;
			console.debug(debugMessage);
		}
	
		if(this.hardwareInterface.asyncPwmWrite){
			setTimeout(() => {
				this.writePwm(servo, pwm);
			}, 0);
		} else {
			this.writePwm(servo, pwm);
		}
	}

	setAngleRadians = (servo: Servo, angle: number, debug: boolean = false) => {
		this.setAngleDegrees(servo, angle / Math.PI * 180, debug);
	}

	disableServo = (servo: Servo, debug?: boolean) => {
		if(debug){
			console.log(`ServoController: disableServo: hardware: ${this.hardwareInterface.uniqueHardwareName}, channel: ${servo.channel}`);
		}

		if(!this.hardwareInterface.servoDriver.disableServo){
			if(debug){
				console.warn(`ServoController: Unable to disable servo, hardware ${this.hardwareInterface.uniqueHardwareName} has no implementation`);
			}
			return;
		}

		if(this.hardwareInterface.asyncPwmWrite){
			setTimeout(() => {
				this.hardwareInterface.servoDriver.disableServo(servo.channel);
				this.disabledServos[servo.channel] = true;
			}, 0);
		} else {
			this.hardwareInterface.servoDriver.disableServo(servo.channel);
			this.disabledServos[servo.channel] = true;
		}
	}

	enableServo = (servo: Servo, debug?: boolean) => {
		if(debug){
			console.log(`ServoController: enableServo: hardware: ${this.hardwareInterface.uniqueHardwareName}, channel: ${servo.channel}`);
		}

		if(!this.hardwareInterface.servoDriver.enableServo){
			if(debug){
				console.warn(`ServoController: Unable to enable servo, hardware ${this.hardwareInterface.uniqueHardwareName} has no implementation`);
			}
			return;
		}

		if(this.hardwareInterface.asyncPwmWrite){
			setTimeout(() => {
				this.hardwareInterface.servoDriver.enableServo(servo.channel);
				this.disabledServos[servo.channel] = false;
			}, 0);
		} else {
			this.hardwareInterface.servoDriver.enableServo(servo.channel);
			this.disabledServos[servo.channel] = false;
		}
	}

	isDisabled = (servo: Servo, debug?: boolean) => {
		const disabled = !!this.disabledServos[servo.channel];
		if(debug){
			console.log(`ServoController: isDisabled: hardware: ${this.hardwareInterface.uniqueHardwareName}, channel: ${servo.channel}, disabled: ${disabled}`);
		}
		return disabled;
	}
	
	dispose = (debug?: boolean) => {
		if(debug){
			console.log(`ServoController: dispose called`);
		}

		this.hardwareInterface.servoDriver.dispose();
		ServoControllerFactory['dispose'](this.hardwareInterface.uniqueHardwareName);
	}

	private writePwm = (servo: Servo, pwm: number) => {
		pwm = Math.round(pwm);

		if(pwm === this.previousPwmValues[servo.channel]){
			return;
		}

		this.previousPwmValues[servo.channel] = pwm;
		this.hardwareInterface.servoDriver.writePwm(servo.channel, pwm);
	}
}
