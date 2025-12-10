import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import Main from 'ui/Main'
import ThemeWrapper from 'utils/ThemeWrapper'
import { ErrorBoundary } from 'react-error-boundary'
import globalConfig from 'globalConfig'

const App: React.FC = () => (
  <ErrorBoundary
    fallback={
      <>
        <h1 aria-label="Unknown Issue Title">We seem to be having an issue.</h1>
        <p>{globalConfig.UI_SETTINGS.APP_UNKNOWN_ERR_MSG}</p>
      </>
    }
  >
    <Router>
      <ThemeWrapper>
        <Main />
      </ThemeWrapper>
    </Router>
  </ErrorBoundary>
)

export default App
