import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { performanceMonitor } from '../../utils/performance';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    performanceMonitor.logMetric({
      type: 'error',
      duration: 0,
      componentName: 'ErrorBoundary',
      error: {
        message: error.message,
        stack: error.stack || undefined,
        componentStack: errorInfo.componentStack || undefined,
      },
    });
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We apologize for the inconvenience. The app has encountered an unexpected error.
            </Text>
            {__DEV__ && this.state.error && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                <Text style={styles.stackTrace}>{this.state.error.stack}</Text>
              </View>
            )}
            <Button
              mode="contained"
              onPress={this.handleRestart}
              style={styles.button}
            >
              Try Again
            </Button>
            <Text style={styles.supportText}>
              If the problem persists, please restart the app or contact support.
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#d32f2f',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  debugInfo: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 24,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 8,
  },
  stackTrace: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  button: {
    marginBottom: 16,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ErrorBoundary; 