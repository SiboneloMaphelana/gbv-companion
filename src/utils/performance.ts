import React from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

interface ErrorInfo {
  message: string;
  stack?: string | null;
  componentStack?: string;
}

interface PerformanceMetric {
  timestamp: number;
  type: string;
  duration: number;
  memoryUsage?: number;
  componentName?: string;
  error?: ErrorInfo;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_LOGS = 1000;
  private readonly FLUSH_THRESHOLD = 100;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  async logMetric(metric: Omit<PerformanceMetric, 'timestamp'>) {
    const newMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(newMetric);

    if (this.metrics.length >= this.FLUSH_THRESHOLD) {
      await this.flushMetrics();
    }
  }

  private async flushMetrics() {
    if (!this.metrics.length) return;

    try {
      const logFile = `${FileSystem.documentDirectory}performance_${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(
        logFile,
        JSON.stringify(this.metrics),
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      this.metrics = [];

      // Clean up old logs
      await this.cleanOldLogs();
    } catch (error) {
      console.error('Error flushing performance metrics:', error);
    }
  }

  private async cleanOldLogs() {
    try {
      const directory = FileSystem.documentDirectory;
      const files = await FileSystem.readDirectoryAsync(directory!);
      const perfLogs = files.filter(f => f.startsWith('performance_'));

      if (perfLogs.length > this.MAX_LOGS) {
        const sortedLogs = perfLogs.sort();
        const logsToDelete = sortedLogs.slice(0, sortedLogs.length - this.MAX_LOGS);

        await Promise.all(
          logsToDelete.map(log => 
            FileSystem.deleteAsync(`${directory}${log}`, { idempotent: true })
          )
        );
      }
    } catch (error) {
      console.error('Error cleaning performance logs:', error);
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Higher-order component for monitoring component performance
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return class PerformanceWrapper extends React.Component<P> {
    componentDidMount() {
      performanceMonitor.logMetric({
        type: 'mount',
        duration: 0,
        componentName,
      });
    }

    componentWillUnmount() {
      performanceMonitor.logMetric({
        type: 'unmount',
        duration: 0,
        componentName,
      });
    }

    render() {
      return React.createElement(WrappedComponent, this.props);
    }
  };
} 