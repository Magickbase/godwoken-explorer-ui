import React from 'react'

class ErrorBoundary extends React.Component<{}, { hasError: boolean; message: string }> {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      message: '',
    }
  }

  static getDerivedStateFromError = (error: Error) => {
    return {
      hasError: true,
      message: error.message ?? '',
    }
  }

  componentDidCatch = (error, info) => {
    console.warn(error, info)
    window.location.href = `/error?message=${error.message}`
  }

  render = () => {
    if (this.state.hasError) {
      return <h1 className="w-full text-center text-2xl mt-24">{this.state.message ?? 'Unknown errors'}</h1>
    }
    return this.props.children
  }
}

export default ErrorBoundary
