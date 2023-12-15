export interface DeviceAuthObj {
	device_code: string;
	user_code: string;
	verification_url: string;
	expires_in: number;
	interval: number;
}

export type VerifyDeviceData = {
	user_code: string;
	verification_url: string;
};
