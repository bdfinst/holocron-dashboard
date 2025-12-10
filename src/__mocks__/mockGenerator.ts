/**
 * module contains all the functions
 * used for mocking random data that
 * we do not care about.
 */
const MINUTES_IN_A_YEAR = 525600

const mockGetRandNumbBtw0And1 = () => {
	const arr = new Uint32Array(2)
	crypto.getRandomValues(arr)
	
	// keep all 32 bits of the the first, top 20 of the second for 52 random bits
	const mantissa = (arr[0] * Math.pow(2,20)) + (arr[1] >>> 12)
	
	// shift all 52 bits to the right of the decimal point
	return mantissa * Math.pow(2,-52)
}

export const mockUnixTimeMilliSecs = (minutesAgo=10) => {
	const nowUnixMilliSecs = new Date().getTime()
	const minsAgoUnixMillSecs = nowUnixMilliSecs - (minutesAgo * 60 * 1000)
	return new Date(minsAgoUnixMillSecs).getTime()
}

export const mockUnixTimeSecs = (minutesAgo=10) => {
	return Math.floor(mockUnixTimeMilliSecs(minutesAgo) / 1000)
}

// from stackoverflow generating random number with crypto
// used for mocks only.
export const mockRandInt = (min: number, max: number): number => {       
	// Create byte array and fill with 1 random number
	const byteArray = new Uint8Array(1)
	crypto.getRandomValues(byteArray)

	const range = max - min + 1
	const max_range = 256
	if (byteArray[0] >= Math.floor(max_range / range) * range) {
		return mockRandInt(min, max)
	}
	return min + (byteArray[0] % range)
}

export const mockRandDate = (start=new Date(mockUnixTimeMilliSecs(MINUTES_IN_A_YEAR)),
	 end=new Date()) =>
	 new Date(start.getTime() + mockGetRandNumbBtw0And1() * (end.getTime() - start.getTime()))