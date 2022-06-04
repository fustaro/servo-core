export interface ServoDriver {
	writePwm: (channel: number, pwm: number, callback?: Function) => void;
	disableServo?: (channel: number) => void;
	enableServo?: (channel: number) => void;
	dispose: () => void;
}

export class HardwareInterface {
	readonly uniqueHardwareName: string;
	readonly servoDriver: ServoDriver;
	readonly asyncPwmWrite: boolean;
	readonly channelCount: number;

	constructor(servoDriver: ServoDriver, uniqueHardwareName: string, channelCount: number, asyncPwmWrite: boolean) {
		this.servoDriver = servoDriver;
		this.asyncPwmWrite = asyncPwmWrite;
		this.uniqueHardwareName = uniqueHardwareName;
		this.channelCount = channelCount;
	}
}
