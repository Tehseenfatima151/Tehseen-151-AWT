import { Component } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-sky-900 px-4 text-white">
          <AlertTriangle className="mb-4 h-14 w-14 text-amber-400" aria-hidden />
          <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
          <p className="mt-2 max-w-md text-center text-sm text-sky-100/90">
            An unexpected error occurred. You can try again or return home.
          </p>
          {this.state.error && (
            <pre className="mt-4 max-w-2xl max-h-60 overflow-auto rounded-xl bg-black/50 p-4 text-left text-xs font-mono text-red-400 border border-red-500/20 whitespace-pre-wrap">
              {this.state.error.toString()}
              {"\n\n"}
              {this.state.error.stack}
            </pre>
          )}
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-6 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-900/40 transition hover:bg-sky-400"
          >
            Try again
          </button>
          <Link
            to="/"
            className="mt-3 text-sm font-medium text-sky-200 underline-offset-4 hover:text-white hover:underline"
          >
            Back to home
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}
