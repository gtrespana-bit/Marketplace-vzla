import { FALLBACK_BCV_RATE, usdToBs } from '../../src/lib/tasaBCV'

describe('tasa BCV', () => {
  it('uses one current contingency rate', () => expect(FALLBACK_BCV_RATE).toBe(746))
  it('converts USD to bolívares rounding to cents', () => expect(usdToBs(2.5, 746.123)).toBe(1865.31))
})
