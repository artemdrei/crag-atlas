import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // TODO: wire up error reporting (@crag-atlas/utils reporter) once it exists
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p>Something went wrong.</p>
          <button type="button" onClick={this.handleReload}>
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
