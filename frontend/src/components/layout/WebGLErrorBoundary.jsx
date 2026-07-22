import React from 'react';

export default class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error) {
    console.warn('[WebGL] Canvas crashed:', error.message);
  }

  render() {
    if (this.state.crashed) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
