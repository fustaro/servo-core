export interface PwmWriter {
	writePwm: (channel: number, pwm: number, callback?: Function) => void;
}

export class HardwareInterface {
	readonly uniqueHardwareName: string;
	readonly pwmWriter: PwmWriter;
	readonly asyncPwmWrite: boolean;
	readonly chanelCount: number;

	constructor(pwmWriter: PwmWriter, uniqueHardwareName: string, channelCount: number, asyncPwmWrite: boolean) {
		this.pwmWriter = pwmWriter;
		this.asyncPwmWrite = asyncPwmWrite;
		this.uniqueHardwareName = uniqueHardwareName;
		this.chanelCount = channelCount;
	}
}
