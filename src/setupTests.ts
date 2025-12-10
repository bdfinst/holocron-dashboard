// file for setting up test mocks
import React from 'react'

/* global globalThis */
globalThis.IS_REACT_ACT_ENVIRONMENT = true
/* This should be removed once files are properly updated to jsx/tsx */
globalThis.React = React

// mocking global crypto for tests.
window.crypto = {
  getRandomValues: buffer => buffer,
} as Crypto
