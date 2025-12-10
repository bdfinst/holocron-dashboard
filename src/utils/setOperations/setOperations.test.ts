import setEqual from '.'

describe('setEqual', () => {
  it('empty sets should be equal', () => {
    expect(setEqual<{ foo: string }>([], [], i => i.foo)).toBe(true)
  })

  it('sets with unequal lengths should be not equal', () => {
    expect(setEqual<{ foo: string }>([{ foo: 'bar' }], [], i => i.foo)).toBe(
      false,
    )
    expect(setEqual<{ foo: string }>([], [{ foo: 'bar' }], i => i.foo)).toBe(
      false,
    )
  })

  it('sets with equal lengths and values should be equal', () => {
    expect(
      setEqual<{ foo: string }>(
        [{ foo: 'bar' }, { foo: 'baz' }],
        [{ foo: 'bar' }, { foo: 'baz' }],
        i => i.foo,
      ),
    ).toBe(true)
    expect(
      setEqual<{ foo: string }>([{ foo: 'bar' }], [{ foo: 'bar' }], i => i.foo),
    ).toBe(true)
  })
})
